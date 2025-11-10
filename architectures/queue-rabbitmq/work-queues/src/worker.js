import amqp from 'amqplib';
import config from './config/index.js';

async function processTask(task) {
  console.log(` [x] Processing task: ${task.id} (${task.type})`);
  console.log(`Task data: ${JSON.stringify(task.data, null, 2)}`);
  
  // Simulate work - using task type and data for processing
  const workTime = task.data?.workTime ?? 1000; // Default 1 second if not specified
  await new Promise(resolve => setTimeout(resolve, workTime));
  
  console.log(` [x] Completed task: ${task.id}`);
  return { 
    success: true, 
    taskId: task.id,
    processedAt: new Date().toISOString()
  };
}

async function startWorker() {
  try {
    const connection = await amqp.connect({
      protocol: 'amqp',
      hostname: config.rabbitmq.hostname,
      port: config.rabbitmq.port,
      username: config.rabbitmq.username,
      password: config.rabbitmq.password,
    });

    const channel = await connection.createChannel();
    
    // Ensure the queue exists and configure it to be durable
    // Durable queues survive broker restarts
    await channel.assertQueue(config.queue.name, {
      durable: config.queue.durable,
    });

    // Configure message prefetch count
    // This controls how many messages the worker can process in parallel
    // Setting to 2 means this worker can handle up to 2 messages simultaneously
    channel.prefetch(2);

    console.log(` [*] Worker started. Waiting for tasks in ${config.queue.name}. To exit press CTRL+C`);
    
    channel.consume(
      config.queue.name,
      async (msg) => {
        if (msg !== null) {
          try {
            const task = JSON.parse(msg.content.toString());
            console.log(` [x] Received task ${task.id}`);
            
            // Process the task in the background
            // The worker can receive more messages while this task is processing
            // up to the prefetch limit (2 in this case)
            await processTask(task);
            
            // Acknowledge the message to remove it from the queue
            // Only after successful processing
            channel.ack(msg);
            console.log(` [x] Acknowledged task ${task.id}`);
          } catch (error) {
            console.error('Error processing task:', error);
            // Negative acknowledgment - requeue the message
            channel.nack(msg, false, true);
          }
        }
      },
      { noAck: false } // Manual acknowledgment
    );

    // Handle connection close
    process.once('SIGINT', async () => {
      await channel.close();
      await connection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Worker error:', error);
    process.exit(1);
  }
}

startWorker().catch(console.error);
