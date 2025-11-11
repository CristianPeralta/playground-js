import amqp from 'amqplib';
import 'dotenv/config';

const { RABBITMQ_URL, RABBITMQ_EXCHANGE, RABBITMQ_QUEUE_PREFIX } = process.env;

let connection;
let channel;

export async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Assert the exchange
    await channel.assertExchange(RABBITMQ_EXCHANGE, 'direct', { durable: false });
    
    console.log('Connected to RabbitMQ');
    return { connection, channel };
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    throw error;
  }
}

export function getChannel() {
  if (!channel) {
    throw new Error('Channel not initialized. Call connectToRabbitMQ first.');
  }
  return channel;
}

export function getExchangeName() {
  return RABBITMQ_EXCHANGE;
}

export function getQueueName(suffix = '') {
  return `${RABBITMQ_QUEUE_PREFIX}${suffix}`;
}

export async function closeConnection() {
  if (connection) {
    await connection.close();
    connection = null;
    channel = null;
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Closing RabbitMQ connection...');
  await closeConnection();
  process.exit(0);
});
