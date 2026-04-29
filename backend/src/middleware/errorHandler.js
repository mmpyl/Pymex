// backend/src/middleware/errorHandler.js
// Manejador global de errores estandarizado para toda la API
// Implementa clasificación de errores, logging estructurado y respuestas consistentes

const logger = require('../utils/logger');

// Contador de errores para métricas
const errorMetrics = {
  total: 0,
  byType: {},
  byStatusCode: {},
  lastReset: Date.now()
};

// Función para actualizar métricas de errores
const updateErrorMetrics = (statusCode, errorCode) => {
  errorMetrics.total++;
  
  // Por tipo
  if (!errorMetrics.byType[errorCode]) {
    errorMetrics.byType[errorCode] = 0;
  }
  errorMetrics.byType[errorCode]++;
  
  // Por status code
  if (!errorMetrics.byStatusCode[statusCode]) {
    errorMetrics.byStatusCode[statusCode] = 0;
  }
  errorMetrics.byStatusCode[statusCode]++;
  
  // Resetear métricas cada hora
  if (Date.now() - errorMetrics.lastReset > 3600000) {
    errorMetrics.byType = {};
    errorMetrics.byStatusCode = {};
    errorMetrics.lastReset = Date.now();
  }
};

// Clase base para todos los errores de aplicación
class AppError extends Error {
  constructor(message, statusCode, code, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Errores operacionales comunes
class ValidationError extends AppError {
  constructor(message = 'Validación fallida', details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Autenticación requerida') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'No tienes permisos para esta acción') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflicto de recursos') {
    super(message, 409, 'CONFLICT');
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = 'Demasiadas solicitudes') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = 'Servicio no disponible') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

// Nuevas clases de error para mejor clasificación

// Errores de base de datos
class DatabaseError extends AppError {
  constructor(message = 'Error en la base de datos', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
    this.isOperational = false; // Los errores de DB generalmente no son operacionales
  }
}

class DatabaseConnectionError extends DatabaseError {
  constructor(message = 'No se pudo conectar a la base de datos') {
    super(message, 503, 'DATABASE_CONNECTION_ERROR');
  }
}

class DatabaseTimeoutError extends DatabaseError {
  constructor(message = 'Tiempo de espera agotado en la base de datos') {
    super(message, 504, 'DATABASE_TIMEOUT_ERROR');
  }
}

class UniqueConstraintError extends ConflictError {
  constructor(message = 'Violación de restricción única', fields = []) {
    super(message);
    this.code = 'UNIQUE_CONSTRAINT_VIOLATION';
    this.fields = fields;
  }
}

class ForeignKeyConstraintError extends DatabaseError {
  constructor(message = 'Violación de clave foránea', table = null) {
    super(message, 400, 'FOREIGN_KEY_CONSTRAINT_VIOLATION');
    this.table = table;
  }
}

// Errores de servicios externos
class ExternalServiceError extends AppError {
  constructor(message = 'Error en servicio externo', serviceName = 'unknown', statusCode = 502) {
    super(message, statusCode, 'EXTERNAL_SERVICE_ERROR');
    this.serviceName = serviceName;
    this.isOperational = false;
  }
}

class PaymentGatewayError extends ExternalServiceError {
  constructor(message = 'Error en pasarela de pagos', provider = 'unknown') {
    super(message, 'payment-gateway', 502);
    this.provider = provider;
    this.code = 'PAYMENT_GATEWAY_ERROR';
  }
}

class EmailServiceError extends ExternalServiceError {
  constructor(message = 'Error al enviar email') {
    super(message, 'email-service', 502);
    this.code = 'EMAIL_SERVICE_ERROR';
  }
}

class APIRateLimitError extends TooManyRequestsError {
  constructor(message = 'Límite de tasa excedido en servicio externo', service = 'unknown') {
    super(message);
    this.service = service;
    this.code = 'EXTERNAL_RATE_LIMIT_EXCEEDED';
  }
}

// Errores de reglas de negocio
class BusinessRuleError extends AppError {
  constructor(message = 'Violación de regla de negocio', ruleCode = null) {
    super(message, 400, 'BUSINESS_RULE_ERROR');
    this.ruleCode = ruleCode;
  }
}

class InsufficientStockError extends BusinessRuleError {
  constructor(message = 'Stock insuficiente', productId = null, available = 0, requested = 0) {
    super(message, 'INSUFFICIENT_STOCK');
    this.productId = productId;
    this.available = available;
    this.requested = requested;
  }
}

class InvalidOperationError extends BusinessRuleError {
  constructor(message = 'Operación inválida') {
    super(message, 'INVALID_OPERATION');
  }
}

class ResourceLockedError extends BusinessRuleError {
  constructor(message = 'Recurso bloqueado por otra operación') {
    super(message, 'RESOURCE_LOCKED');
    this.code = 'RESOURCE_LOCKED';
    this.statusCode = 409;
  }
}

class ExpiredResourceError extends BusinessRuleError {
  constructor(message = 'Recurso expirado') {
    super(message, 'EXPIRED_RESOURCE');
    this.statusCode = 410;
  }
}

// Manejador global de errores
const errorHandler = (err, req, res, next) => {
  // Determinar statusCode
  let statusCode = err.statusCode || err.status || 500;
  
  // Asegurar que solo códigos válidos HTTP
  if (statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  // Determinar si es error operacional o de programación
  const isOperational = err.isOperational || false;

  // Actualizar métricas de errores
  updateErrorMetrics(statusCode, err.code || 'INTERNAL_ERROR');

  // Log estructurado para monitoreo (compatible con SIEM)
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: statusCode >= 500 ? 'ERROR' : 'WARN',
    request_id: req.requestId || 'unknown',
    method: req.method,
    path: req.originalUrl,
    status_code: statusCode,
    error_code: err.code || 'INTERNAL_ERROR',
    message: err.message,
    user_id: req.usuario?.id || null,
    empresa_id: req.usuario?.empresa_id || null,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    is_operational: isOperational
  };

  // Agregar contexto adicional según el tipo de error
  if (err.serviceName) {
    logEntry.service_name = err.serviceName;
  }
  if (err.provider) {
    logEntry.provider = err.provider;
  }
  if (err.fields) {
    logEntry.fields = err.fields;
  }
  if (err.ruleCode) {
    logEntry.rule_code = err.ruleCode;
  }

  // En producción, no exponer stack traces en logs de nivel bajo
  if (process.env.NODE_ENV !== 'production' || statusCode >= 500) {
    logEntry.stack = err.stack;
  }

  // Logging diferenciado por severidad usando Winston
  if (statusCode >= 500) {
    logger.error('Error interno del servidor', logEntry);
  } else if (statusCode >= 400) {
    logger.warn(`Error del cliente: ${err.code}`, logEntry);
  }

  // Detección de solicitudes lentas (más de 5 segundos)
  const responseTime = req.startTime ? Date.now() - req.startTime : null;
  if (responseTime && responseTime > 5000) {
    logger.warn('Solicitud lenta detectada antes del error', {
      request_id: req.requestId,
      path: req.originalUrl,
      method: req.method,
      response_time: `${responseTime}ms`,
      error: err.message
    });
  }

  // Respuesta al cliente
  const responseBody = {
    error: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Error interno del servidor'
      : err.message || 'Error desconocido',
    code: err.code || 'INTERNAL_ERROR',
    request_id: req.requestId,
    timestamp: logEntry.timestamp
  };

  // Incluir detalles de validación si existen
  if (err.details) {
    responseBody.details = err.details;
  }

  // Incluir campos específicos para errores de base de datos
  if (err.fields) {
    responseBody.fields = err.fields;
  }
  if (err.table) {
    responseBody.table = err.table;
  }

  // Incluir información de stock para errores de inventario
  if (err.available !== undefined && err.requested !== undefined) {
    responseBody.stock = {
      available: err.available,
      requested: err.requested
    };
  }

  // Incluir stack trace solo en desarrollo para errores 500
  if (process.env.NODE_ENV !== 'production' && statusCode === 500 && err.stack) {
    responseBody.stack = err.stack.split('\n').slice(0, 10);
  }

  return res.status(statusCode).json(responseBody);
};

// Middleware para manejar promesas rechazadas (evita try-catch boilerplate)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware para monitorear tiempo de respuesta y detectar solicitudes lentas
const performanceMonitor = (thresholdMs = 5000) => {
  return (req, res, next) => {
    req.startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - req.startTime;
      
      // Registrar solicitudes lentas
      if (duration > thresholdMs) {
        logger.warn('Solicitud lenta detectada', {
          request_id: req.requestId,
          method: req.method,
          path: req.originalUrl,
          status_code: res.statusCode,
          duration: `${duration}ms`,
          threshold: `${thresholdMs}ms`,
          user_id: req.usuario?.id || null,
          ip: req.ip
        });
      }
      
      // Log de métricas de rendimiento en modo debug
      logger.debug('Métrica de rendimiento', {
        request_id: req.requestId,
        duration: `${duration}ms`,
        status_code: res.statusCode
      });
    });
    
    next();
  };
};

