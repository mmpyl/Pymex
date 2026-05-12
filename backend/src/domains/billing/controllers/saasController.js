/**
 * Controlador SaaS - Dominio BILLING
 * 
 * Maneja las operaciones relacionadas con métricas SaaS,
 * distribución de planes y estadísticas del sistema.
 */

const { Op, fn, col } = require('sequelize');
const { Empresa, Usuario, ApiKey, AuditLog } = require('../../core/models');
const { Suscripcion, Plan, Pago } = require('../models');

class SaasController {
  /**
   * GET /api/saas/metricas
   * Obtiene métricas generales del sistema SaaS
   */
  async obtenerMetricas(req, res, next) {
    try {
      const ahora = new Date();
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

      const [
        empresasActivas,
        empresasSuspendidas,
        usuariosActivos,
        mrrRows,
        nuevasApiKeys,
        logsMes,
        planes
      ] = await Promise.all([
        Empresa.count({ where: { estado: 'activo' } }),
        Empresa.count({ where: { estado: 'suspendido' } }),
        Usuario.count({ where: { estado: 'activo' } }),
        // MRR desde pagos del mes
        Pago.findAll({
          attributes: [[fn('COALESCE', fn('SUM', col('monto')), 0), 'mrr']],
          where: { estado: 'pagado', creado_en: { [Op.gte]: inicioMes } }
        }),
        ApiKey.count({ where: { fecha_creacion: { [Op.gte]: inicioMes } } }),
        AuditLog.count({ where: { fecha: { [Op.gte]: inicioMes } } }),
        // JOIN con Plan para obtener nombre del plan
        Suscripcion.findAll({
          attributes: ['plan_id', [fn('COUNT', col('Suscripcion.id')), 'total']],
          include: [{ model: Plan, attributes: ['nombre', 'codigo'] }],
          where: { estado: { [Op.in]: ['activa', 'trial'] } },
          group: ['plan_id', 'Plan.id']
        })
      ]);

      return res.json({
        empresas_activas: empresasActivas,
        empresas_suspendidas: empresasSuspendidas,
        usuarios_activos: usuariosActivos,
        mrr_estimado: parseFloat(mrrRows[0]?.dataValues?.mrr || 0),
        api_keys_creadas_mes: nuevasApiKeys,
        eventos_auditoria_mes: logsMes,
        distribucion_planes: planes
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SaasController();
