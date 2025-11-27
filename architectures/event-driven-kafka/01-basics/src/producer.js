import { Kafka } from 'kafkajs';
import config from './config.js';

async function runProducer() {
  const kafka = new Kafka({
    clientId: config.clientId,
    brokers: config.brokers,
  });

  const producer = kafka.producer();

  try {
    await producer.connect();

    const message = {
      id: Date.now(),
      content: 'Hello, Kafka!',
      timestamp: new Date().toISOString(),
    };

    const result = await producer.send({
      topic: config.topic,
      messages: [
        {
          key: String(message.id),
          value: JSON.stringify(message),
        },
      ],
    });

    console.log('Message sent:', message);
    console.log('Kafka response:', result);
  } catch (error) {
    console.error('Error in producer:', error);
    process.exitCode = 1;
  } finally {
    await producer.disconnect();
  }
}

runProducer();
