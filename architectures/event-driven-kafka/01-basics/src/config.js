import 'dotenv/config';

export default {
  topic: process.env.KAFKA_TOPIC || 'basics.hello',
  clientId: process.env.KAFKA_CLIENT_ID || 'kafka-basics-app',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  consumerGroupId: process.env.KAFKA_CONSUMER_GROUP_ID || 'kafka-basics-consumers',
  consumeTimeout: 10000
};
