import { rabbitMQ } from './api/rabbitmq.js';
import { config } from './config/config.js';
import chalk from 'chalk';

const { exchange, queue } = config.rabbitmq;

async function startSubscriber() {
  try {
    const channel = await rabbitMQ.connect();
    
    // Assert the exchange (in case publisher hasn't run yet)
    await channel.assertExchange(
      exchange.name,
      exchange.type,
      exchange.options
    );
    
    // Assert a queue with a random name (exclusive)
    const q = await channel.assertQueue(queue.name, queue.options);
    
    // Bind the queue to the exchange with each routing key pattern
    for (const pattern of queue.bindingKeys) {
      await channel.bindQueue(q.queue, exchange.name, pattern);
      console.log(chalk.blue(`🔗 Queue bound with pattern: ${chalk.yellow(pattern)}`));
    }
    
    console.log(chalk.green.bold('\n👂 Waiting for messages. To exit press CTRL+C\n'));
    
    // Set up consumer
    channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          const { routingKey, message, timestamp } = content;
          
          // Color code based on routing key
          let color = 'white';
          if (routingKey.includes('error')) color = 'red';
          else if (routingKey.includes('warn')) color = 'yellow';
          else if (routingKey.includes('info')) color = 'blue';
          else if (routingKey.includes('notification')) color = 'magenta';
          else if (routingKey.startsWith('user.')) color = 'cyan';
          else if (routingKey.startsWith('order.')) color = 'green';
          
          console.log(
            chalk.gray(`[${timestamp}]`),
            chalk.yellow(`[${routingKey}]`),
            chalk[color](message)
          );
          
          // Acknowledge the message
          channel.ack(msg);
        } catch (error) {
          console.error(chalk.red('Error processing message:'), error);
          channel.nack(msg, false, false); // Reject and don't requeue
        }
      }
    }, { noAck: false });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n👋 Closing subscriber...'));
      await rabbitMQ.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error(chalk.red('Error in subscriber:'), error);
    process.exit(1);
  }
}

startSubscriber();
