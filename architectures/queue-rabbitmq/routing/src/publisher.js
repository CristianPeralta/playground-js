import { connectToRabbitMQ, getChannel, getExchangeName, closeConnection } from './config/rabbitmq.js';
import { randomUUID } from 'crypto';

const logTypes = ['error', 'warn', 'info'];
const messages = [
  'User login failed',
  'New user registered',
  'Database connection lost',
  'Cache cleared',
  'Payment processed',
  'Invalid request received'
];

async function publishMessages() {
  try {
    await connectToRabbitMQ();
    const channel = getChannel();
    const exchange = getExchangeName();
    
    console.log('Publisher started. Press Ctrl+C to exit.');
    
    // Publish messages every 2 seconds
    const interval = setInterval(async () => {
      try {
        const severity = logTypes[Math.floor(Math.random() * logTypes.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];
        const msgId = randomUUID().substring(0, 8);
        
        const logEntry = {
          id: msgId,
          timestamp: new Date().toISOString(),
          type: severity,
          message,
          details: `Additional details for ${severity} message ${msgId}`
        };
        
        channel.publish(
          exchange,
          severity, // routing key
          Buffer.from(JSON.stringify(logEntry)),
          { persistent: true }
        );
        
        console.log(` [x] Sent ${severity}: '${message}'`);
      } catch (error) {
        console.error('Error publishing message:', error);
      }
    }, 2000);
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      clearInterval(interval);
      await closeConnection();
      console.log('Publisher stopped');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error in publisher:', error);
    await closeConnection();
    process.exit(1);
  }
}

publishMessages();
