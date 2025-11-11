# RabbitMQ Pub/Sub (Publish/Subscribe)

This project demonstrates how to implement the Publish/Subscribe pattern using RabbitMQ and Node.js. In this pattern, messages are sent to an exchange and then distributed to multiple queues, allowing multiple consumers to receive the same message.

## 🚀 Features

- Publish messages to multiple subscribers
- Fanout exchange configuration
- REST API for publishing messages
- Multiple independent subscribers
- Environment-based configuration
- Docker Compose for RabbitMQ

## 📦 Prerequisites

- Node.js 22.x
- Docker and Docker Compose
- pnpm (optional, works with npm or yarn too)

## 🛠️ Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
4. Start RabbitMQ with Docker:
   ```bash
   docker-compose up -d
   ```

## 🚀 Usage

### 1. Start Subscribers

Open multiple terminals and run:

```bash
# Terminal 1 - Subscriber 1
pnpm dev:subscriber

# Terminal 2 - Subscriber 2
pnpm dev:subscriber

# Terminal 3 - Subscriber 3
pnpm dev:subscriber
```

### 2. Publish Messages

#### Option A: Using the CLI script
```bash
pnpm start:publisher -- "Hello subscribers!"
```

#### Option B: Using the REST API
```bash
curl -X POST http://localhost:3000/publish \
  -H "Content-Type: application/json" \
  -d '{"message":"Test message"}'
```

### 3. Management Interface

Access the RabbitMQ web interface at:
- URL: http://localhost:15672
- Username: `guest`
- Password: `guest`

## 📚 Key Concepts

### Fanout Exchange
- Sends messages to all bound queues
- Ignores routing keys
- Ideal for broadcast scenarios

### Temporary Queues
- Subscribers create randomly-named queues
- Queues are deleted when subscribers disconnect
- Each subscriber gets its own copy of each message

## 🤔 How It Works

1. **Publisher** sends a message to an exchange
2. The exchange (fanout type) copies the message to all bound queues
3. Each **Subscriber** receives the message from its own queue

```
+-------------+       +------------+       +-----------+
|  Publisher  | ----> |  Exchange  | ----> | Subscriber 1 |
+-------------+       |  (fanout)  |       +-----------+
                     +------------+       | Subscriber 2 |
                            |            +-----------+
                            +------------> Subscriber 3 |
                                         +-----------+
```

## 📝 Notes

- Messages are lost if no subscribers are connected when published
- Use durable queues if you need message persistence
- For production, implement more robust error handling and reconnection logic

## 📄 License

MIT
