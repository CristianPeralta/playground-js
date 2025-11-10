import express from 'express';
import producer from '../producer.js';
import config from '../config/index.js';

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create a new task
app.post('/tasks', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (!type || !data) {
      return res.status(400).json({ 
        success: false, 
        error: 'Type and data are required' 
      });
    }

    const task = { type, data };
    const result = await producer.sendTask(task);
    
    if (result.success) {
      return res.status(202).json({
        success: true,
        message: 'Task queued successfully',
        taskId: result.taskId,
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to queue task',
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

// Start the server
async function startServer() {
  try {
    // Connect to RabbitMQ
    await producer.connect();
    
    const server = app.listen(config.server.port, () => {
      console.log(`🚀 API Server running on port ${config.server.port}`);
      console.log(`📭 Task queue: ${config.queue.name}`);
      console.log(`📡 Environment: ${config.server.env}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\nShutting down server...');
      server.close(() => {
        console.log('Server stopped');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
