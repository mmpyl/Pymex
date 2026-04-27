// backend/src/middleware/errorHandler.js
// Manejador global de errores estandarizado para toda la API
// Implementa clasificación de errores, logging estructurado y respuestas consistentes

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
    is_operational: isOperational
  };

  // En producción, no exponer stack traces en logs de nivel bajo
  if (process.env.NODE_ENV !== 'production' || statusCode >= 500) {
    logEntry.stack = err.stack;
  }

  // Logging diferenciado por severidad
  if (statusCode >= 500) {
    console.error('[ERROR]', JSON.stringify(logEntry));
  } else if (statusCode >= 400) {
    console.warn('[WARN]', JSON.stringify(logEntry));
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

// Manejador de promesas no manejadas a nivel de proceso
const handleUnhandledRejections = () => {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRÍTICO] Unhandled Rejection at:', {
      promise: promise.toString(),
      reason: reason?.message || reason,
      stack: reason?.stack
    });
    
    // No cerrar el proceso inmediatamente, pero alertar
    // En producción, considerar enviar alerta a monitoring
  });

  process.on('uncaughtException', (error) => {
    console.error('[CRÍTICO] Uncaught Exception:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    // Cerrar gracefully
    process.exit(1);
  });
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  ServiceUnavailableError,
  errorHandler,
  asyncHandler,
  handleUnhandledRejections
};
