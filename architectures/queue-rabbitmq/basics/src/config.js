import 'dotenv/config';

export default {
  queue: {
    name: 'hello',
    durable: false // Set to true for persistent queues
  },
  connection: {
    protocol: 'amqp',
    hostname: process.env.RABBITMQ_HOST || 'localhost',
    port: process.env.RABBITMQ_PORT || 5672,
    username: process.env.RABBITMQ_USERNAME || 'guest',
    password: process.env.RABBITMQ_PASSWORD || 'guest',
    vhost: process.env.RABBITMQ_VHOST || '/',
  },
  // Time to wait for messages (in milliseconds)
  consumeTimeout: 10000
};
