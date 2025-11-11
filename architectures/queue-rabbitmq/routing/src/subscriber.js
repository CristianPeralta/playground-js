import { connectToRabbitMQ, getChannel, getExchangeName, getQueueName } from './config/rabbitmq.js';

// Get the log types to subscribe to from command line arguments
const args = process.argv.slice(2);
const logTypes = args.length > 0 ? args : ['error', 'warn', 'info'];

async function startSubscriber() {
  try {
    await connectToRabbitMQ();
    const channel = getChannel();
    const exchange = getExchangeName();
    const queueName = getQueueName('logs');
    
    console.log(`Subscribing to log types: ${logTypes.join(', ')}`);
    
    // Assert the queue
    const { queue } = await channel.assertQueue(queueName, { exclusive: true });
    
    // Bind the queue to the exchange for each log type
    for (const severity of logTypes) {
      await channel.bindQueue(queue, exchange, severity);
      console.log(` [*] Waiting for ${severity} logs.`);
    }
    
    // Set up consumer
    await channel.consume(queue, (msg) => {
      if (msg !== null) {
        try {
          const logEntry = JSON.parse(msg.content.toString());
          const { type, timestamp, message, id } = logEntry;
          
          // Color codes for different log types
          const colors = {
            error: '\x1b[31m', // red
            warn: '\x1b[33m',  // yellow
            info: '\x1b[36m',  // cyan
            reset: '\x1b[0m'   // reset
          };
          
          const logColor = colors[type] || colors.reset;
          
          console.log(
            `${logColor}[${new Date(timestamp).toISOString()}] ` +
            `[${type.toUpperCase()}] [${id}] ${message}${colors.reset}`
          );
          
          // Acknowledge the message
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          channel.nack(msg, false, false); // Reject and don't requeue
        }
      }
    }, {
      noAck: false // Manual acknowledgment
    });
    
    console.log('Subscriber started. Press Ctrl+C to exit.');
    
  } catch (error) {
    console.error('Error in subscriber:', error);
    await closeConnection();
    process.exit(1);
  }
}

startSubscriber();

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nStopping subscriber...');
  await closeConnection();
  process.exit(0);
});
