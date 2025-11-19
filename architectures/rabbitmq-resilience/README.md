# 🐰 RabbitMQ Resilience Demo

This project is a practical example demonstrating how to implement a robust messaging system using RabbitMQ with advanced resilience features. It's ideal for understanding how to handle failures and maintain data integrity in distributed systems.

## 🎯 What's the purpose?

This project demonstrates how to build a messaging system that:

- **Survives failures** through automatic retries
- **Isolates problematic messages** using a Dead Letter Queue (DLQ)
- **Automatically recovers** from messaging server failures
- **Maintains traceability** of processed and failed messages

## 🏗️ Architecture

The system consists of three main components:

1. **📤 Producer**: Publishes messages to a durable main queue.
2. **🔄 Consumer**: Processes messages, retries on failure, and routes failed messages to the DLQ.
3. **⚠️ DLQ Consumer**: Monitors and processes messages that couldn't be processed after several attempts.

The entire system is orchestrated with Docker Compose and uses persistent storage for RabbitMQ.

---
## 🚀 Quick Start

1. **Start the services** (RabbitMQ + Consumers):
   ```bash
   docker compose up --build -d
   ```

2. **Access RabbitMQ Management UI**:
   - URL: http://localhost:15672
   - Username: `user`
   - Password: `password`
   - Check the `Queues` tab to monitor message flow

3. **Send test messages**:
   - Send a successful message:
     ```bash
     docker compose run --rm producer npm run send:ok
     ```
   - Send a message that will fail (goes to DLQ after retries):
     ```bash
     docker compose run --rm producer npm run send:fail
     ```
   - Send multiple failing messages (5 by default):
     ```bash
     docker compose run --rm producer npm run send:many-fails
     # Or specify a custom number (e.g., 3 messages):
     N=3 docker compose run --rm producer npm run send:many-fails
     ```

4. **View logs** to monitor message processing:
   ```bash
   # View all service logs
   docker compose logs -f
   
   # View specific service logs
   docker compose logs -f consumer
   docker compose logs -f dlq-consumer
   ```

5. **Scale consumers** (run in separate terminals):
   ```bash
   # Add more main consumers
   docker compose run --rm consumer
   
   # Add more DLQ consumers
   docker compose run --rm dlq-consumer
   ```

### Consumer Types
- **Main Consumer**: Processes messages with automatic retries
  ```bash
  docker compose run --rm consumer
  ```
- **DLQ Consumer**: Handles failed messages
  ```bash
  docker compose run --rm dlq-consumer
  ```

**Use Cases:**
- Scale horizontally with multiple consumers
- Debug specific message issues
- Monitor message flow in real-time

---
## 📝 Viewing Logs

### View logs with Docker Compose
```bash
# View main consumer logs
docker compose logs -f consumer

# View DLQ consumer logs
docker compose logs -f dlq-consumer
```

### Real-time Logs
When running consumers manually, logs are displayed directly in the terminal, allowing you to see in real-time:
- Message processing
- Automatic retries
- Error handling
- Automatic reconnections

---
## 📤 Sending Messages

### Successful Message
```bash
docker compose run --rm producer npm run send:ok
# Or with a custom message:
docker compose run --rm producer npm run producer -- "Test successful message"
```

### Failing Message
```bash
docker compose run --rm producer npm run send:fail
# Or with a custom message containing 'fail':
docker compose run --rm producer npm run producer -- "fail - test message"
```

### Send Multiple Failing Messages
```bash
docker compose run --rm producer npm run send:many-fails
# Or specify quantity (e.g., 3 messages):
N=3 docker compose run --rm producer npm run send:many-fails
```

> **Note:** Messages containing `fail` will trigger a simulated error. After several retries (3 by default), they will be sent to the Dead Letter Queue (DLQ).

---
## 🔄 Testing the System

### Observing Message Flow

### Simulate RabbitMQ Downtime
1. In one terminal, monitor the logs:
   ```bash
   docker compose logs -f consumer
   ```

2. In another terminal, stop RabbitMQ:
   ```bash
   docker compose stop rabbitmq
   ```

3. Send test messages (they will queue up):
   ```bash
   docker compose run --rm producer npm run send:ok
   docker compose run --rm producer npm run send:fail
   ```

4. Restart RabbitMQ:
   ```bash
   docker compose start rabbitmq
   ```

5. Observe in the logs how consumers:
   - Automatically reconnect
   - Process any queued messages
   - Handle retries for failed messages
   - Route dead letters to DLQ

### Testing with Multiple Consumers
1. Scale up consumers in separate terminals:
   ```bash
   # Terminal 1: Main consumer
   docker compose run --rm consumer
   
   # Terminal 2: Another main consumer
   docker compose run --rm consumer
   
   # Terminal 3: DLQ consumer
   docker compose run --rm dlq-consumer
   ```

2. Send multiple messages and observe:
   - Load balancing between consumers
   - Parallel processing of messages
   - DLQ handling for failed messages
   ```bash
   # Send 10 messages in quick succession
1. **Start everything:**
   ```sh
   docker compose up --build
   ```
2. **Open at least two terminals:**
   - One running the consumer:  
     `docker compose run --rm consumer`
   - One running the DLQ consumer:  
     `docker compose run --rm dlq-consumer`
3. **Simulate RabbitMQ downtime:**
   ```sh
   docker compose stop rabbitmq
   ```
4. **While RabbitMQ is down**, try to send messages:
   ```sh
   docker compose run --rm producer npm run producer -- "Hello during downtime"
   docker compose run --rm producer npm run producer -- "fail - during downtime"
   ```
   The producers will fail to deliver at this time.
5. **Restart RabbitMQ:**
   ```sh
   docker compose start rabbitmq
   ```
6. The consumers will detect RabbitMQ is back and reconnect automatically. Pending messages will be processed, and failed ones will be routed to the DLQ as appropriate.

You don’t need to restart the consumer processes. Just wait a few seconds after RabbitMQ comes back up, and you’ll see them recover and resume processing!

---
## How does it work?

Both `consumer` and `dlq-consumer` are implemented with an infinite loop and event listeners:
- They try to connect, set up their queues, and begin consuming.
- If the connection or channel fails or closes, the process automatically waits a few seconds and retries everything from scratch.
- This ensures the consumers are autosustaining: no manual action is required after outages or RabbitMQ restarts.

---
## Web Admin
Monitor queues and messages live at: [http://localhost:15672](http://localhost:15672)
