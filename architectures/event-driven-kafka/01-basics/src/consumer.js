import { Kafka } from 'kafkajs';
import config from './config.js';

async function runConsumer() {
  const kafka = new Kafka({
    clientId: config.clientId,
    brokers: config.brokers,
  });

  const consumer = kafka.consumer({ groupId: config.consumerGroupId });

  try {
    await consumer.connect();
    await consumer.subscribe({ topic: config.topic, fromBeginning: true });

    console.log(`[*] Waiting for messages in topic ${config.topic}. To exit press CTRL+C`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = message.value?.toString() ?? '';
          const parsed = value ? JSON.parse(value) : null;
          console.log('[x] Received:', {
            topic,
            partition,
            offset: message.offset,
            key: message.key?.toString(),
            value: parsed ?? value,
          });
        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });
  } catch (error) {
    console.error('Error in consumer:', error);
    process.exitCode = 1;
  }

  const handleExit = async () => {
    console.log('\nClosing Kafka consumer...');
    try {
      await consumer.disconnect();
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
}

runConsumer();
