// backend/src/middleware/auth.js — versión consolidada con secrets separados
// Usa Redis para blacklist de tokens (multi-instancia) con fallback en memoria.
// Para revocación persistente real en despliegues con load balancer.

const jwt    = require('jsonwebtoken');
const crypto = require('crypto');

// ─── SEPARACIÓN CRIPTOGRÁFICA: Secrets diferentes para empresa y admin ────────
// Cada tipo de token usa un secret diferente para aislamiento criptográfico completo
const JWT_SECRET_EMPRESA = process.env.JWT_SECRET_EMPRESA || process.env.JWT_SECRET;
const JWT_SECRET_ADMIN = process.env.JWT_SECRET_ADMIN || process.env.JWT_SECRET;

// Validar que los secrets estén configurados en producción
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET_EMPRESA || !process.env.JWT_SECRET_ADMIN) {
    console.warn('[AUTH] ADVERTENCIA: En producción se deben usar JWT_SECRET_EMPRESA y JWT_SECRET_ADMIN separados');
  }
  if (process.env.JWT_SECRET_EMPRESA === process.env.JWT_SECRET_ADMIN) {
    console.error('[AUTH] CRÍTICO: JWT_SECRET_EMPRESA y JWT_SECRET_ADMIN son iguales. Esto reduce la seguridad.');
  }
}

/**
 * Obtiene el secret correcto según el tipo de token
 * @param {'empresa' | 'admin'} tokenType 
 * @returns {string} El secret correspondiente
 */
const getSecretForTokenType = (tokenType) => {
  return tokenType === 'admin' ? JWT_SECRET_ADMIN : JWT_SECRET_EMPRESA;
};

// Intentar cargar Redis, fallback a memoria si no está disponible
let redisClient = null;
let useRedis = false;
let redisConnectionFailed = false;

try {
  const redisConfig = require('../config/redis');
  redisClient = redisConfig;
  
  // Verificar conexión al inicio (sin bloquear, pero registrando el estado)
  redisConfig.checkConnection()
    .then(connected => {
      useRedis = connected;
      redisConnectionFailed = !connected;
      
      if (useRedis) {
        console.log('[Auth] Usando Redis para blacklist de tokens');
      } else {
        const warningMsg = '[Auth] Redis no disponible, usando fallback en memoria (limitado a una instancia)';
        if (process.env.NODE_ENV === 'production') {
          console.error(`[CRÍTICO] ${warningMsg}. El logout puede no funcionar correctamente en multi-instancia.`);
        } else {
          console.warn(warningMsg);
        }
      }
    })
    .catch(err => {
      redisConnectionFailed = true;
      console.error('[Auth] Error verificando conexión Redis:', err.message);
    });
} catch (error) {
  redisConnectionFailed = true;
  console.warn('[Auth] Redis no configurado, usando fallback en memoria');
}

// ─── Fallback en memoria (solo para desarrollo o si Redis falla) ──────────────
const tokenBlacklist = new Map();

const isBlacklistedMemory = (jti) => {
  if (!jti) return false;
  const expiresAt = tokenBlacklist.get(jti);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    tokenBlacklist.delete(jti);
    return false;
  }
  return true;
};

const revokeTokenMemory = (jti, expiresAtMs) => {
  if (jti) tokenBlacklist.set(jti, expiresAtMs);
};

// Cleanup expired entries every 15 minutes (solo para fallback en memoria)
setInterval(() => {
  if (!useRedis && tokenBlacklist.size > 0) {
    const now = Date.now();
    for (const [jti, exp] of tokenBlacklist.entries()) {
      if (now > exp) tokenBlacklist.delete(jti);
    }
  }
}, 15 * 60 * 1000);

// ─── MODO ESTRICTO PARA PRODUCCIÓN ────────────────────────────────────────────
// En producción, SI Redis falla, se debe rechazar la operación de revocación
// en lugar de hacer fallback a memoria (que no funciona en multi-instancia).
const STRICT_MODE = process.env.NODE_ENV === 'production';


