# 🐇 RabbitMQ Work Queues

This example demonstrates the Work Queues pattern using RabbitMQ with Node.js, where time-consuming tasks are distributed among multiple workers. It's perfect for background job processing, image resizing, sending emails, or any CPU-intensive operations.

## 📋 Prerequisites

- Node.js 22.x (as specified in [.nvmrc](.nvmrc))
- Docker and Docker Compose (recommended) or RabbitMQ server
- pnpm (recommended) or npm

## 🌟 Features

- Multiple worker instances for parallel task processing
- Fair dispatch of tasks among workers
- Message acknowledgment and durability
- REST API for task submission
- Graceful shutdown handling
- Environment-based configuration

## 🚀 Quick Start

1. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env if needed
   ```

2. **Install dependencies**:
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   ```

3. **Start RabbitMQ** (if not already running):
   ```bash
   docker-compose up -d
   ```

4. **Run workers** (in separate terminals):
   ```bash
   # Start worker 1
   pnpm start:worker
   
   # Start worker 2 (in another terminal)
   pnpm start:worker
   ```

5. **Start the API server** (in another terminal):
   ```bash
   pnpm start:api
   ```

6. **Send tasks** using the API:
   ```bash
   # Example 1: Simple task
   curl -X POST http://localhost:3000/tasks \
     -H "Content-Type: application/json" \
     -d '{"type": "process_data", "data": {"workTime": 2000, "description": "Process user data"}}'

   # Example 2: Image processing task
   curl -X POST http://localhost:3000/tasks \
     -H "Content-Type: application/json" \
     -d '{"type": "process_image", "data": {"imageUrl": "https://example.com/image.jpg", "sizes": ["thumb", "medium", "large"]}}'

   # Example 3: Email sending task
   curl -X POST http://localhost:3000/tasks \
     -H "Content-Type: application/json" \
     -d '{"type": "send_email", "data": {"to": "user@example.com", "subject": "Welcome!", "template": "welcome"}}'
   ```

## 🧪 Testing the Setup

1. **Start multiple workers** in separate terminals:
   ```bash
   # Terminal 1
   pnpm start:worker
   
   # Terminal 2
   pnpm start:worker
   ```

2. **Send multiple tasks** to see load balancing:
   ```bash
   # This will send 5 tasks with different processing times
   for i in {1..5}; do
     curl -X POST http://localhost:3000/tasks \
       -H "Content-Type: application/json" \
       -d "{\"type\": \"test_task\", \"data\": {\"workTime\": $((1000 * $i)), \"taskNumber\": $i}}" &
   done
   ```

   You should see the tasks being distributed between the workers.

## 🔍 Monitoring

Access the RabbitMQ Management UI at http://localhost:15672 (guest/guest) to:
- View queue statistics
- Monitor message rates
- Check connected consumers
- Inspect message flow

## 🏗️ Project Structure

```
.
├── src/
│   ├── api/              # API server and routes
│   │   └── server.js     # Express server with task endpoints
│   ├── config/
│   │   └── index.js      # Application configuration
│   ├── producer.js       # Task producer (publishes to RabbitMQ)
│   └── worker.js         # Worker (consumes and processes tasks)
├── .env.example          # Example environment variables
├── docker-compose.yml    # RabbitMQ container setup
└── package.json          # Project dependencies and scripts
```

## 🛠️ Available Scripts

- `pnpm start:worker` - Start a worker instance
- `pnpm start:api` - Start the API server
- `pnpm dev:worker` - Start worker with hot-reload
- `pnpm dev:api` - Start API server with hot-reload
- `pnpm lint` - Run ESLint

## 🔄 How It Works

1. **Task Submission**:
   - Client sends a POST request to `/tasks` with task details
   - API validates the request and publishes it to RabbitMQ
   - Task is stored in a durable queue

2. **Task Processing**:
   - Multiple worker instances can connect to the queue
   - RabbitMQ uses round-robin to distribute tasks among workers
   - Each worker processes one task at a time (configurable)
   - Tasks are acknowledged only after successful processing

3. **Error Handling**:
   - Failed tasks can be automatically requeued
   - Unacknowledged messages are redelivered if the worker disconnects
   - Dead-letter queue support for failed messages (optional)

## 🚀 Example Use Cases

1. **Image Processing**
   ```bash
   curl -X POST http://localhost:3000/tasks \
     -H "Content-Type: application/json" \
     -d '{"type": "resize_image", "data": {"imageId": "123", "sizes": ["300x300", "600x600"]}}'
   ```

2. **Data Export**
   ```bash
   curl -X POST http://localhost:3000/tasks \
     -H "Content-Type: application/json" \
     -d '{"type": "export_data", "data": {"userId": "user123", "format": "csv", "dateRange": {"from": "2023-01-01", "to": "2023-12-31"}}}'
   ```

3. **Notification System**
   ```bash
   curl -X POST http://localhost:3000/tasks \
     -H "Content-Type: application/json" \
     -d '{"type": "send_notification", "data": {"channel": "email", "recipients": ["user1@example.com", "user2@example.com"], "message": "New update available!"}}'
   ```

## 📚 Key Concepts

### 🔄 Work Distribution

#### Parallel Processing
- Each worker can process multiple tasks in parallel (configurable via `prefetch`)
- Default prefetch is set to 2 messages per worker
- Example with 2 workers and prefetch=2:
  - Worker 1: Processing Task A, Task B
  - Worker 2: Processing Task C, Task D

#### Configuration
To adjust concurrency, modify the `prefetch` value in `worker.js`:
```javascript
// In worker.js
channel.prefetch(2);  // Process up to 2 messages in parallel per worker
```

#### Best Practices
- **CPU-bound tasks**: Lower prefetch (1-2) to prevent system overload
- **I/O-bound tasks**: Higher prefetch (5-10) to maximize throughput
- **Mixed workload**: Start with prefetch=CPU cores and adjust based on monitoring

### ✅ Message Acknowledgment
- Tasks are only removed from queue after processing
- Prevents task loss if a worker fails
- Ensures at-least-once delivery

### ⚖️ Fair Dispatch
- Uses `prefetch(1)` for fair task distribution
- Prevents worker starvation
- Better utilization of worker resources

### 💾 Message Durability
- Tasks survive broker restarts
- Persistent message storage
- No data loss on system failures

### ⏱️ Task Scheduling
- Schedule tasks for future processing
- Set timeouts and retry policies
- Dead-letter queue for failed tasks

## 🚀 Next Steps

1. **Add Authentication** to the API endpoints
2. **Implement Task Status Tracking** using a database
3. **Add Monitoring** with Prometheus/Grafana
4. **Implement Circuit Breaker** for RabbitMQ connection
5. **Add Task Batching** for better throughput

## 📝 License

MIT - Feel free to use this project in any way you want!
