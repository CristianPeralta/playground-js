import amqp from 'amqplib';
import config from './config.js';

async function consumeMessages() {
  try {
    // Connect to RabbitMQ server
    const connection = await amqp.connect({
      protocol: 'amqp',
      hostname: config.connection.hostname,
      port: config.connection.port,
      username: config.connection.username,
      password: config.connection.password,
      vhost: config.connection.vhost,
    });

    // Create a channel
    const channel = await connection.createChannel();
    
    // Assert the queue exists
    await channel.assertQueue(config.queue.name, { durable: config.queue.durable });
    
    console.log(`[*] Waiting for messages in ${config.queue.name}. To exit press CTRL+C`);
    
    // Set up message consumption
    channel.consume(
      config.queue.name,
      (message) => {
        if (message !== null) {
          try {
            const content = JSON.parse(message.content.toString());
            console.log(`[x] Received: ${JSON.stringify(content)}`);
            
            // Acknowledge the message (remove it from the queue)
            channel.ack(message);
          } catch (error) {
            console.error('Error processing message:', error);
            // Reject the message and don't requeue it
            channel.nack(message, false, false);
          }
        }
      },
      { noAck: false } // Manual acknowledgment
    );
    
    // Handle process termination
    process.on('SIGINT', async () => {
      console.log('\nClosing connection...');
      await channel.close();
      await connection.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the consumer
consumeMessages();
