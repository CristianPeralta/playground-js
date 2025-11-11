export const config = {
  // RabbitMQ connection settings
  rabbitmq: {
    protocol: 'amqp',
    hostname: 'localhost',  // RabbitMQ server hostname
    port: 5672,            // Default RabbitMQ port
    username: 'guest',      // Default username
    password: 'guest',     // Default password
    vhost: '/',            // Default virtual host
    
    // RPC queue settings
    rpc: {
      queue: 'rpc_queue',  // Main RPC queue name
      replyQueue: 'amq.rabbitmq.reply-to', // Special queue for RPC responses
      options: {
        durable: false,     // Queue won't survive broker restarts
        exclusive: false,   // Queue can be accessed by other connections
        autoDelete: true,   // Queue will be deleted when no longer in use
        messageTtl: 10000,  // Message time-to-live in ms (10 seconds)
        expires: 300000     // Queue expiration time in ms (5 minutes)
      }
    }
  },
  
  // Application settings
  app: {
    requestTimeout: 10000,  // Max time to wait for RPC response (10 seconds)
    maxRetries: 3,          // Max number of retry attempts
    retryDelay: 1000       // Delay between retries in ms
  }
};

export default config;
