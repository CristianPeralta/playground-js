# RabbitMQ Basics

This example demonstrates the basic usage of RabbitMQ with Node.js, covering the fundamental concepts of message queuing.

## 📋 Prerequisites

- Node.js 18+
- RabbitMQ server (you can use Docker: `docker run -d --hostname my-rabbit --name some-rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management`)

## 🏃‍♂️ Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the RabbitMQ server (if not already running)

3. Run the examples:
   - Producer: `node producer.js`
   - Consumer: `node consumer.js`

## 📚 Concepts Covered

- **Producer**: Sends messages to a queue
- **Consumer**: Receives messages from a queue
- **Queue**: Buffer that stores messages
- **Connection & Channel**: RabbitMQ connection management
- **Message Acknowledgment**: Ensuring message delivery

## 📁 Project Structure

- `producer.js`: Sends messages to the queue
- `consumer.js`: Receives and processes messages
- `config.js`: Shared configuration
- `package.json`: Project dependencies and scripts
