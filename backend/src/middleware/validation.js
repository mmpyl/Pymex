// backend/src/middleware/validation.js
// Middleware centralizado para validación de entrada
// Previene inyección SQL, XSS y datos corruptos en BD

const { validationResult } = require('express-validator');

/**
 * Middleware factory para validación de entrada
 * @param {Array} rules - Array de reglas de validación de express-validator
 * @returns {Array} - Middleware chain que incluye validación y manejo de errores
 * 
 * Uso en rutas:
 * router.post('/login', validate([
 *   check('email').isEmail().normalizeEmail(),
 *   check('password').isLength({ min: 6 }).trim()
 * ]), authController.login);
 */
const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validación fallida',
        detalles: errors.array().map(err => ({
          campo: err.path,
          mensaje: err.msg,
          valor: err.value ? String(err.value).substring(0, 50) : undefined
        }))
      });
    }
    next();
  }
];

/**
 * Reglas de sanitización comunes para prevenir XSS
 */
const sanitizeString = (field) => [
  require('express-validator').check(field).optional(),
  require('express-validator').sanitize(field).trim().escape()
];

/**
 * Función auxiliar para sanitizar valores string
 * Elimina tags HTML, scripts y eventos potencialmente peligrosos
 * @param {string} value - Valor a sanitizar
 * @returns {string} - Valor sanitizado
 */
const sanitizeValue = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * Limpia query params, body y params de posibles scripts maliciosos (XSS)
 * Sanitiza req.query, req.body y req.params recursivamente para objetos anidados
 */
const sanitizeQuery = (req, res, next) => {
  // Sanitizar req.query
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      req.query[key] = sanitizeValue(req.query[key]);
    });
  }

  // Sanitizar req.body
  if (req.body) {
    const sanitizeObject = (obj) => {
      if (typeof obj === 'string') {
        return sanitizeValue(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
      }
      if (obj !== null && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          obj[key] = sanitizeObject(obj[key]);
        });
        return obj;
      }
      return obj;
    };
    
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitizeObject(req.body[key]);
    });
  }

  // Sanitizar req.params
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      req.params[key] = sanitizeValue(req.params[key]);
    });
  }

  next();
};

module.exports = {
  validate,
  sanitizeString,
  sanitizeQuery
};
