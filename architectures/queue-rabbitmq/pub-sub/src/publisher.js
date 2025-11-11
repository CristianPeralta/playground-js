import amqp from 'amqplib';
import config from './config/rabbitmq.js';

async function publishMessage() {
  try {
    const connection = await amqp.connect(config.rabbitmq.url);
    const channel = await connection.createChannel();
    
    const exchange = config.rabbitmq.exchange.name;
    
    // Assert the exchange
    await channel.assertExchange(exchange, 'fanout', { durable: false });
    
    // Generate a message
    const message = process.argv.slice(2).join(' ') || 'Hello, subscribers!';
    
    // Publish the message to the exchange
    channel.publish(exchange, '', Buffer.from(message));
    console.log(` [x] Sent '${message}'`);
    
    // Close the connection after a short delay to ensure the message is sent
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error('Error in publisher:', error);
    process.exit(1);
  }
}

publishMessage();
