# Guía de Manejo de Errores Mejorada

Este documento describe las mejoras implementadas para capturar e identificar errores de manera más efectiva en la API.

## 1. Clasificación de Errores

### Errores Básicos
- `ValidationError` (400): Errores de validación de datos
- `AuthenticationError` (401): Errores de autenticación
- `AuthorizationError` (403): Errores de permisos
- `NotFoundError` (404): Recursos no encontrados
- `ConflictError` (409): Conflictos de recursos
- `TooManyRequestsError` (429): Límite de tasa excedido
- `ServiceUnavailableError` (503): Servicio no disponible

### Errores de Base de Datos
```javascript
const { 
  DatabaseError, 
  DatabaseConnectionError, 
  DatabaseTimeoutError,
  UniqueConstraintError,
  ForeignKeyConstraintError 
} = require('./middleware/errorHandler');

// Ejemplo de uso
try {
  await databaseOperation();
} catch (error) {
  throw handleDatabaseError(error, { context: 'crearUsuario' });
}
```

### Errores de Servicios Externos
```javascript
const { 
  ExternalServiceError, 
  PaymentGatewayError, 
  EmailServiceError,
  APIRateLimitError 
} = require('./middleware/errorHandler');

// Ejemplo: Error en pasarela de pagos
if (paymentFailed) {
  throw new PaymentGatewayError('Pago rechazado', 'stripe');
}

// Ejemplo: Error al enviar email
if (emailFailed) {
  throw new EmailServiceError('No se pudo enviar el correo');
}
```

### Errores de Reglas de Negocio
```javascript
const { 
  BusinessRuleError,
  InsufficientStockError,
  InvalidOperationError,
  ResourceLockedError,
  ExpiredResourceError 
} = require('./middleware/errorHandler');

// Ejemplo: Stock insuficiente
if (product.stock < requestedQuantity) {
  throw new InsufficientStockError(
    'No hay suficiente stock',
    product.id,
    product.stock,
    requestedQuantity
  );
}

// Ejemplo: Operación inválida
if (order.status !== 'pending') {
  throw new InvalidOperationError('Solo se pueden cancelar órdenes pendientes');
}
```

## 2. Logging Enriquecido

### Uso del Logger
```javascript
const logger = require('./utils/logger');

// Logs con contexto adicional
logger.error('Error al procesar pago', {
  user_id: userId,
  amount: 100,
  error_code: 'PAYMENT_FAILED',
  request_id: req.requestId
});

logger.warn('Intento de acceso no autorizado', {
  user_id: userId,
  resource: '/api/admin',
  ip: req.ip
});

logger.info('Usuario creado exitosamente', {
  user_id: newUser.id,
  empresa_id: newUser.empresa_id
});

// Logs críticos para emergencias
logger.crit('Base de datos no disponible', {
  database: 'postgres',
  error: error.message,
  timestamp: new Date().toISOString()
});
```

### Child Loggers (Logger con Contexto)
```javascript
// Crear un logger específico para un servicio
const paymentLogger = logger.createChildLogger('PaymentService');

paymentLogger.error('Pago fallido', { transaction_id: '123' });
// Output: [PaymentService] Pago fallido

const authLogger = logger.createChildLogger('AuthService');
authLogger.info('Login exitoso', { user_id: 456 });
// Output: [AuthService] Login exitoso
```

### Middleware de Logging Automático
El middleware `expressMiddleware()` ya está integrado en `app.js` y:
- Registra automáticamente todas las solicitudes HTTP
- Incluye duración, status code, user_id, empresa_id
- Clasifica automáticamente por nivel (error/warn/http) según el status code

## 3. Monitoreo de Tiempo de Respuesta

### Performance Monitor Middleware
```javascript
const { performanceMonitor } = require('./middleware/errorHandler');

// En app.js, después del logger.expressMiddleware()
app.use(performanceMonitor(5000)); // Threshold de 5 segundos

// Esto registrará automáticamente solicitudes lentas
```

Las solicitudes que excedan el threshold generarán un log como:
```json
{
  "level": "warn",
  "message": "Solicitud lenta detectada",
  "request_id": "uuid",
  "method": "POST",
  "path": "/api/ventas",
  "duration": "6234ms",
  "threshold": "5000ms",
  "user_id": 123
}
```

## 4. Wrapper para Errores de Sequelize

La función `handleDatabaseError` convierte automáticamente errores de Sequelize en errores de aplicación:

```javascript
const { handleDatabaseError } = require('./middleware/errorHandler');

// En un controller o servicio
async function createUser(userData) {
  try {
    return await User.create(userData);
  } catch (error) {
    // Convierte errores de Sequelize en errores de aplicación
    throw handleDatabaseError(error, {
      context: 'createUser',
      user_data: userData
    });
  }
}
```

Tipos de errores manejados automáticamente:
- `SequelizeConnectionError` → `DatabaseConnectionError`
- `SequelizeConnectionAcquireError` → `DatabaseTimeoutError`
- `SequelizeUniqueConstraintError` → `UniqueConstraintError`
- `SequelizeForeignKeyConstraintError` → `ForeignKeyConstraintError`
- `SequelizeValidationError` → `ValidationError`

## 5. Métricas de Errores

