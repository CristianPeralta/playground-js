import amqp from 'amqplib';
import { config } from './config/config.js';

class RPCServer {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queue = config.rabbitmq.rpc.queue;
  }

  async start() {
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

      // Set prefetch count to process one message at a time
      this.channel.prefetch(1);

      console.log(' [x] Awaiting RPC requests');
      
      // Consume messages from the RPC queue
      this.channel.consume(this.queue, async (msg) => {
        if (msg === null) return;

        const request = JSON.parse(msg.content.toString());
        console.log(' [.] Received:', request);

        try {
          // Process the request (in a real app, this would be your business logic)
          const result = await this.processRequest(request);
          
          // Send the response back to the reply queue
          this.channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(result)),
            {
              correlationId: msg.properties.correlationId,
              contentType: 'application/json',
            }
          );
          
          // Acknowledge the message
          this.channel.ack(msg);
          
        } catch (error) {
          console.error('Error processing RPC request:', error);
          // In a real app, you might want to handle errors differently
          this.channel.nack(msg, false, false); // Don't requeue on error
        }
      });

      console.log(` [*] RPC Server started. To exit press CTRL+C`);

    } catch (error) {
      console.error('RPC Server error:', error);
      await this.close();
      process.exit(1);
    }
  }

  async processRequest(request) {
    // Example RPC method handlers
    const { method, params } = request;
    
    switch (method) {
      case 'add':
        return { result: params.a + params.b };
        
      case 'multiply':
        return { result: params.a * params.b };
        
      case 'echo':
        return { result: params.message };
        
      case 'getTime':
        return { result: new Date().toISOString() };
        
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    console.log(' [x] RPC Server connection closed');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  const server = new RPCServer();
  await server.close();
  process.exit(0);
});

// Start the server if this file is run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const server = new RPCServer();
  server.start().catch(console.error);
}
