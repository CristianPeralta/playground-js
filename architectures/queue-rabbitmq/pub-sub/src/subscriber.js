import amqp from 'amqplib';
import config from './config/rabbitmq.js';

async function subscribeToMessages(name = 'anonymous') {
  try {
    const connection = await amqp.connect(config.rabbitmq.url);
    const channel = await connection.createChannel();
    
    const exchange = config.rabbitmq.exchange.name;
    
    // Assert the exchange
    await channel.assertExchange(exchange, 'fanout', { durable: false });
    
    // Create a temporary queue with a generated name
    const { queue } = await channel.assertQueue('', { exclusive: true });
    
    console.log(` [*] Waiting for messages in ${queue}. To exit press CTRL+C`);
    
    // Bind the queue to the exchange
    await channel.bindQueue(queue, exchange, '');
    
    // Consume messages
    channel.consume(
      queue,
      (msg) => {
        if (msg.content) {
          console.log(` [${name}] Received: ${msg.content.toString()}`);
        }
      },
      { noAck: true }
    );
    
    // Handle process termination
    process.on('SIGINT', async () => {
      console.log(' [*] Closing connection...');
      await channel.close();
      await connection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error in subscriber:', error);
    process.exit(1);
  }
}

subscribeToMessages('subscriber-1');
subscribeToMessages('subscriber-2');