### Obtener Métricas
```javascript
const { getErrorMetrics } = require('./middleware/errorHandler');

// Endpoint de administración para ver métricas
app.get('/admin/error-metrics', (req, res) => {
  const metrics = getErrorMetrics();
  res.json(metrics);
});
```

Respuesta ejemplo:
```json
{
  "total": 150,
  "byType": {
    "VALIDATION_ERROR": 80,
    "AUTHENTICATION_ERROR": 30,
    "DATABASE_ERROR": 10,
    "INTERNAL_ERROR": 30
  },
  "byStatusCode": {
    "400": 80,
    "401": 30,
    "500": 40
  },
  "uptime": 3600.5,
  "memory_usage": {...},
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Resetear Métricas
```javascript
const { resetErrorMetrics } = require('./middleware/errorHandler');

// Reset manual (útil después de deploy o resolución de incidentes)
resetErrorMetrics();
```

## 6. Manejo de Promesas No Manejadas

El manejo de `unhandledRejection` y `uncaughtException` ya está configurado en `app.js`:

```javascript
const { handleUnhandledRejections } = require('./middleware/errorHandler');

// Al inicio de app.js
handleUnhandledRejections();
```

Estos handlers:
- Registran el error con nivel CRÍTICO
- Incluyen información de memoria y uptime
- Dan tiempo para guardar logs antes de cerrar (1 segundo)
- Cierran el proceso gracefulmente

## 7. Async Handler para Controllers

Evita try-catch boilerplate en controllers:

```javascript
const { asyncHandler } = require('./middleware/errorHandler');

// Antes
router.post('/ventas', async (req, res, next) => {
  try {
    const venta = await createVenta(req.body);
    res.json(venta);
  } catch (error) {
    next(error);
  }
});

// Ahora (más limpio)
router.post('/ventas', asyncHandler(async (req, res) => {
  const venta = await createVenta(req.body);
  res.json(venta);
}));
```

## 8. Ejemplo Completo de Uso

```javascript
const { 
  asyncHandler, 
  ValidationError, 
  InsufficientStockError,
  handleDatabaseError 
} = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Controller mejorado
exports.crearVenta = asyncHandler(async (req, res) => {
  const { productos, cliente_id } = req.body;
  
  // Validación
  if (!productos || productos.length === 0) {
    throw new ValidationError('Debe incluir al menos un producto');
  }
  
  // Verificar stock con logging
  for (const item of productos) {
    const producto = await Producto.findByPk(item.producto_id);
    
    if (!producto) {
      logger.warn('Producto no encontrado en venta', {
        producto_id: item.producto_id,
        request_id: req.requestId
      });
      throw new NotFoundError(`Producto ${item.producto_id} no encontrado`);
    }
    
    if (producto.stock < item.cantidad) {
      logger.warn('Stock insuficiente detectado', {
        producto_id: producto.id,
        stock_actual: producto.stock,
        cantidad_solicitada: item.cantidad,
        request_id: req.requestId
      });
      throw new InsufficientStockError(
        `Stock insuficiente para ${producto.nombre}`,
        producto.id,
        producto.stock,
        item.cantidad
      );
    }
  }
  
  // Crear venta con manejo de errores de DB
  try {
    const venta = await Venta.create({ 
      productos, 
      cliente_id,
      usuario_id: req.usuario.id 
    });
    
    logger.info('Venta creada exitosamente', {
      venta_id: venta.id,
      total: venta.total,
      user_id: req.usuario.id,
      request_id: req.requestId
    });
    
    res.status(201).json(venta);
  } catch (error) {
    // Usar wrapper para errores de base de datos
    throw handleDatabaseError(error, {
      context: 'crearVenta',
      cliente_id,
      productos_count: productos.length
    });
  }
});
```

## 9. Mejores Prácticas

1. **Siempre usa errores específicos**: En lugar de `throw new Error()`, usa `throw new ValidationError()` o la clase apropiada.

2. **Incluye contexto en los logs**: Siempre agrega `request_id`, `user_id`, y datos relevantes para debugging.

3. **Usa asyncHandler**: Reduce boilerplate y asegura que todos los errores asíncronos sean capturados.

4. **Para errores de DB, usa handleDatabaseError**: Convierte errores técnicos en errores de aplicación comprensibles.

5. **Loguea advertencias para errores 4xx**: Ayuda a detectar patrones de uso incorrecto de la API.

6. **Monitorea las métricas**: Revisa periódicamente `getErrorMetrics()` para detectar aumentos inusuales.

7. **Configura alertas**: Usa los logs críticos (`logger.crit`) para configurar alertas en tu sistema de monitoreo.

## 10. Estructura de Logs

Todos los logs siguen un formato estructurado compatible con SIEM:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "ERROR",
  "message": "Error interno del servidor",
  "request_id": "uuid-v4",
  "method": "POST",
  "path": "/api/ventas",
  "status_code": 500,
  "error_code": "DATABASE_ERROR",
  "user_id": 123,
  "empresa_id": 456,
  "ip": "192.168.1.1",
  "is_operational": false,
  "stack": "..."
}
```

Esto facilita la integración con herramientas como:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- Datadog
- New Relic
- AWS CloudWatch
