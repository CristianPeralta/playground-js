# RabbitMQ Basics

This example demonstrates the basic usage of RabbitMQ with Node.js, covering the fundamental concepts of message queuing.

## 📋 Prerequisites

- Node.js 22.x (as specified in package.json)
- Docker and Docker Compose (recommended) or RabbitMQ server

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. Start RabbitMQ server:
   ```bash
   docker-compose up -d
   ```

2. Install dependencies (using pnpm or npm):
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   ```

3. In separate terminals, run:
   ```bash
   # Using pnpm
   pnpm start:consumer
   # In another terminal
   pnpm start:producer
   
   # Or using npm
   # npm run start:consumer
   # In another terminal
   # npm run start:producer
   ```

### Manual Setup

1. Start RabbitMQ server:
   ```bash
   # Using Docker
   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
   ```
   
   Or [install RabbitMQ](https://www.rabbitmq.com/download.html) locally.

2. Install dependencies and run:
   ```bash
   # Using pnpm
   pnpm install
   pnpm start:producer
   # In another terminal
   pnpm start:consumer
   
   # Or using npm
   # npm install
   # npm run start:producer
   # In another terminal
   # npm run start:consumer
   ```

## 🌐 Access Management UI

After starting RabbitMQ with Docker Compose, access the management UI at:
- URL: http://localhost:15672
- Username: `guest`
- Password: `guest`

## 📚 Concepts Covered

- **Producer**: Sends messages to a queue
- **Consumer**: Receives and processes messages
- **Queue**: Buffer that stores messages
- **Connection & Channel**: RabbitMQ connection management
- **Message Acknowledgment**: Ensuring message delivery
- **Durability**: Message persistence

## 🏗️ Project Structure

```
.
├── consumer.js          # Message consumer implementation
├── producer.js          # Message producer implementation
├── config.js            # Shared configuration
├── docker-compose.yml   # RabbitMQ container setup
├── .env.example         # Example environment variables
└── package.json         # Project dependencies and scripts
```

## 🛠️ Available Scripts

- `pnpm start:producer` or `npm run start:producer` - Start the message producer
- `pnpm start:consumer` or `npm run start:consumer` - Start the message consumer
- `pnpm test` or `npm test` - Run tests (if any)

## 🔄 Message Flow

1. Producer sends messages to the queue
2. RabbitMQ stores messages in the queue
3. Consumer receives and processes messages
4. Messages are acknowledged after successful processing
