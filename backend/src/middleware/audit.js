const { AuditLog } = require('../domains/core/models');
const logger = require('../utils/logger');

// Contador de fallos de auditoría (para métricas/health checks)
let auditFailureCount = 0;
const getAuditFailureCount = () => auditFailureCount;
const resetAuditFailureCount = () => { auditFailureCount = 0; };

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
      // Incrementar contador de fallos para métricas y alertas
      auditFailureCount++;
      
      // Log estructurado del error para visibilidad en producción
      logger.error('Audit middleware failed - compliance risk', { 
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        url: req.originalUrl,
        userId: req.usuario?.id,
        empresaId: req.usuario?.empresa_id,
        failureCount: auditFailureCount,
        context: 'audit_middleware'
      });
      
      // Alerta crítica si hay múltiples fallos consecutivos
      if (auditFailureCount >= 5) {
        logger.crit?.('CRITICAL: Audit logging has failed multiple times - immediate attention required', {
          failureCount: auditFailureCount,
          context: 'audit_compliance_alert'
        });
      }
    }
  });

  next();
};

module.exports = { auditMiddleware, getAuditFailureCount, resetAuditFailureCount };
