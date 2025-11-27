# Kafka Basics

This example demonstrates the basic usage of **Kafka with Node.js**, covering the fundamental concepts of **producer**, **consumer**, **topics** and the log-based storage model.

## 📋 Prerequisites

- Node.js 22.x (as specified in `.nvmrc`)
- Docker and Docker Compose

> The Kafka broker is shared for all Kafka examples and lives in `../kafka-environment`.

## 🚀 Quick Start

### 1. Start Kafka environment (recommended)

From the `kafka-environment` folder in this repo:

```bash
cd ../kafka-environment
./reset.sh
```

This will:
- Start ZooKeeper, Kafka broker and Kafka UI
- Expose Kafka on `localhost:9092`

Kafka UI will be available at: http://localhost:8080

### 2. Install dependencies

From this folder (`01-basics`):

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Run producer and consumer

In **two terminals** from `01-basics`:

```bash
# Terminal 1 - Consumer
pnpm start:consumer

# Terminal 2 - Producer
pnpm start:producer
```

Or with npm:

```bash
# Terminal 1 - Consumer
npm run start:consumer

# Terminal 2 - Producer
npm run start:producer
```

## 📚 Concepts Covered

- **Producer**: sends messages to a topic
- **Consumer**: reads messages from a topic
- **Topic**: append-only log where messages are stored
- **Partition / Offset (preview)**: messages are stored in ordered partitions, each message has an offset
- **Consumer group (preview)**: consumers coordinate reads using a group id

## 🏗️ Project Structure

```
.
├── src/
│   ├── config.js        # Shared configuration (topic, brokers, clientId, groupId)
│   ├── producer.js      # Kafka producer implementation
│   └── consumer.js      # Kafka consumer implementation
├── .env.example         # Example environment variables
├── .gitignore           # Ignore node_modules and local env
├── .nvmrc               # Node.js version
└── package.json         # Project dependencies and scripts
```

## 🛠️ Available Scripts

- `pnpm start:producer` / `npm run start:producer` – Start the Kafka producer
- `pnpm start:consumer` / `npm run start:consumer` – Start the Kafka consumer

## 🔄 Message Flow

1. The producer sends a JSON message to the Kafka topic defined in `KAFKA_TOPIC` (default: `basics.hello`).
2. Kafka stores the message in the topic log.
3. The consumer, using a consumer group, receives and logs the message contents.

## ⚙️ Configuration

Copy `.env.example` to `.env` if you want to customize values:

```bash
cp .env.example .env
```

Available variables:

- `KAFKA_BROKER` – Kafka broker address (default: `localhost:9092`)
- `KAFKA_CLIENT_ID` – Client ID used by producer/consumer (default: `kafka-basics-app`)
- `KAFKA_TOPIC` – Topic name for this example (default: `basics.hello`)
- `KAFKA_CONSUMER_GROUP_ID` – Consumer group id (default: `kafka-basics-consumers`)