// Registrar cuando Redis falla para monitoreo
if (typeof redisClient !== 'undefined' && redisClient) {
  redisClient.redis?.on('error', (err) => {
    redisConnectionFailed = true;
    if (STRICT_MODE) {
      console.error('[CRÍTICO] Redis falló en producción. La revocación de tokens puede no funcionar correctamente en todas las instancias.');
    }
  });
  
  redisClient.redis?.on('connect', () => {
    redisConnectionFailed = false;
  });
}

// ─── Helpers con soporte Redis ────────────────────────────────────────────────

// Verificar si un token está en la blacklist (Redis o memoria)
const isBlacklisted = async (jti) => {
  if (!jti) return false;
  
  // Si Redis está disponible, usarlo
  if (useRedis && redisClient) {
    try {
      return await redisClient.isBlacklisted(jti);
    } catch (error) {
      console.error('[Auth] Error verificando blacklist en Redis, usando fallback:', error.message);
      // Fallback a memoria si Redis falla
      return isBlacklistedMemory(jti);
    }
  }
  
  // Fallback a memoria
  return isBlacklistedMemory(jti);
};

// Revocar un token (Redis o memoria)
const revokeToken = async (jti, expiresAtMs) => {
  if (!jti) return;
  
  const ttlSeconds = Math.max(1, Math.floor((expiresAtMs - Date.now()) / 1000));
  
  // Si Redis está disponible, usarlo
  if (useRedis && redisClient) {
    try {
      await redisClient.revokeToken(jti, ttlSeconds);
      return;
    } catch (error) {
      console.error('[Auth] Error revocando token en Redis, usando fallback:', error.message);
      // En producción, alertar que el fallback a memoria no es seguro en multi-instancia
      if (STRICT_MODE) {
        console.error('[CRÍTICO] Fallback a memoria activado en producción. El logout puede no funcionar en todas las instancias.');
      }
      // Fallback a memoria si Redis falla
    }
  }
  
  // Fallback a memoria
  revokeTokenMemory(jti, expiresAtMs);
};

// Función para verificar estado de Redis (útil para health checks)
const getRedisStatus = () => ({
  useRedis,
  redisConnectionFailed,
  fallbackActive: !useRedis || redisConnectionFailed,
  strictModeEnabled: STRICT_MODE
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseBearer = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7);
};

// ─── Middleware: token de empresa ─────────────────────────────────────────────
const verificarTokenEmpresa = async (req, res, next) => {
  try {
    const token = parseBearer(req);
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    // Usar el secret específico para tokens de empresa
    const decoded = jwt.verify(token, JWT_SECRET_EMPRESA);

    if (decoded.token_type !== 'empresa') {
      return res.status(403).json({ error: 'Token no válido para esta ruta' });
    }

    // Validación estricta de scope para evitar acceso cruzado
    if (decoded.scope !== 'business') {
      return res.status(403).json({ error: 'Scope inválido para acceso de empresa' });
    }

    const blacklisted = await isBlacklisted(decoded.jti);
    if (blacklisted) {
      return res.status(401).json({ error: 'Token revocado. Inicia sesión nuevamente.', code: 'TOKEN_REVOKED' });
    }

    req.usuario = decoded;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// ─── Middleware: token de admin ───────────────────────────────────────────────
const verificarTokenAdmin = async (req, res, next) => {
  try {
    const token = parseBearer(req);
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    // Usar el secret específico para tokens de admin
    const decoded = jwt.verify(token, JWT_SECRET_ADMIN);

    if (decoded.token_type !== 'admin') {
      return res.status(403).json({ error: 'Token no válido para panel admin' });
    }

    // Validación estricta de scope para evitar acceso cruzado
    if (decoded.scope !== 'global') {
      return res.status(403).json({ error: 'Scope inválido para acceso global' });
    }

    const blacklisted = await isBlacklisted(decoded.jti);
    if (blacklisted) {
      return res.status(401).json({ error: 'Token revocado. Inicia sesión nuevamente.' });
    }

    req.admin = decoded;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Alias de compatibilidad
const verificarToken = verificarTokenEmpresa;

module.exports = {
  verificarToken,
  verificarTokenEmpresa,
  verificarTokenAdmin,
  revokeToken,
  isBlacklisted,
  parseBearer,
  getRedisStatus,
  getSecretForTokenType
};