// Función para obtener métricas de errores
const getErrorMetrics = () => {
  return {
    ...errorMetrics,
    uptime: process.uptime(),
    memory_usage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };
};

// Función para resetear métricas manualmente
const resetErrorMetrics = () => {
  errorMetrics.total = 0;
  errorMetrics.byType = {};
  errorMetrics.byStatusCode = {};
  errorMetrics.lastReset = Date.now();
  logger.info('Métricas de errores reseteadas');
};

// Wrapper para errores de Sequelize/Database
const handleDatabaseError = (error, context = {}) => {
  const logger = require('../utils/logger');
  
  // Error de conexión
  if (error.name === 'SequelizeConnectionError' || error.code === 'ECONNREFUSED') {
    logger.error('Error de conexión a base de datos', {
      ...context,
      error_code: error.code,
      original_error: error.message
    });
    return new DatabaseConnectionError();
  }
  
  // Timeout
  if (error.name === 'SequelizeConnectionAcquireError' || error.code === 'ETIMEDOUT') {
    logger.error('Timeout adquiriendo conexión de base de datos', {
      ...context,
      original_error: error.message
    });
    return new DatabaseTimeoutError();
  }
  
  // Violación de restricción única
  if (error.name === 'SequelizeUniqueConstraintError') {
    const fields = error.errors?.map(e => e.path) || [];
    logger.warn('Violación de restricción única', {
      ...context,
      fields
    });
    return new UniqueConstraintError(error.message, fields);
  }
  
  // Violación de clave foránea
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    logger.warn('Violación de clave foránea', {
      ...context,
      table: error.table
    });
    return new ForeignKeyConstraintError(error.message, error.table);
  }
  
  // Error de validación de Sequelize
  if (error.name === 'SequelizeValidationError') {
    const details = error.errors?.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    })) || [];
    logger.warn('Error de validación de base de datos', {
      ...context,
      details
    });
    return new ValidationError('Error de validación', details);
  }
  
  // Error genérico de base de datos
  logger.error('Error genérico de base de datos', {
    ...context,
    error_name: error.name,
    error_code: error.code,
    original_error: error.message
  });
  return new DatabaseError(error.message, error);
};

