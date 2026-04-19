// backend/src/middleware/auth.js — versión consolidada
// Usa blacklist en memoria (Map) con TTL basado en exp del JWT.
// No depende de RevokedToken en DB para evitar race conditions en multi-instancia.
// Para revocación persistente real, usar Redis o tabla revoked_tokens.

const jwt    = require('jsonwebtoken');
const crypto = require('crypto');

// ─── In-memory token blacklist ────────────────────────────────────────────────
const tokenBlacklist = new Map();

const isBlacklisted = (jti) => {
  if (!jti) return false;
  const expiresAt = tokenBlacklist.get(jti);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    tokenBlacklist.delete(jti);
    return false;
  }
  return true;
};

const revokeToken = (jti, expiresAtMs) => {
  if (jti) tokenBlacklist.set(jti, expiresAtMs);
};

// Cleanup expired entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [jti, exp] of tokenBlacklist.entries()) {
    if (now > exp) tokenBlacklist.delete(jti);
  }
}, 15 * 60 * 1000);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseBearer = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7);
};

// ─── Middleware: token de empresa ─────────────────────────────────────────────
const verificarTokenEmpresa = (req, res, next) => {
  try {
    const token = parseBearer(req);
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.token_type !== 'empresa') {
      return res.status(403).json({ error: 'Token no válido para esta ruta' });
    }

    if (isBlacklisted(decoded.jti)) {
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
const verificarTokenAdmin = (req, res, next) => {
  try {
    const token = parseBearer(req);
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.token_type !== 'admin') {
      return res.status(403).json({ error: 'Token no válido para panel admin' });
    }

    if (isBlacklisted(decoded.jti)) {
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
  parseBearer
};