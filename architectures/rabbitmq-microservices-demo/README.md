# Microservices Demo (RabbitMQ)

Microservices demo using Express and RabbitMQ.

## Services
- **auth**: authentication
- **payments**: payments
- **notifications**: notifications

## Communication
Services communicate via events published and consumed in RabbitMQ.


## Usage with Docker
1. Configure environment variables for each service (see `.env.example`).
2. Build and start all services with Docker Compose:
	```bash
	docker compose up --build
	```
3. Access the RabbitMQ management UI at [http://localhost:15672](http://localhost:15672) (default user/pass: guest/guest).
4. Test the endpoints of each service (auth, payments, notifications) on their respective ports.
5. Observe the event flow between services via RabbitMQ.

## Manual Usage (without Docker)
1. Install dependencies in each service:
	```bash
	pnpm install
	```
2. Start RabbitMQ locally or via Docker.
3. Start each service manually:
	```bash
	node src/index.js
	```
4. Test endpoints and event flow as above.

## Learning
This demo is to understand event-based communication and how to migrate to Kafka.

