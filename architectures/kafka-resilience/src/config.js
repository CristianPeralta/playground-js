import dotenv from 'dotenv';
dotenv.config();

export const config = {
  kafkaBrokers: process.env.KAFKA_BROKER ? process.env.KAFKA_BROKER.split(',') : ['localhost:9092'],
  mainTopic: process.env.KAFKA_MAIN_TOPIC || 'resilience-demo',
  dlqTopic: process.env.KAFKA_DLQ_TOPIC || 'resilience-demo-dlq',
  retryAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || '3'),
  retryBackoff: parseInt(process.env.RETRY_BACKOFF_MS || '1000'),
  failureProbability: parseFloat(process.env.FAILURE_PROBABILITY || '0.3'),
  clientId: process.env.CLIENT_ID || 'resilience-demo',
  groupId: process.env.GROUP_ID || 'resilience-demo-group',
};
