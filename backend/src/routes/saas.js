
const router = require('express').Router();
const { Op, fn, col } = require('sequelize');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/roles');
const { Empresa, Usuario, Suscripcion, ApiKey, AuditLog } = require('../models');

router.use(verificarToken, verificarRol('admin'));

router.get('/metricas', async (req, res) => {
  try {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const [empresasActivas, empresasSuspendidas, usuariosActivos, mrr, nuevasApiKeys, logsMes] = await Promise.all([
      Empresa.count({ where: { estado: 'activo' } }),
      Empresa.count({ where: { estado: 'suspendido' } }),
      Usuario.count({ where: { estado: 'activo' } }),
      Suscripcion.sum('monto_mensual', { where: { estado: 'activa' } }),
      ApiKey.count({ where: { fecha_creacion: { [Op.gte]: inicioMes } } }),
      AuditLog.count({ where: { fecha: { [Op.gte]: inicioMes } } })
    ]);

    const planes = await Suscripcion.findAll({
      attributes: ['plan', [fn('COUNT', col('id')), 'total']],
      group: ['plan']
    });

    res.json({
      empresas_activas: empresasActivas,
      empresas_suspendidas: empresasSuspendidas,
      usuarios_activos: usuariosActivos,
      mrr_estimado: parseFloat(mrr || 0),
      api_keys_creadas_mes: nuevasApiKeys,
      eventos_auditoria_mes: logsMes,
      distribucion_planes: planes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });

// backend/src/routes/saas.js — versión corregida
// FIX: el modelo Suscripcion v3 no tiene monto_mensual ni periodo_fin.
//      MRR ahora se calcula desde la tabla pagos (estado='pagado' del mes).
//      distribucion_planes usa plan_id → JOIN con Plan.
// FIX: verificarRol importado correctamente desde roles.js corregido.

const router    = require('express').Router();
const { Op, fn, col } = require('sequelize');
const { verificarToken }  = require('../middleware/auth');
const { verificarRol }    = require('../middleware/roles');
const { Empresa, Usuario, Suscripcion, Plan, ApiKey, AuditLog, Pago } = require('../models');

router.use(verificarToken, verificarRol('admin', 'super_admin'));

router.get('/metricas', async (req, res) => {
  try {
    const ahora     = new Date();
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
      // FIX: MRR desde pagos del mes (no desde suscripciones.monto_mensual)
      Pago.findAll({
        attributes: [[fn('COALESCE', fn('SUM', col('monto')), 0), 'mrr']],
        where: { estado: 'pagado', creado_en: { [Op.gte]: inicioMes } }
      }),
      ApiKey.count({ where: { fecha_creacion: { [Op.gte]: inicioMes } } }),
      AuditLog.count({ where: { fecha: { [Op.gte]: inicioMes } } }),
      // FIX: JOIN con Plan para obtener nombre del plan
      Suscripcion.findAll({
        attributes: ['plan_id', [fn('COUNT', col('Suscripcion.id')), 'total']],
        include: [{ model: Plan, attributes: ['nombre', 'codigo'] }],
        where: { estado: { [Op.in]: ['activa', 'trial'] } },
        group: ['plan_id', 'Plan.id']
      })
    ]);

    return res.json({
      empresas_activas:      empresasActivas,
      empresas_suspendidas:  empresasSuspendidas,
      usuarios_activos:      usuariosActivos,
      mrr_estimado:          parseFloat(mrrRows[0]?.dataValues?.mrr || 0),
      api_keys_creadas_mes:  nuevasApiKeys,
      eventos_auditoria_mes: logsMes,
      distribucion_planes:   planes
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });

  }
});

module.exports = router;
