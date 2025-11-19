import { Kafka } from 'kafkajs';
import { config } from './config.js';
import dotenv from 'dotenv';
import {
  trackReprocessed,
  trackSuccess,
  printMetrics,
} from './utils/metrics.js';
dotenv.config();

const argv = process.argv.slice(2);
const reprocess = argv.includes('--reprocess');

const kafka = new Kafka({
  clientId: config.clientId + '-dlq',
  brokers: config.kafkaBrokers,
});

const consumer = kafka.consumer({ groupId: config.groupId + '-dlq' });
const producer = kafka.producer();

async function handleDlqMessage(message) {
  const parsed = safeJson(message.value.toString());
  console.log('[DLQ] Mensaje DLQ:', parsed);
  if (reprocess && parsed && parsed.original) {
    await producer.send({
      topic: config.mainTopic,
      messages: [{ value: parsed.original }],
    });
    trackReprocessed();
    console.log('[DLQ] Mensaje REPROCESADO al topic principal.');
  }
  trackSuccess();
  printMetrics();
}

function safeJson(str) {
  try { return JSON.parse(str); } catch { return null; }
}

async function run() {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: config.dlqTopic, fromBeginning: true });
  console.log(`DLQ Consumer activo. Reprocesar: ${reprocess ? 'Sí' : 'No'} (usa --reprocess para activar)`);
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      await handleDlqMessage(message);
    },
  });
}

run().catch(e => {
  console.error('[DLQ Consumer] Error:', e);
  process.exit(1);
});
