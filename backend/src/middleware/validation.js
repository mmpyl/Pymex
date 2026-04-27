// backend/src/middleware/validation.js
// Middleware de validación centralizada usando express-validator
// Proporciona validaciones comunes y manejo estandarizado de errores

const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('./errorHandler');

// Helper para normalizar strings (quitar acentos, trim, lowercase)
const normalizeString = (value) => {
  if (!value || typeof value !== 'string') return value;
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

// Validaciones comunes reutilizables
const commonValidations = {
  email: body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email demasiado largo'),

  password: body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Contraseña debe incluir mayúsculas, minúsculas y números'),

  nombre: body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombre solo puede contener letras y espacios'),

  ruc: body('ruc')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 11, max: 11 })
    .withMessage('RUC debe tener 11 dígitos')
    .matches(/^[0-9]+$/)
    .withMessage('RUC solo puede contener números'),

  dni: body('dni')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 8, max: 8 })
    .withMessage('DNI debe tener 8 dígitos')
    .matches(/^[0-9]+$/)
    .withMessage('DNI solo puede contener números'),

  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID inválido'),

  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página debe ser mayor a 0')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Límite debe estar entre 1 y 100')
      .toInt()
  ]
};

// Middleware para validar y manejar errores
const validate = (validations) => {
  return async (req, res, next) => {
    // Ejecutar todas las validaciones en paralelo
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Transformar errores a formato amigable
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));

    // Crear error de validación con detalles
    const validationError = new ValidationError('Validación fallida', formattedErrors);
    
    return next(validationError);
  };
};

// Validador personalizado para schemas dinámicos
const validateSchema = (schema) => {
  const validations = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    let validator;

    // Determinar si es body, param o query
    if (rules.in === 'param') {
      validator = param(field);
    } else if (rules.in === 'query') {
      validator = query(field);
    } else {
      validator = body(field);
    }

    // Aplicar modifiers
    if (rules.trim) validator = validator.trim();
    if (rules.normalize) validator = validator.custom(normalizeString);

    // Aplicar optional
    if (rules.optional) {
      validator = validator.optional({ 
        checkFalsy: rules.checkFalsy ?? false,
        checkNull: rules.checkNull ?? false 
      });
    }

    // Aplicar type validation
    if (rules.type === 'string') {
      validator = validator.isString().withMessage(`Debe ser texto`);
      if (rules.minLength) {
        validator = validator.isLength({ min: rules.minLength })
          .withMessage(`Mínimo ${rules.minLength} caracteres`);
      }
      if (rules.maxLength) {
        validator = validator.isLength({ max: rules.maxLength })
          .withMessage(`Máximo ${rules.maxLength} caracteres`);
      }
    } else if (rules.type === 'number' || rules.type === 'int') {
      validator = validator.isNumeric().withMessage('Debe ser número');
      if (rules.min !== undefined) {
        validator = validator.isFloat({ min: rules.min })
          .withMessage(`Mínimo ${rules.min}`);
      }
      if (rules.max !== undefined) {
        validator = validator.isFloat({ max: rules.max })
          .withMessage(`Máximo ${rules.max}`);
      }
    } else if (rules.type === 'email') {
      validator = validator.isEmail().withMessage('Email inválido').normalizeEmail();
    } else if (rules.type === 'boolean') {
      validator = validator.isBoolean().withMessage('Debe ser verdadero/falso');
    }

    // Aplicar pattern regex
    if (rules.pattern) {
      validator = validator.matches(rules.pattern).withMessage('Formato inválido');
    }

    // Aplicar custom validation
    if (rules.custom) {
      validator = validator.custom(rules.custom);
    }

    // Aplicar mensaje personalizado
    if (rules.message) {
      validator = validator.withMessage(rules.message);
    }

    validations.push(validator);
  }

  return validate(validations);
};

module.exports = {
  validate,
  validateSchema,
  commonValidations,
  normalizeString
};
