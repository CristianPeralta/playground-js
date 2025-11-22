# 📦 **event-driven-kafka**

An educational repository designed to learn **Kafka from zero to an architect-level mindset**, using **Node.js + Express** through small, focused subprojects.

This repo is NOT meant for production. Instead, it is a **learning playground** where you will:

* Understand how Kafka works internally.
* Build microservices communicating through events.
* Explore data pipelines and real-time processing.
* Learn resilience, retries, idempotency, DLQs and backoff strategies.
* Practice Event Sourcing and CQRS patterns.
* Develop critical thinking to decide **when Kafka is the right tool**—and when it isn’t.

The focus is to grow from *senior developer* to someone with a **strategic, architecture-oriented profile** capable of designing distributed systems with high throughput and reliability.

---

# 🎯 **Goals**

* Build a solid mental model of Kafka’s internals: partitions, groups, offsets, logs.
* Learn how to integrate Kafka into Node.js microservices.
* Practice event-driven design in real scenarios.
* Understand common architectural patterns: pub/sub, pipelines, replay, event sourcing, CQRS.
* Strengthen the ability to evaluate Kafka vs other technologies (RabbitMQ, Redis Streams, gRPC, REST).

---

# 🏗️ **Project Structure**

```
event-driven-kafka/
├── README.md
├── kafka-environment/
│   ├── docker-compose.yml
│   └── reset.sh
├── 01-basics/
├── 02-partitions-and-groups/
├── 03-producer-advanced/
├── 04-consumer-advanced/
├── 05-pub-sub/
├── 06-streams/
├── 07-pipelines-etl/
├── 08-microservices-demo/
├── 09-resilience-fallback/
├── 10-observability/
├── 11-security/
├── 12-event-sourcing/
├── 13-cqrs/
└── 14-architecture-thinking/
```

---

# 📁 **What’s inside `kafka-environment/`?**

```
kafka-environment/
├── docker-compose.yml
└── reset.sh
```

### **docker-compose.yml**

A preconfigured local Kafka environment that includes:

* Zookeeper
* Kafka broker
* Optional UI: Kafka UI or Redpanda Console
* Reusable configuration across all subprojects
* Clean and simple development setup

Every subproject connects to the same Kafka instance.

### **reset.sh**

A helper script to fully reset Kafka:

* Delete topics
* Recreate topics
* Clear logs
* Restart services

Useful when experimenting:

```sh
./reset.sh
```

---

# 📘 **Kafka Learning Roadmap**

Below is the full set of subprojects, each one designed to teach a core concept or pattern.

```md
| Level | Topic                      | Objective                                                                                                       |
| ----- | -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1️⃣    | **basics**                 | Create producer/consumer, understand topics, offsets, partitions and the log-based storage model.               |
| 2️⃣    | **partitions & groups**    | Understand partitions, consumer groups, parallelism and rebalances.                                             |
| 3️⃣    | **producer-advanced**      | Configure acks, retries, batching, idempotence and high availability.                                           |
| 4️⃣    | **consumer-advanced**      | Manual commits, backpressure, offset management, reprocessing and failure handling.                             |
| 5️⃣    | **pub-sub**                | Use business events to communicate microservices in a fully decoupled architecture.                             |
| 6️⃣    | **streams**                | Process and transform data in real time (filter, map, aggregate).                                               |
| 7️⃣    | **pipelines ETL**          | Build ETL-style pipelines across topics, clean data and store aggregated metrics.                               |
| 8️⃣    | **microservices-demo**     | Create Express microservices using an event-driven architecture powered by Kafka.                               |
| 9️⃣    | **resilience / fallback**  | Implement retries, DLQ, idempotency, exponential backoff and automatic failure recovery.                        |
| 🔟    | **observability**          | Build dashboards for lag, throughput, errors, health checks and critical events.                                |
| 1️⃣1️⃣  | **security**               | Configure SASL, ACLs and TLS for secure environments.                                                           |
| 1️⃣2️⃣  | **event sourcing**         | Store events as the system's source of truth, rebuild state via replay and optionally use snapshots.            |
| 1️⃣3️⃣  | **cqrs**                   | Separate write/read paths; implement commands, read models, projections and eventual consistency using Kafka.   |
| 1️⃣4️⃣  | **architecture-thinking**  | Evaluate when to use Kafka, compare it with other technologies and document architectural decisions (ADRs).     |
```
