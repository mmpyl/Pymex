const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Definir niveles de log personalizados (más detallados que los por defecto)
const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
    crit: -1 // Nivel crítico para emergencias
  },
  colors: {
    crit: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'rainbow'
  }
};

// Registrar los niveles personalizados
winston.addColors(logLevels.colors);

// Formatos personalizados para diferentes propósitos
const formats = {
  // Formato JSON para producción (SIEM-compatible)
  jsonFormat: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    winston.format.json()
  ),
  
  // Formato coloreado para desarrollo en consola
  colorFormat: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, ...metadata }) => {
      let msg = `${timestamp} [${level}]: ${message}`;
      if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
      }
      return msg;
    })
  )
};

// Determinar el entorno
const isProduction = process.env.NODE_ENV === 'production';

// Crear el logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  levels: logLevels.levels,
  
  // Formato principal (se puede sobreescribir por transporte)
  format: formats.jsonFormat,
  
  transports: [
    // Transporte para errores - archivo separado
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: formats.jsonFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Transporte para todos los logs combinados
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: formats.jsonFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Transporte para consola (diferente formato según entorno)
    new winston.transports.Console({
      format: isProduction ? formats.jsonFormat : formats.colorFormat,
      stderrLevels: ['error'], // Los errores van a stderr
    })
  ],
  
  // Manejo de excepciones no capturadas
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/exceptions.log'),
      format: formats.jsonFormat,
    })
  ],
  
  // Manejo de rechazos de promesas no capturados
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/rejections.log'),
      format: formats.jsonFormat,
    })
  ]
});

// Funciones helper para logging estructurado
logger.audit = (message, data = {}) => {
  logger.info(message, { 
    ...data, 
    context: 'audit',
    eventType: 'AUDIT_LOG'
  });
};

logger.http = (message, data = {}) => {
  logger.log('http', message, { 
    ...data, 
    context: 'http'
  });
};

logger.debug = (message, data = {}) => {
  logger.log('debug', message, { 
    ...data, 
    context: 'debug'
  });
};

logger.crit = (message, data = {}) => {
  logger.log('crit', message, { 
    ...data, 
    context: 'critical',
    urgency: 'high'
  });
};

// Función para crear un logger con contexto específico (útil para servicios)
logger.createChildLogger = (contextName) => {
  return {
    error: (message, data = {}) => logger.error(`[${contextName}] ${message}`, data),
    warn: (message, data = {}) => logger.warn(`[${contextName}] ${message}`, data),
    info: (message, data = {}) => logger.info(`[${contextName}] ${message}`, data),
    http: (message, data = {}) => logger.http(`[${contextName}] ${message}`, data),
    verbose: (message, data = {}) => logger.verbose(`[${contextName}] ${message}`, data),
    debug: (message, data = {}) => logger.debug(`[${contextName}] ${message}`, data),
    crit: (message, data = {}) => logger.crit(`[${contextName}] ${message}`, data),
    audit: (message, data = {}) => logger.audit(`[${contextName}] ${message}`, data)
  };
};

// Middleware para integrar con Express
logger.expressMiddleware = () => {
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        request_id: req.requestId,
        user_id: req.usuario?.id || null,
        empresa_id: req.usuario?.empresa_id || null
      };
      
      // Clasificar logs por nivel según el status code
      if (res.statusCode >= 500) {
        logger.error(`Error en solicitud ${req.method} ${req.originalUrl}`, logData);
      } else if (res.statusCode >= 400) {
        logger.warn(`Error del cliente en ${req.method} ${req.originalUrl}`, logData);
      } else {
        logger.http(`${req.method} ${req.originalUrl}`, logData);
      }
    });
    
    next();
  };
};

// Middleware para capturar errores no manejados en rutas asíncronas
logger.asyncErrorHandler = () => {
  return (err, req, res, next) => {
    logger.error('Error no manejado en ruta asíncrona', {
      error: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
      request_id: req.requestId
    });
    next(err);
  };
};

module.exports = logger;
