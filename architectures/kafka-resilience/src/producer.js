import { Kafka } from 'kafkajs';
import { faker } from 'faker';
import { config } from './config.js';
import dotenv from 'dotenv';
import { trackSuccess, printMetrics } from './utils/metrics.js';
dotenv.config();

const kafka = new Kafka({
  clientId: config.clientId,
  brokers: config.kafkaBrokers,
});

const producer = kafka.producer();

function generateMessage() {
  return {
    id: faker.datatype.uuid(),
    timestamp: new Date().toISOString(),
    name: faker.name.findName(),
    value: faker.datatype.number({ min: 1, max: 1000 }),
  };
}

async function produceLoop() {
  await producer.connect();
  console.log('[Producer] Conectado. Enviando mensajes...');
  setInterval(async () => {
    const message = generateMessage();
    await producer.send({
      topic: config.mainTopic,
      messages: [{ value: JSON.stringify(message) }],
    });
    trackSuccess();
    console.log('[Producer] Mensaje enviado:', message);
    printMetrics();
  }, 2000);
}

produceLoop().catch(e => {
  console.error('[Producer] Error:', e);
  process.exit(1);
});
