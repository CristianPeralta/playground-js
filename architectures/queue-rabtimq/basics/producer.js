const amqp = require('amqplib');
const config = require('./config');

async function sendMessage() {
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
    
    // Assert a queue exists or create it if it doesn't
    await channel.assertQueue(config.queue.name, { durable: config.queue.durable });
    
    // Generate a sample message
    const message = {
      id: Date.now(),
      content: 'Hello, RabbitMQ!',
      timestamp: new Date().toISOString()
    };
    
    // Send message to the queue
    const sent = channel.sendToQueue(
      config.queue.name,
      Buffer.from(JSON.stringify(message)),
      { persistent: config.queue.durable }
    );
    
    if (sent) {
      console.log(`[x] Sent: ${JSON.stringify(message)}`);
    } else {
      console.error('Message was not sent to the queue');
    }
    
    // Close the connection after a short delay
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the producer
sendMessage();
