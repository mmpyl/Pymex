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
 * Limpia query params de posibles scripts maliciosos
 */
const sanitizeQuery = (req, res, next) => {
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        // Eliminar tags HTML y scripts potencialmente peligrosos
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }
  next();
};

module.exports = {
  validate,
  sanitizeString,
  sanitizeQuery
};
