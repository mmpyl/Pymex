// backend/src/middleware/idempotency.js — Middleware para prevenir procesamiento duplicado
const { redis } = require('../config/redis');

/**
 * Middleware de idempotencia para endpoints críticos (webhooks, pagos, etc.)
 * 
 * Funcionamiento:
 * - El cliente debe enviar un header 'idempotency-key' único por cada operación
 * - Si la clave ya existe en Redis, se devuelve la respuesta cacheada
 * - Si no existe, se procesa la solicitud y se cachea la respuesta por 24 horas
 * 
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Next middleware
 */
const idempotencyMiddleware = async (req, res, next) => {
  const key = req.headers['idempotency-key'];
  
  // Si no hay clave de idempotencia, continuar normalmente
  if (!key) {
    return next();
  }

  const cacheKey = `idempotency:${key}`;

  try {
    // Verificar si ya existe una respuesta cacheada
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`[Idempotencia] Respuesta cacheada encontrada para clave: ${key}`);
      return res.status(200).json(JSON.parse(cached));
    }

    // Interceptar el método res.json para cachear la respuesta
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Cacheamos la respuesta por 24 horas (86400 segundos)
      redis.setex(cacheKey, 86400, JSON.stringify(body)).catch((err) => {
        console.error('[Idempotencia] Error al cachear respuesta:', err.message);
      });
      return originalJson(body);
    };

    next();
  } catch (error) {
    console.error('[Idempotencia] Error verificando cache:', error.message);
    // En caso de error con Redis, continuar sin idempotencia (fail-open)
    next();
  }
};

module.exports = { idempotencyMiddleware };