// Manejador de promesas no manejadas a nivel de proceso
const handleUnhandledRejections = () => {
  process.on('unhandledRejection', (reason, promise) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'CRITICAL',
      event: 'unhandledRejection',
      reason: reason?.message || String(reason),
      stack: reason?.stack,
      memory_usage: process.memoryUsage(),
      uptime: process.uptime()
    };
    
    logger.crit?.('Rechazo de promesa no manejado', logEntry) || 
    logger.error('[CRÍTICO] Unhandled Rejection', logEntry);
    
    // No cerrar el proceso inmediatamente, pero alertar
    // En producción, considerar enviar alerta a monitoring
  });

  process.on('uncaughtException', (error) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'CRITICAL',
      event: 'uncaughtException',
      message: error.message,
      stack: error.stack,
      code: error.code,
      memory_usage: process.memoryUsage(),
      uptime: process.uptime()
    };
    
    logger.crit?.('Excepción no capturada', logEntry) ||
    logger.error('[CRÍTICO] Uncaught Exception', logEntry);
    
    // Cerrar gracefully después de guardar logs
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};

module.exports = {
  // Errores básicos
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  ServiceUnavailableError,
  
  // Errores de base de datos
  DatabaseError,
  DatabaseConnectionError,
  DatabaseTimeoutError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  
  // Errores de servicios externos
  ExternalServiceError,
  PaymentGatewayError,
  EmailServiceError,
  APIRateLimitError,
  
  // Errores de reglas de negocio
  BusinessRuleError,
  InsufficientStockError,
  InvalidOperationError,
  ResourceLockedError,
  ExpiredResourceError,
  
  // Middleware y utilidades
  errorHandler,
  asyncHandler,
  performanceMonitor,
  handleUnhandledRejections,
  handleDatabaseError,
  
  // Métricas
  getErrorMetrics,
  resetErrorMetrics
};
