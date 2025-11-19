import amqp from 'amqplib';

export async function connectRabbitMQ(url) {
  let connection;
  while (!connection) {
    try {
      connection = await amqp.connect(url);
      connection.on('error', err => {
        console.error('RabbitMQ connection error:', err.message);
      });
      connection.on('close', () => {
        console.error('RabbitMQ connection closed. Retrying.');
        setTimeout(() => connectRabbitMQ(url), 5000);
      });
    } catch (error) {
      console.error('RabbitMQ connect error:', error.message, 'Retrying in 5s');
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  return connection;
}
