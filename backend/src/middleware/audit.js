const { AuditLog } = require('../domains/core/models');

const auditMiddleware = (req, res, next) => {
  const inicio = Date.now();

  res.on('finish', async () => {
    try {
      if (req.path === '/health' || req.path === '/') return;

      await AuditLog.create({
        empresa_id: req.usuario?.empresa_id || null,
        usuario_id: req.usuario?.id || null,
        metodo: req.method,
        ruta: req.originalUrl,
        estado_http: res.statusCode,
        ip: req.ip,
        user_agent: req.headers['user-agent'] || null,
        request_id: req.requestId || null,
        metadata: {
          duracion_ms: Date.now() - inicio
        }
      });
    } catch (error) {
      console.error('Audit middleware error:', error.message);
    }
  });

  next();
};

module.exports = { auditMiddleware };
