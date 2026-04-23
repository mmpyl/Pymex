// backend/src/app.js — versión producción consolidada (sin conflictos de merge)
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const crypto       = require('crypto');
require('dotenv').config();

const { auditMiddleware } = require('./middleware/audit');

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
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origen no permitido → ${origin}`));
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'Stripe-Signature', 'x-api-key']
}));

// ─── 5. Rate limits ───────────────────────────────────────────────────────────
// Límite global más restrictivo para API B2B (150 req / 15 min)
const limiterGlobal = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max:      Number(process.env.RATE_LIMIT_MAX || 150),
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Demasiadas solicitudes. Intenta más tarde.' }
});

// Límite estricto para autenticación (20 intentos / 15 min) - se aplica antes que el global
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Demasiados intentos de autenticación. Espera 15 minutos.' }
});

// Aplicar limiterAuth ANTES que limiterGlobal para endpoints críticos
app.use('/api/auth/login', limiterAuth);
app.use('/api/auth/register', limiterAuth);
app.use('/api/auth', limiterGlobal);

// ─── 6. Logging ───────────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── 7. Request ID + structured log ──────────────────────────────────────────
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId   = requestId;
  res.setHeader('x-request-id', requestId);

  if (process.env.NODE_ENV === 'production') {
    const start = Date.now();
    res.on('finish', () => {
      console.log(JSON.stringify({
        timestamp:   new Date().toISOString(),
        request_id:  requestId,
        method:      req.method,
        path:        req.originalUrl,
        status:      res.statusCode,
        duration_ms: Date.now() - start,
        ip:          req.ip
      }));
    });
  }

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
  res.json({ 
    estado: 'ok', 
    version: '2.0', 
    service: 'backend', 
    fecha: new Date().toISOString(),
    redis: redisStatus
  });
});
app.get('/', (_req, res) => res.json({ mensaje: 'SaaS PYMES API OK' }));

// ─── 11. Rutas ────────────────────────────────────────────────────────────────
// Nota: limiterAuth ya se aplica en la sección 5 para /api/auth/login y /api/auth/register
// El limiterGlobal se aplica en /api/auth para el resto de endpoints de autenticación
app.use('/api/usuarios',    require('./routes/usuarios'));
app.use('/api/productos',   require('./routes/productos'));
app.use('/api/categorias',  require('./routes/categorias'));
app.use('/api/ventas',      require('./routes/ventas'));
app.use('/api/gastos',      require('./routes/gastos'));
app.use('/api/clientes',    require('./routes/clientes'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/inventario',  require('./routes/inventario'));
app.use('/api/dashboard',   require('./routes/dashboard'));
app.use('/api/alertas',     require('./routes/alertas'));
app.use('/api/reportes',    require('./routes/reportes'));
app.use('/api/ml',          require('./routes/ml'));
app.use('/api/facturacion', require('./routes/facturacion'));
app.use('/api/saas',        require('./routes/saas'));
app.use('/api/suspensiones',require('./routes/suspensiones'));
app.use('/api/pagos',       require('./routes/pagos'));
app.use('/api/public',      require('./routes/public'));
app.use('/api/features',    require('./routes/features'));
app.use('/api/rbac',        require('./routes/rbac'));
app.use('/api/super-admin', require('./routes/superAdmin'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/payments',    require('./routes/payments'));

// ─── 12. 404 ──────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// ─── 13. Error handler global ─────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[error]', err.message);
  const msg = process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message;
  return res.status(err.status || 500).json({ error: msg });
});

module.exports = app;