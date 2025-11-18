import dotenv from 'dotenv';
import express from 'express';
import amqp from 'amqplib';
import { createClient } from 'redis';
import crypto from 'crypto';
dotenv.config();

const PORT = process.env.PORT || 3001;
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
}

async function connectRedis() {
  redis = createClient({ url: REDIS_URL });
  redis.on('error', err => console.error(`Redis Client Error with ${REDIS_URL}`, err));
  redis.on('connect', () => console.log('Connected to Redis'));
  await redis.connect();
}

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    channel.publish('events', '', Buffer.from(JSON.stringify({ type: 'user.login_failed', username })));
    return res.status(400).json({ error: 'Username and password required' });
  }
  // Generate token
  const token = crypto.randomBytes(16).toString('hex');
  await redis.set(`user:${username}`, token);
  channel.publish('events', '', Buffer.from(JSON.stringify({ type: 'user.logged_in', username, token })));
  res.json({ message: `User ${username} logged in`, token });
});

app.post('/logout', async (req, res) => {
  const { username, token } = req.body;
  if (!username || !token) {
    channel.publish('events', '', Buffer.from(JSON.stringify({ type: 'user.logout_failed', username })));
    return res.status(400).json({ error: 'Username and token required' });
  }
  const storedToken = await redis.get(`user:${username}`);
  if (storedToken !== token) {
    channel.publish('events', '', Buffer.from(JSON.stringify({ type: 'user.logout_failed', username })));
    return res.status(401).json({ error: 'Invalid token' });
  }
  await redis.del(`user:${username}`);
  channel.publish('events', '', Buffer.from(JSON.stringify({ type: 'user.logged_out', username })));
  res.json({ message: `User ${username} logged out` });
});

Promise.all([connectRabbitMQ(), connectRedis()]).then(() => {
  app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
  });
}).catch(console.error);
