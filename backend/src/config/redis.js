// backend/src/config/redis.js — Cliente Redis para blacklist de tokens
const Redis = require('ioredis');
const logger = require('../utils/logger');

// Configuración desde variables de entorno
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || null;
const REDIS_DB = parseInt(process.env.REDIS_DB, 10) || 0;

// Estado de la conexión
let connectionStatus = {
  connected: false,
  lastError: null,
  checkedAt: null
};

// Crear cliente Redis
const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  db: REDIS_DB,
  retryStrategy: (times) => {
    // Reintentar conexión con backoff exponencial (máx 3 segundos)
    if (times > 10) return null; // Dejar de reintentar después de 10 intentos
    return Math.min(times * 200, 3000);
  },
  lazyConnect: true, // No conectar inmediatamente, solo cuando se use
  maxRetriesPerRequest: 3
});

// Manejar eventos de conexión
redis.on('connect', () => {
  connectionStatus.connected = true;
  connectionStatus.lastError = null;
  logger.info('[Redis] Conectado exitosamente', { component: 'redis', event: 'connect' });
});

redis.on('error', (err) => {
  connectionStatus.connected = false;
  connectionStatus.lastError = err.message;
  logger.error('[Redis] Error de conexión', { component: 'redis', event: 'error', error: err.message });
  // En producción, considerar alertas o fallback a memoria local
});

redis.on('close', () => {
  connectionStatus.connected = false;
  logger.warn('[Redis] Conexión cerrada', { component: 'redis', event: 'close' });
});

// Función para verificar si un token está en la blacklist
const isBlacklisted = async (jti) => {
  if (!jti) return false;
  try {
    const result = await redis.get(`blacklist:${jti}`);
    return result === 'revoked';
  } catch (error) {
    logger.error('[Redis] Error verificando blacklist', { component: 'redis', event: 'blacklist_check', error: error.message });
    // Fallback: asumir que no está revocado para no bloquear usuarios legítimos
    return false;
  }
};

// Función para revocar un token con TTL
const revokeToken = async (jti, ttlSeconds) => {
  if (!jti) return;
  try {
    await redis.setex(`blacklist:${jti}`, ttlSeconds, 'revoked');
  } catch (error) {
    logger.error('[Redis] Error revocando token', { component: 'redis', event: 'revoke_token', error: error.message });
  }
};

// Función para limpiar manualmente (útil para tests o admin)
const removeFromBlacklist = async (jti) => {
  if (!jti) return;
  try {
    await redis.del(`blacklist:${jti}`);
  } catch (error) {
    logger.error('[Redis] Error removiendo de blacklist', { component: 'redis', event: 'remove_blacklist', error: error.message });
  }
};

// Verificar conexión al iniciar (opcional, para modo graceful degradation)
const checkConnection = async () => {
  try {
    await redis.ping();
    connectionStatus.connected = true;
    connectionStatus.checkedAt = new Date().toISOString();
    return true;
  } catch (error) {
    connectionStatus.connected = false;
    connectionStatus.lastError = error.message;
    connectionStatus.checkedAt = new Date().toISOString();
    logger.warn('[Redis] No disponible, usando fallback en memoria', { component: 'redis', event: 'connection_check' });
    return false;
  }
};

// Obtener estado actual de la conexión
const getConnectionStatus = () => ({
  ...connectionStatus,
  checkedAt: connectionStatus.checkedAt || null
});

module.exports = {
  redis,
  isBlacklisted,
  revokeToken,
  removeFromBlacklist,
  checkConnection,
  getConnectionStatus
};
