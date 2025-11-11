import express from 'express';
import amqp from 'amqplib';
import config from '../config/rabbitmq.js';

const app = express();
app.use(express.json());

// RabbitMQ connection
let channel;
const initRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(config.rabbitmq.url);
    channel = await connection.createChannel();
    
    // Assert the exchange
    await channel.assertExchange(
      config.rabbitmq.exchange.name, 
      'fanout', 
      { durable: false }
    );
    
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    process.exit(1);
  }
};

// Publish a message to the exchange
app.post('/publish', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    channel.publish(
      config.rabbitmq.exchange.name,
      '',
      Buffer.from(message)
    );
    
    res.json({ status: 'Message published', message });
  } catch (error) {
    console.error('Error publishing message:', error);
    res.status(500).json({ error: 'Failed to publish message' });
  }
});

// Start the server
const startServer = async () => {
  await initRabbitMQ();
  
  const PORT = config.server.port;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Publish messages via POST http://localhost:${PORT}/publish`);
  });
};

startServer();

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});
