// backend/src/app.js — versión mejorada con validación y manejo de errores
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Validar variables de entorno ANTES de iniciar
require('./config/envValidator');

// Importar logger estructurado
const logger = require('./utils/logger');

// Importar configuración de Swagger
const swaggerSpec = require('./config/swagger');

const { auditMiddleware } = require('./middleware/audit');
const { errorHandler, handleUnhandledRejections } = require('./middleware/errorHandler');

// Inicializar manejo de promesas no manejadas
handleUnhandledRejections();

const app = express();

// ─── 1. Trust proxy ───────────────────────────────────────────────────────────
app.enable('trust proxy');

// ─── 2. HTTPS obligatorio en producción ──────────────────────────────────────
app.use((req, res, next) => {
  if (
    String(process.env.REQUIRE_HTTPS || 'false') === 'true' &&
    req.header('x-forwarded-proto') !== 'https'
  ) {
    return res.status(403).json({ error: 'HTTPS requerido' });
  }
  return next();
});

// ─── 3. Seguridad HTTP ────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// ─── 4. CORS estricto ─────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {return cb(null, true);}
    cb(new Error(`CORS: origen no permitido → ${origin}`));
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'Stripe-Signature', 'x-api-key', 'x-request-id']
}));

// ─── 5. Rate limits ───────────────────────────────────────────────────────────
// Límite global más restrictivo para API B2B (150 req / 15 min)
const limiterGlobal = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max:      Number(process.env.RATE_LIMIT_MAX || 150),
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Demasiadas solicitudes. Intenta más tarde.' },
  skipSuccessfulRequests: false,  // Contar todas las requests
  skipFailedRequests: false       // Contar todas las requests
});

// Límite estricto para autenticación (20 intentos / 15 min) - se aplica antes que el global
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Demasiados intentos de autenticación. Espera 15 minutos.' },
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// Límite ultra-estricto para bootstrap-super-admin (3 intentos / hora) - solo desarrollo
const limiterBootstrap = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max:      3,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Demasiados intentos de bootstrap. Espera 1 hora.' }
});

// Aplicar limiterAuth ANTES que limiterGlobal para endpoints críticos
app.use('/api/auth/login', limiterAuth);
app.use('/api/auth/register', limiterAuth);
app.use('/api/auth/admin/login', limiterAuth);
app.use('/api/auth/bootstrap-super-admin', limiterBootstrap);
app.use('/api/auth', limiterGlobal);

// ─── 6. Logging estructurado con Winston (reemplaza Morgan) ──────────────────
app.use(logger.expressMiddleware());

// ─── 7. Request ID + structured log ──────────────────────────────────────────
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  return next();
});

// ─── 8. Body parsing ──────────────────────────────────────────────────────────
// Stripe webhooks necesitan raw body ANTES del JSON parser
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));
app.use(cookieParser());

// ─── 9. Auditoría global ──────────────────────────────────────────────────────
app.use(auditMiddleware);

// ─── 10. Health check ─────────────────────────────────────────────────────────
const { getRedisStatus } = require('./middleware/auth');

app.get('/health', (_req, res) => {
  const redisStatus = getRedisStatus();
  const isProduction = process.env.NODE_ENV === 'production';

  // En producción con STRICT_MODE, si Redis falla el health check debe fallar
  if (isProduction && redisStatus.fallbackActive) {
    return res.status(503).json({
      estado: 'degraded',
      version: '2.0',
      service: 'backend',
      fecha: new Date().toISOString(),
      redis: redisStatus,
      error: 'Redis no disponible. En producción esto afecta la revocación de tokens en multi-instancia.'
    });
  }

  res.json({
    estado: 'ok',
    version: '2.0',
    service: 'backend',
    fecha: new Date().toISOString(),
    redis: redisStatus
  });
});
app.get('/', (_req, res) => res.json({ mensaje: 'SaaS PYMES API OK' }));

// ─── 10.1 Documentación Swagger/OpenAPI ──────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SaPyme API Docs'
}));

// ─── 11. Rutas ────────────────────────────────────────────────────────────────
// Nota: limiterAuth ya se aplica en la sección 5 para /api/auth/login y /api/auth/register
// El limiterGlobal se aplica en /api/auth para el resto de endpoints de autenticación

// Rutas organizadas por Dominios (DDD)
const authDomain = require('./domains/auth');
app.use('/api/auth', authDomain.routes.auth);
app.use('/api/rbac', authDomain.routes.rbac);

// Rutas del dominio CORE (por migrar)
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/gastos', require('./routes/gastos'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/inventario', require('./routes/inventario'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/alertas', require('./routes/alertas'));
app.use('/api/reportes', require('./routes/reportes'));

// Rutas del dominio BILLING (parcialmente migrado)
app.use('/api/ml', require('./routes/ml'));
app.use('/api/facturacion', require('./routes/facturacion'));
app.use('/api/saas', require('./routes/saas'));
app.use('/api/suspensiones',require('./routes/suspensiones'));
app.use('/api/pagos', require('./routes/pagos'));
app.use('/api/public', require('./routes/public'));
app.use('/api/features', require('./routes/features'));

// Rutas del dominio PAYMENTS
app.use('/api/payments', require('./routes/payments'));

// Ruta de super-admin (pendiente de migrar a dominio)
app.use('/api/super-admin', require('./routes/admin'));

// ─── 12. 404 ──────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({
  error: 'Ruta no encontrada',
  code: 'NOT_FOUND',
  request_id: _req.requestId
}));

// ─── 13. Error handler global ─────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
