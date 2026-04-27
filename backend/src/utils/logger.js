const winston = require('winston');
const path = require('path');

// Definir niveles de log personalizados (más detallados que los por defecto)
const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
  },
  colors: {
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

// Middleware para integrar con Express
logger.expressMiddleware = () => {
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.http(`${req.method} ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
    });
    
    next();
  };
};

module.exports = logger;
