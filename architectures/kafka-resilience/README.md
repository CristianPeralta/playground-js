# Kafka Resilience Demo

Demostración de patrones de resiliencia con Kafka: reintentos, DLQ (Dead-Letter Queue), reconexión automática, y métricas básicas.

## Objetivo
Aprender a implementar tolerancia a fallos y manejo de resiliencia en sistemas distribuidos usando Kafka. Ejemplo basado en Node.js.

## Estructura Base

- `.env` / `.env.example`: Configuración de entorno, topics, reintentos, DLQ, etc.
- `docker-compose.yml`: Definición de servicios (Kafka, Zookeeper, productores y consumidores Node.js)
- `src/producer.js`: Envía mensajes a un topic principal
- `src/consumer.js`: Procesa mensajes con reintentos y fallback a DLQ
- `src/dlq-consumer.js`: Permite revisar y reprocesar mensajes desde DLQ
- `src/utils/`: Lógica de reintentos, conexión y métricas

## Dependencias mínimas

- node@22.21
- kafkajs@2.2.4
- faker@5.5.3
- dotenv@16.4.5

---

## Experimentos: Aprende probando

Lanza todo el entorno:

```bash
docker compose up --build
```

### 1. Observar flujo normal
- Verás que el producer envía mensajes y el consumer los procesa.
- Las métricas en consola mostrarán los éxitos.

### 2. Simular fallos y reintentos
- Ajusta `FAILURE_PROBABILITY` en `.env` (por ej. 0.7) para aumentar la tasa de error.
- Reinicia el servicio `consumer`:
  ```bash
  docker compose restart consumer
  ```
- Observa cómo aparecen mensajes de reintentos y cuándo un mensaje es enviado a DLQ tras sobrepasar los intentos configurados.

### 3. Ver el Dead-Letter Queue (DLQ)
- El consumidor de DLQ imprime los mensajes enviados que fallaron.
- Verás en consola el mensaje original, detalles y razón del fallo.

### 4. Reprocesar mensajes desde DLQ
- Levanta el consumer DLQ con recuperación activada:
  ```bash
  docker compose run dlq-consumer --reprocess
  ```
- Los mensajes fallidos serán reenviados al topic principal.
- El consumer los volverá a procesar (¡puedes variar la probabilidad de fallo para ver ambos caminos!).

### 5. Simular caída y reconexión
- Baja el broker Kafka (temporalmente):
  ```bash
  docker compose stop kafka
  # espera unos segundos
  docker compose start kafka
  ```
- Observa cómo el consumer se reconecta automáticamente y sigue funcionando.

### 6. Cambiar política de reintentos
- Modifica `RETRY_MAX_ATTEMPTS` y `RETRY_BACKOFF_MS` en `.env` para experimentar con otros tiempos y políticas.

### 7. Métricas en consola
- Todos los servicios imprimen métricas en consola para que veas:
  - Mensajes procesados
  - Número de reintentos
  - Fallos fatales (DLQ)
  - Reprocesamientos desde DLQ
  - Reconexiones detectadas

---

## ¿Cómo funciona este playground?

- **Producer**: envía mensajes falsos con Faker periódicamente.
- **Consumer**: lee el topic principal, simula errores al azar, reintenta y usa DLQ si falla repetidamente.
- **DLQ Consumer**: escucha el DLQ y puede reprocesar mensajes fallidos.

Explora, ajusta la configuración y prueba diferentes escenarios de resiliencia y manejo de errores con Kafka.
