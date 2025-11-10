import amqp from 'amqplib';
import config from './config/index.js';

class TaskProducer {
  constructor() {
    this.channel = null;
  }

  async connect() {
    try {
      const connection = await amqp.connect({
        protocol: 'amqp',
        hostname: config.rabbitmq.hostname,
        port: config.rabbitmq.port,
        username: config.rabbitmq.username,
        password: config.rabbitmq.password,
      });

      this.channel = await connection.createChannel();
      
      // Ensure the queue exists and is durable
      await this.channel.assertQueue(config.queue.name, {
        durable: config.queue.durable,
      });

      console.log(' [*] Producer connected to RabbitMQ');
      return this.channel;
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async sendTask(task) {
    if (!this.channel) {
      throw new Error('Producer not connected to RabbitMQ');
    }

    try {
      const message = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...task,
      };

      const sent = await this.channel.sendToQueue(
        config.queue.name,
        Buffer.from(JSON.stringify(message)),
        { persistent: config.queue.persistent }
      );

      if (sent) {
        console.log(` [x] Sent task ${message.id}`);
        return { success: true, taskId: message.id };
      }
      
      return { success: false, error: 'Failed to send task' };
    } catch (error) {
      console.error('Error sending task:', error);
      throw error;
    }
  }
}

export default new TaskProducer();
