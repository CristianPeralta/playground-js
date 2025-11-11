import { rabbitMQ } from './api/rabbitmq.js';
import { config } from './config/config.js';
import chalk from 'chalk';

const { exchange, queue } = config.rabbitmq;

async function publishMessages() {
  try {
    const channel = await rabbitMQ.connect();
    
    // Example messages with different routing keys
    const messages = [
      { routingKey: 'user.created', message: 'New user created: John Doe' },
      { routingKey: 'user.deleted', message: 'User deleted: Jane Smith' },
      { routingKey: 'order.placed', message: 'New order #1234 placed' },
      { routingKey: 'order.shipped', message: 'Order #1234 has been shipped' },
      { routingKey: 'payment.received', message: 'Payment received for order #1234' },
      { routingKey: 'system.error', message: 'Critical error in payment service' },
      { routingKey: 'auth.notification.email', message: 'Verification email sent' },
      { routingKey: 'order.notification.sms', message: 'SMS sent for order #1234' }
    ];

    console.log(chalk.blue.bold('\n📤 Publishing messages with different routing keys:\n'));
    
    for (const { routingKey, message } of messages) {
      const msg = JSON.stringify({ 
        timestamp: new Date().toISOString(),
        message,
        routingKey
      });
      
      channel.publish(exchange.name, routingKey, Buffer.from(msg));
      console.log(chalk.gray(`[${new Date().toISOString()}]`), 
                chalk.cyan(`[${routingKey}]`), 
                chalk.white(message));
      
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(chalk.green.bold('\n✅ All messages published successfully!'));
    
    // Close the connection after publishing
    setTimeout(() => {
      rabbitMQ.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error(chalk.red('Error in publisher:'), error);
    process.exit(1);
  }
}

publishMessages();
