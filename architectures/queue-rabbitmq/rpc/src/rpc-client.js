import amqp from 'amqplib';
import { randomUUID } from 'crypto';
import { config } from './config/config.js';

class RPCClient {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queue = config.rabbitmq.rpc.queue;
    this.callbacks = new Map(); // To store response callbacks
    this.correlationId = null;
    this.responseQueue = null;
  }

  async connect() {
    try {
      // Establish connection to RabbitMQ
      this.connection = await amqp.connect({
        protocol: config.rabbitmq.protocol,
        hostname: config.rabbitmq.hostname,
        port: config.rabbitmq.port,
        username: config.rabbitmq.username,
        password: config.rabbitmq.password,
        vhost: config.rabbitmq.vhost,
      });

      // Create a channel
      this.channel = await this.connection.createChannel();
      
      // Assert the RPC queue
      await this.channel.assertQueue(this.queue, {
        durable: config.rabbitmq.rpc.options.durable,
      });

      // Create a temporary queue for responses
      const { queue } = await this.channel.assertQueue('', {
        exclusive: true,
        autoDelete: true,
      });
      this.responseQueue = queue;

      // Consume responses from the temporary queue
      this.channel.consume(
        this.responseQueue,
        (msg) => {
          if (!msg) return;
          
          const correlationId = msg.properties.correlationId;
          const callback = this.callbacks.get(correlationId);
          
          if (callback) {
            if (msg.properties.headers.error) {
              callback.reject(new Error(msg.content.toString()));
            } else {
              try {
                const content = JSON.parse(msg.content.toString());
                callback.resolve(content);
              } catch (error) {
                callback.reject(new Error('Invalid response format'));
              }
            }
            this.callbacks.delete(correlationId);
          }
          
          // Acknowledge the message
          this.channel.ack(msg);
        },
        { noAck: false }
      );

      console.log(' [x] RPC Client connected');
      
    } catch (error) {
      console.error('RPC Client connection error:', error);
      await this.close();
      throw error;
    }
  }

  async call(method, params = {}, timeout = config.app.requestTimeout) {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ. Call connect() first.');
    }

    const correlationId = randomUUID();
    const request = { method, params };
    
    return new Promise((resolve, reject) => {
      // Store the callback for this request
      this.callbacks.set(correlationId, { resolve, reject });
      
      // Set a timeout for the request
      const timeoutId = setTimeout(() => {
        this.callbacks.delete(correlationId);
        reject(new Error(`RPC call timed out after ${timeout}ms`));
      }, timeout);
      
      // Send the RPC request
      try {
        this.channel.sendToQueue(
          this.queue,
          Buffer.from(JSON.stringify(request)),
          {
            correlationId,
            replyTo: this.responseQueue,
            contentType: 'application/json',
            expiration: timeout.toString(),
            persistent: true,
          }
        );
        
        // Clear the timeout if the response is received in time
        this.callbacks.get(correlationId).resolve = (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        };
        
        this.callbacks.get(correlationId).reject = (error) => {
          clearTimeout(timeoutId);
          reject(error);
        };
        
      } catch (error) {
        this.callbacks.delete(correlationId);
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    this.callbacks.clear();
    console.log(' [x] RPC Client connection closed');
  }
}

// Example usage
async function runExample() {
  const client = new RPCClient();
  
  try {
    // Connect to RabbitMQ
    await client.connect();
    
    // Make some RPC calls
    console.log(' [x] Making RPC calls...');
    
    // Example 1: Add two numbers
    const addResult = await client.call('add', { a: 5, b: 3 });
    console.log(' [.] 5 + 3 =', addResult.result);
    
    // Example 2: Multiply two numbers
    const multiplyResult = await client.call('multiply', { a: 4, b: 6 });
    console.log(' [.] 4 * 6 =', multiplyResult.result);
    
    // Example 3: Echo a message
    const echoResult = await client.call('echo', { message: 'Hello, RabbitMQ RPC!' });
    console.log(' [.] Echo:', echoResult.result);
    
    // Example 4: Get current time
    const timeResult = await client.call('getTime', {});
    console.log(' [.] Current time:', timeResult.result);
    
    // Example 5: Unknown method (will throw an error)
    try {
      await client.call('unknownMethod', { some: 'data' });
    } catch (error) {
      console.log(' [x] Expected error for unknown method:', error.message);
    }
    
  } catch (error) {
    console.error('RPC Client error:', error);
  } finally {
    // Close the connection
    await client.close();
    process.exit(0);
  }
}

// Run the example if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runExample().catch(console.error);
}

export default RPCClient;
