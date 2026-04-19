// backend/src/config/redis.js — Cliente Redis para blacklist de tokens
const Redis = require('ioredis');

// Configuración desde variables de entorno
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || null;
const REDIS_DB = parseInt(process.env.REDIS_DB, 10) || 0;

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
  console.log('[Redis] Conectado exitosamente');
});

redis.on('error', (err) => {
  console.error('[Redis] Error de conexión:', err.message);
  // En producción, considerar alertas o fallback a memoria local
});

redis.on('close', () => {
  console.warn('[Redis] Conexión cerrada');
});

// Función para verificar si un token está en la blacklist
const isBlacklisted = async (jti) => {
  if (!jti) return false;
  try {
    const result = await redis.get(`blacklist:${jti}`);
    return result === 'revoked';
  } catch (error) {
    console.error('[Redis] Error verificando blacklist:', error.message);
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
    console.error('[Redis] Error revocando token:', error.message);
  }
};

// Función para limpiar manualmente (útil para tests o admin)
const removeFromBlacklist = async (jti) => {
  if (!jti) return;
  try {
    await redis.del(`blacklist:${jti}`);
  } catch (error) {
    console.error('[Redis] Error removiendo de blacklist:', error.message);
  }
};

// Verificar conexión al iniciar (opcional, para modo graceful degradation)
const checkConnection = async () => {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.warn('[Redis] No disponible, usando fallback en memoria');
    return false;
  }
};

module.exports = {
  redis,
  isBlacklisted,
  revokeToken,
  removeFromBlacklist,
  checkConnection
};
