import { Kafka } from 'kafkajs';
import { config } from './config.js';
import { retry, exponentialBackoff } from './utils/retry.js';
import dotenv from 'dotenv';
import {
  trackSuccess,
  trackRetry,
  trackFatalError,
  trackDlqSent,
  trackReconnect,
  printMetrics,
} from './utils/metrics.js';
dotenv.config();

const kafka = new Kafka({
  clientId: config.clientId + '-consumer',
  brokers: config.kafkaBrokers,
});

const consumer = kafka.consumer({ groupId: config.groupId });
const dlqProducer = kafka.producer();

function shouldFail(prob = config.failureProbability) {
  return Math.random() < prob;
}

async function processMessage(message) {
  // Simula fallo aleatorio
  if (shouldFail()) throw new Error('Procesamiento fallido (simulado)');
  // Aquí iría la lógica de negocio real
}

async function run() {
  await consumer.connect();
  await dlqProducer.connect();
  await consumer.subscribe({ topic: config.mainTopic, fromBeginning: true });
  console.log('[Consumer] Conectado y suscrito al topico principal');
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const rawValue = message.value.toString();
      let attempts = 0;
      try {
        await retry(
          async () => {
            attempts++;
            await processMessage(message);
          },
          config.retryAttempts,
          (a) => exponentialBackoff(config.retryBackoff)(a),
          (a, err) => {
            trackRetry();
            if (a < config.retryAttempts) {
              console.log(`[Consumer] Reintentando (${a}/${config.retryAttempts}):`, err.message);
            }
          }
        );
        trackSuccess();
        console.log(`[Consumer] Mensaje procesado OK:`, rawValue);
      } catch (err) {
        trackFatalError();
        // manda a DLQ
        await dlqProducer.send({
          topic: config.dlqTopic,
          messages: [
            {
              value: JSON.stringify({
                original: rawValue,
                error: err.message,
                attempts,
                movedToDlqAt: new Date().toISOString(),
              })
            }
          ]
        });
        trackDlqSent();
        console.log(`[Consumer] Fallo fatal, enviado a DLQ:`, rawValue);
      }
      printMetrics();
    },
  });
}

run().catch(e => {
  console.error('[Consumer] Error:', e);
  process.exit(1);
});
