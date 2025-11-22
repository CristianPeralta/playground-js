import dotenv from 'dotenv';
import express from 'express';
import amqp from 'amqplib';
dotenv.config();

const PORT = process.env.PORT || 3003;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

const app = express();
app.use(express.json());

let channel;

async function connectRabbitMQ() {
  const conn = await amqp.connect(RABBITMQ_URL).catch(e => console.error(`Failed to connect to RabbitMQ using ${RABBITMQ_URL}`, e));
  channel = await conn.createChannel();
  await channel.assertExchange('events', 'fanout', { durable: false });
  console.log('Connected to RabbitMQ');

  // Consume all events
  const q = await channel.assertQueue('', { exclusive: true });
  channel.bindQueue(q.queue, 'events', '');
  channel.consume(q.queue, msg => {
    if (msg) {
      const event = JSON.parse(msg.content.toString());
      switch (event.type) {
        case 'user.logged_in':
          console.log(`[notifications] User logged in: ${event.username}`);
          break;
        case 'user.logged_out':
          console.log(`[notifications] User logged out: ${event.username}`);
          break;
        case 'user.login_failed':
          console.log(`[notifications] Login failed for: ${event.username}`);
          break;
        case 'payment.completed':
          console.log(`[notifications] Payment completed: $${event.amount} by ${event.username}`);
          break;
        case 'payment.failed':
          console.log(`[notifications] Payment failed for ${event.username}: ${event.reason}`);
          break;
        default:
          console.log(`[notifications] Event:`, event);
      }
    }
  }, { noAck: true });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

connectRabbitMQ().then(() => {
  app.listen(PORT, () => {
    console.log(`Notifications service running on port ${PORT}`);
  });
}).catch(console.error);
