import dotenv from 'dotenv';
dotenv.config();
import { connectRabbitMQ } from './utils/connection.js';

const url = process.env.RABBITMQ_URL;
const dlq = process.env.DLQ_NAME;

async function startDlqConsumer() {
  while (true) {
    try {
      const conn = await connectRabbitMQ(url);
      conn.on('close', () => {
        console.error('Connection closed. Reconnecting DLQ-consumer...');
      });
      const channel = await conn.createChannel();
      channel.on('close', () => {
        console.error('Channel closed. Restarting DLQ consume loop...');
      });
      await channel.assertQueue(dlq, { durable: true });
      channel.consume(dlq, msg => {
        if (!msg) return;
        console.log('DLQ message:', msg.content.toString());
        channel.ack(msg);
      });
      // Mantener el proceso vivo hasta que conexión/canal cierren
      await new Promise((res, rej) => {
        conn.on('close', res);
        conn.on('error', res);
        channel.on('error', res);
      });
    } catch (error) {
      console.error('Error in DLQ-consumer, retrying in 5s:', error.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

startDlqConsumer();
