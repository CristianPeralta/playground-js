#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$ROOT_DIR"

echo "[event-driven-kafka] Stopping Kafka stack..."
docker compose down -v || docker-compose down -v || true

echo "[event-driven-kafka] Starting Kafka stack..."
docker compose up -d || docker-compose up -d

echo "[event-driven-kafka] Kafka environment is up."
