import dotenv from 'dotenv';
dotenv.config();
import { connectRabbitMQ } from './utils/connection.js';

const url = process.env.RABBITMQ_URL;
const queue = process.env.QUEUE_NAME;
const dlq = process.env.DLQ_NAME;
const retries = parseInt(process.env.RETRY_ATTEMPTS || '3', 10);

async function startConsumer() {
  while (true) {
    try {
      const conn = await connectRabbitMQ(url);
      conn.on('close', () => {
        console.error('Connection closed. Reconnecting consumer...');
      });
      const channel = await conn.createChannel();
      channel.on('close', () => {
        console.error('Channel closed. Restarting consumption loop...');
      });
      await channel.assertQueue(queue, { durable: true });
      await channel.assertQueue(dlq, { durable: true });
      channel.consume(queue, msg => {
        handleMessage(channel, msg);
      });
      // Mantener el proceso activo hasta que la conexión/canal se cierre
      await new Promise((res, rej) => {
        conn.on('close', res);
        conn.on('error', res);
        channel.on('error', res);
      });
    } catch (error) {
      console.error('Error in consumer, retrying in 5s:', error.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

async function handleMessage(channel, msg) {
  if (!msg) return;
  let attempts = 0;
  let processed = false;
  while (!processed && attempts < retries) {
    try {
      const content = msg.content.toString();
      if (content.includes('fail')) throw new Error('Simulated error');
      console.log('Processed:', content);
      channel.ack(msg);
      processed = true;
    } catch (err) {
      attempts++;
      console.log(`Error processing. Attempt ${attempts}/${retries}`);
      await new Promise(res => setTimeout(res, 500));
    }
  }
  if (!processed) {
    channel.sendToQueue(dlq, msg.content, { persistent: true });
    channel.ack(msg);
    console.log('Sent to DLQ:', msg.content.toString());
  }
}

startConsumer();
