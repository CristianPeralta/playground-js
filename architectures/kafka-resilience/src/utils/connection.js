import { Kafka, logLevel } from 'kafkajs';
import { config } from '../config.js';

export function createKafkaClient(clientId = config.clientId) {
  return new Kafka({
    clientId: clientId,
    brokers: config.kafkaBrokers,
    logLevel: logLevel.INFO,
    retry: {
      initialRetryTime: 300,
      retries: 8
    }
  });
}

export function setupEventLogging(kafkaInstance, {name = 'client', onReconnect} = {}) {
  // No hay eventos oficiales "reconnect" en kafkajs, pero puede observarse por logs y eventos de error.
  kafkaInstance.logger().setLogLevel(logLevel.INFO);
  kafkaInstance.logger().setLogger({
    log: ({ level, log }) => {
      if ((log.message || '').toLowerCase().includes('reconnect')) {
        if (onReconnect) onReconnect(log);
        console.log(`[${name}] Reconectando:`, log);
      }
    }
  });
}
