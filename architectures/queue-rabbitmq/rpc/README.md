# RabbitMQ RPC (Remote Procedure Call)

This project demonstrates how to implement a Remote Procedure Call (RPC) pattern using RabbitMQ with Node.js. The RPC pattern enables bidirectional communication between a client and a server, allowing the client to call functions on the server as if they were local functions.

## 🌟 Features

- Bidirectional communication using RabbitMQ
- Temporary queues for RPC responses
- Automatic correlation ID generation and matching
- Timeout handling for requests
- Error handling and propagation
- Clean and modular code structure
- Docker Compose for RabbitMQ with management UI

## 📦 Prerequisites

- Node.js 14.x or higher
- Docker and Docker Compose (optional, for RabbitMQ)
- pnpm (optional, works with npm or yarn too)

## 🚀 Quick Start

1. Start RabbitMQ with Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. In one terminal, start the RPC server:
   ```bash
   pnpm start:server
   # or
   npm run start:server
   ```

4. In another terminal, run the example client:
   ```bash
   pnpm start:client
   # or
   npm run start:client
   ```

## 🔍 Understanding RPC Pattern

### How It Works

1. The RPC server starts and listens for messages on a predefined queue (`rpc_queue`)
2. The client connects to RabbitMQ and creates a temporary, exclusive queue for responses
3. When the client makes an RPC call:
   - It generates a unique correlation ID
   - Sends the request to the RPC queue with a reply-to header
   - Waits for a response with the matching correlation ID
4. The server processes the request and sends the response back to the client's temporary queue
5. The client receives the response and resolves the corresponding promise

### Available RPC Methods

- `add`: Adds two numbers (`{a: number, b: number}`) → `{result: number}`
- `multiply`: Multiplies two numbers (`{a: number, b: number}`) → `{result: number}`
- `echo`: Returns the provided message (`{message: string}`) → `{result: string}`
- `getTime`: Returns current server time (`{}`) → `{result: string}`

## 🛠️ Configuration

Edit `src/config/config.js` to customize:

- `rabbitmq`: Connection settings for RabbitMQ
  - `hostname`, `port`, `username`, `password`: Connection details
  - `rpc.queue`: Name of the RPC queue
  - `rpc.options`: Queue options (durability, TTL, etc.)
- `app`: Application settings
  - `requestTimeout`: Maximum time to wait for RPC response (ms)
  - `maxRetries`: Maximum number of retry attempts
  - `retryDelay`: Delay between retries (ms)

## 📚 Resources

- [RabbitMQ RPC Documentation](https://www.rabbitmq.com/tutorials/tutorial-six-javascript.html)
- [RabbitMQ Patterns](https://www.rabbitmq.com/tutorials/amqp-concepts.html)
- [amqplib Documentation](https://www.npmjs.com/package/amqplib)

## 📄 License

MIT
