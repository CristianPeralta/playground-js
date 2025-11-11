import dotenv from 'dotenv';

dotenv.config();

export const config = {
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672/',
    exchange: {
      name: process.env.EXCHANGE_NAME || 'topic_logs',
      type: 'topic',
      options: {
        durable: false
      }
    },
    queue: {
      name: process.env.QUEUE_NAME || 'topic_logs_queue',
      options: {
        exclusive: true
      },
      bindingKeys: process.env.ROUTING_KEYS ? 
        process.env.ROUTING_KEYS.split(',').map(k => k.trim()) : 
        ['user.*', 'order.#', '*.error', '*.notification.*']
    }
  },
  logLevels: ['info', 'warn', 'error', 'debug']
};

export default config;
