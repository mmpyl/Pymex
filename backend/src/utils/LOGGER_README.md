# Sistema de Logging Estructurado

## Descripción
Este módulo implementa un sistema de logging estructurado utilizando **Winston** para reemplazar el uso inconsistente de `console.log` y Morgan, facilitando el parsing en sistemas SIEM y mejorando la capacidad de debugging y auditoría.

## Características

### ✅ Formatos de Log
- **Producción**: JSON estructurado (SIEM-compatible)
- **Desarrollo**: Formato coloreado legible en consola

### ✅ Niveles de Log Personalizados
```javascript
{
  error: 0,    // Errores críticos
  warn: 1,     // Advertencias
  info: 2,     // Información general
  http: 3,     // Requests HTTP
  verbose: 4,  // Logs detallados
  debug: 5,    // Debugging
  silly: 6     // Logs muy detallados
}
```

### ✅ Transportes Múltiples
1. **Consola**: Salida en tiempo real
2. **logs/error.log**: Solo errores (rotación: 5 archivos de 5MB)
3. **logs/combined.log**: Todos los logs (rotación: 5 archivos de 5MB)
4. **logs/exceptions.log**: Excepciones no capturadas
5. **logs/rejections.log**: Promesas rechazadas no manejadas

### ✅ Métodos Disponibles

```javascript
const logger = require('./utils/logger');

// Métodos estándar
logger.error('Mensaje de error', { metadata });
logger.warn('Advertencia', { metadata });
logger.info('Información', { metadata });
logger.verbose('Detalle', { metadata });
logger.debug('Debug', { metadata });
logger.silly('Muy detallado', { metadata });

// Métodos personalizados
logger.audit('Evento de auditoría', { userId, action, resource });
logger.http('Request HTTP', { method, url, statusCode });

// Middleware para Express
app.use(logger.expressMiddleware());
```

## Ejemplos de Uso

### 1. Logging en Controladores
```javascript
const logger = require('../utils/logger');

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    
    logger.info('Producto creado exitosamente', {
      productId: product.id,
      userId: req.user.id,
      companyId: req.user.companyId
    });
    
    res.json(product);
  } catch (error) {
    logger.error('Error creando producto', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id
    });
    
    res.status(500).json({ error: 'Error interno' });
  }
};
```

### 2. Logging de Auditoría
```javascript
// Para eventos de seguridad o cambios críticos
logger.audit('Usuario modificado', {
  userId: user.id,
  modifiedBy: req.user.id,
  changes: { oldRole: 'user', newRole: 'admin' },
  ip: req.ip,
  userAgent: req.get('user-agent')
});
```

### 3. Logging en Servicios
```javascript
const logger = require('../utils/logger');

class EmailService {
  async sendEmail(data) {
    logger.info('Enviando email', {
      to: data.to,
      subject: data.subject,
      template: data.template
    });
    
    try {
      // lógica de envío...
      logger.info('Email enviado exitosamente', { to: data.to });
    } catch (error) {
      logger.error('Error enviando email', {
        to: data.to,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}
```

## Estructura de Logs JSON (Producción)

```json
{
  "level": "info",
  "message": "Producto creado exitosamente",
  "timestamp": "2026-04-27 10:30:45.123",
  "metadata": {
    "productId": "abc123",
    "userId": "user456",
    "companyId": "comp789",
    "context": "http"
  }
}
```

## Integración con SIEM

Los logs en producción están en formato JSON y pueden ser fácilmente parseados por:
- **Splunk**
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Datadog**
- **New Relic**
- **AWS CloudWatch Logs Insights**

### Ejemplo de Query (Elasticsearch)
```json
GET /logs/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "level": "error" }},
        { "range": { "timestamp": { "gte": "now-1h" }}}
      ]
    }
  }
}
```

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NODE_ENV` | Entorno (production/development) | `development` |
| `LOG_LEVEL` | Nivel mínimo de logging | `debug` (dev), `info` (prod) |

## Migración desde console.log

### Antes
```javascript
console.log('Usuario creado:', user.id);
console.error('Error:', error.message);
```

### Después
```javascript
const logger = require('./utils/logger');

logger.info('Usuario creado', { userId: user.id });
logger.error('Error procesando solicitud', { 
  error: error.message,
  stack: error.stack 
});
```

## Archivos de Log

| Archivo | Propósito | Rotación |
|---------|-----------|----------|
| `logs/combined.log` | Todos los logs | 5 x 5MB |
| `logs/error.log` | Solo errores | 5 x 5MB |
| `logs/exceptions.log` | Excepciones no capturadas | Manual |
| `logs/rejections.log` | Promesas rechazadas | Manual |

## Buenas Prácticas

1. ✅ **Siempre incluir metadata contextual** (userId, requestId, etc.)
2. ✅ **Usar el nivel apropiado** (error para fallos, info para operaciones normales)
3. ✅ **No loggear información sensible** (contraseñas, tokens completos)
4. ✅ **Incluir stack traces en errores** (automático con Winston)
5. ✅ **Usar logger.audit() para eventos de seguridad**

## Anti-patrones a Evitar

❌ ```javascript
console.log(password); // Nunca loggear datos sensibles
```

❌ ```javascript
logger.info('Error:', error); // Usar logger.error() con metadata
```

❌ ```javascript
logger.info('Operación completada'); // Incluir contexto/metadata
```

## Testing

```bash
# Probar el logger
node -e "const logger = require('./src/utils/logger'); logger.info('Test');"

# Ver logs en tiempo real
tail -f logs/combined.log

# Ver solo errores
tail -f logs/error.log
```
