import dotenv from 'dotenv';
dotenv.config();
import { connectRabbitMQ } from './utils/connection.js';

const url = process.env.RABBITMQ_URL;
const queue = process.env.QUEUE_NAME;

const input = process.argv[2];
const msg = input || `Test retry ${Date.now()}`;

const main = async () => {
  const conn = await connectRabbitMQ(url);
  const channel = await conn.createChannel();
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });
  console.log('Sent:', msg);
  setTimeout(() => process.exit(0), 500);
};

main();
