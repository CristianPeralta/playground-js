# RabbitMQ Topics with Advanced Routing

This project demonstrates how to implement advanced message routing in RabbitMQ using topic exchanges. It shows how to use wildcard patterns (`*` and `#`) to filter messages based on their routing keys, allowing for flexible and powerful message routing.

## 🌟 Features

- Publish messages with different routing keys using topic patterns
- Topic exchange configuration for advanced message routing
- Multiple subscribers with pattern-based message filtering
- Support for single-word (`*`) and multi-word (`#`) wildcards
- Color-coded console output based on message type
- Environment-based configuration
- Docker Compose for RabbitMQ with management UI

## 📦 Prerequisites

- Node.js 22.x
- Docker and Docker Compose
- pnpm (optional, works with npm or yarn too)

## 🚀 Quick Start

1. Start RabbitMQ with Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

4. In one terminal, start the subscriber:
   ```bash
   pnpm run subscriber
   ```

5. In another terminal, publish messages:
   ```bash
   pnpm start
   ```

## 🔍 Understanding Topic Routing

### Routing Key Patterns

- `*` (star) matches exactly one word
- `#` (hash) matches zero or more words
- Words are separated by dots (e.g., `user.created`)

### Example Patterns

- `user.*` - Matches `user.created`, `user.deleted`, but not `user.profile.updated`
- `user.#` - Matches all user-related events
- `*.notification.*` - Matches `email.notification.new`, `sms.notification.sent`
- `#.error` - Matches any error message at any level

## 🛠️ Configuration

Edit the `.env` file to customize:

- `RABBITMQ_URL`: RabbitMQ connection string
- `EXCHANGE_NAME`: Name of the topic exchange
- `QUEUE_NAME`: Name for the subscriber queue
- `ROUTING_KEYS`: Comma-separated list of routing key patterns to subscribe to

## 📚 Resources

- [RabbitMQ Topic Exchange Documentation](https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html)
- [RabbitMQ Patterns](https://www.rabbitmq.com/tutorials/amqp-concepts.html)

## 📄 License

MIT
