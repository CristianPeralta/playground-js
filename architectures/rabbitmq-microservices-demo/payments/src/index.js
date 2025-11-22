import dotenv from 'dotenv';
import express from 'express';
import amqp from 'amqplib';
import { createClient } from 'redis';
dotenv.config();

const PORT = process.env.PORT || 3002;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const app = express();
app.use(express.json());

let channel;
let redis;

async function connectRabbitMQ() {
  const conn = await amqp.connect(RABBITMQ_URL).catch(e => console.error(`Failed to connect to RabbitMQ using ${RABBITMQ_URL}`, e));
  channel = await conn.createChannel();
  await channel.assertExchange('events', 'fanout', { durable: false });
  console.log('Connected to RabbitMQ');

  // Consume user.logged_in events (optional, for logging)
  const q = await channel.assertQueue('', { exclusive: true });
  channel.bindQueue(q.queue, 'events', '');
  channel.consume(q.queue, msg => {
    if (msg) {
      const event = JSON.parse(msg.content.toString());
      if (event.type === 'user.logged_in') {
        console.log(`[payments] User logged in:`, event.username);
      }
    }
  }, { noAck: true });
}

async function connectRedis() {
  redis = createClient({ url: REDIS_URL });
  redis.on('error', err => console.error(`Redis Client Error with ${REDIS_URL}`, err));
  redis.on('connect', () => console.log('Connected to Redis'));
  await redis.connect();
}

app.post('/pay', async (req, res) => {
  const { username, token, amount } = req.body;
  if (!username || !token || !amount) {
    channel.publish('events', '', Buffer.from(JSON.stringify({ type: 'payment.failed', username, amount, reason: 'Missing fields' })));
    return res.status(400).json({ error: 'Username, token, and amount required' });
  }
  const storedToken = await redis.get(`user:${username}`);
  if (storedToken !== token) {
    channel.publish('events', '', Buffer.from(JSON.stringify({ type: 'payment.failed', username, amount, reason: 'Not logged in or invalid token' })));
    return res.status(401).json({ error: 'User not logged in or invalid token' });
  }
  channel.publish('events', '', Buffer.from(JSON.stringify({ type: 'payment.completed', username, amount })));
  res.json({ message: `Payment of $${amount} by ${username} processed` });
});

Promise.all([connectRabbitMQ(), connectRedis()]).then(() => {
  app.listen(PORT, () => {
    console.log(`Payments service running on port ${PORT}`);
  });
}).catch(console.error);
