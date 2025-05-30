# Multi-stage build para optimización
FROM node:18-alpine AS builder

# Información del mantenedor
LABEL maintainer="estudiante@uni.pe"
LABEL description="DevSecOps Demo Node.js - UNI"
LABEL version="1.0.0"

# Instalar dumb-init para manejo de señales
RUN apk add --no-cache dumb-init

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Etapa de producción
FROM node:18-alpine AS runner

# Instalar dumb-init
RUN apk add --no-cache dumb-init curl

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Crear directorios necesarios
RUN mkdir -p /app/logs && \
    chown -R nodeuser:nodejs /app

# Cambiar a usuario no-root
USER nodeuser

WORKDIR /app

# Copiar node_modules desde builder
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules

# Copiar código fuente
COPY --chown=nodeuser:nodejs . .

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Usar dumb-init para manejo de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio
CMD ["node", "src/app.js"]