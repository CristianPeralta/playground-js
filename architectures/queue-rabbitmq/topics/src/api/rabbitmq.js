import amqp from 'amqplib';
import { config } from '../config/config.js';

class RabbitMQ {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();
      
      // Assert the exchange
      await this.channel.assertExchange(
        config.rabbitmq.exchange.name,
        config.rabbitmq.exchange.type,
        config.rabbitmq.exchange.options
      );
      
      console.log('✅ Connected to RabbitMQ');
      return this.channel;
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.close();
      console.log('🔌 Disconnected from RabbitMQ');
    }
  }
}

export const rabbitMQ = new RabbitMQ();
