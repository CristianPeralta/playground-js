# RabbitMQ Message Routing

This project demonstrates how to implement message routing in RabbitMQ using direct exchanges. It shows how to filter messages based on their routing keys (e.g., error, info, warn), allowing selective message processing by different consumers.

## 🚀 Features

- Publish messages with different routing keys (error, warn, info)
- Direct exchange configuration for message routing
- Multiple subscribers with selective message filtering
- Color-coded console output based on message severity
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

Open multiple terminals and run subscribers with different log level filters:

```bash
# Terminal 1 - Error logs only
pnpm subscriber error

# Terminal 2 - Warning and error logs
pnpm subscriber warn error

# Terminal 3 - All logs
pnpm subscriber
```

### 2. Start the Publisher

In a separate terminal, start the publisher to generate log messages:

```bash
pnpm start
```

The publisher will generate random log messages with different severity levels that will be routed to the appropriate subscribers.

## 📁 Project Structure

```
.
├── .env.example        # Example environment variables
├── .gitignore         # Git ignore file
├── .nvmrc             # Node.js version
├── README.md          # This file
├── docker-compose.yml # Docker Compose for RabbitMQ
├── package.json       # Project dependencies and scripts
└── src/               # Source code
    ├── api/           # API endpoints
    │   └── health.js  # Health check endpoint
    ├── config/        # Configuration files
    │   └── rabbitmq.js # RabbitMQ connection setup
    ├── publisher.js   # Message publisher
    └── subscriber.js  # Message subscriber with filtering
```

## 📝 Environment Variables

Create a `.env` file based on `.env.example`:

```
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=direct_logs
RABBITMQ_QUEUE_PREFIX=routing_
```

## 🛠 Available Scripts

- `pnpm start` - Start the publisher
- `pnpm subscriber` - Start a subscriber (use arguments to filter logs: error, warn, info)
- `pnpm test` - Run tests (not implemented yet)

## 📚 Learn More

- [RabbitMQ Direct Exchanges](https://www.rabbitmq.com/tutorials/tutorial-four-javascript.html)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
   docker-compose up -d
   ```
4. Start the subscriber:
   ```bash
   node src/subscriber.js
   ```
5. In a separate terminal, start the publisher:
   ```bash
   node src/publisher.js
   ```

## How It Works

- The publisher sends messages with different routing keys (error, info, warn)
- Subscribers can choose which types of messages they want to receive by binding to specific routing keys
- This allows for selective message processing based on message type
