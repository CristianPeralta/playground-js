# Imagen base moderna de Node
FROM node:22.21-alpine

# Dir de trabajo
WORKDIR /app

# Copia solo package.json (y package-lock.json si existiera)
COPY package.json ./
COPY package-lock.json ./

# Instala dependencias sólo con npm
RUN npm ci --omit=dev

# Copia el resto del código
COPY . .

# Usa un usuario no-root
RUN adduser -S appuser && chown -R appuser /app
USER appuser

# Comando por defecto: sobrescrito por docker-compose
CMD ["node", "src/producer.js"]
