import dotenv from 'dotenv';

dotenv.config();

const config = {
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672/',
    exchange: {
      name: process.env.EXCHANGE_NAME || 'logs',
      type: process.env.EXCHANGE_TYPE || 'fanout',
      durable: false
    }
  },
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  }
};

export default config;
