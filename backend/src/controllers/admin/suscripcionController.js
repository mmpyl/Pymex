// backend/src/controllers/admin/suscripcionController.js
// Funciones de suscripción y pagos corregidas para Pago v3 y Suscripcion v3.
// Se separan aquí para reemplazar únicamente las funciones afectadas
// en adminController.js sin reescribir el archivo completo.
//
// INSTRUCCIÓN DE APLICACIÓN:
// En adminController.js, reemplazar las funciones:
//   crearSuscripcion, registrarPago, metricasSaas, listarSuscripciones, dashboard
// con las de este archivo.

const { Op, fn, col, literal } = require('sequelize');
const coreModels = require('../../domains/core/models');
const billingModels = require('../../domains/billing/models');
const authModels = require('../../domains/auth/models');
const { clearFeatureCache } = require('../../services/featureGateService');

// Extraer modelos de cada dominio
const { sequelize, Empresa } = coreModels;
const { Plan, Suscripcion, FeatureOverride, Pago, AuditoriaAdmin } = billingModels;
const { UsuarioAdmin } = authModels;

const ESTADOS_SUSCRIPCION = ['activa', 'cancelada', 'suspendida', 'trial'];
const ESTADOS_PAGO        = ['pagado', 'pendiente', 'vencido'];

const audit = async (req, accion, entidad, entidad_id, detalles = {}) => {
  try {
    const adminId = req.admin?.id || req.usuario?.id;
    if (!adminId) return;
    await AuditoriaAdmin.create({ admin_usuario_id: adminId, accion, entidad, entidad_id, detalles, ip: req.ip });
  } catch { /* auditoría nunca bloquea */ }
};

// FIX: MRR calculado desde Pago, no desde Suscripcion.monto_mensual (campo eliminado en v3)
const dashboard = async (_req, res) => {
  try {
    const now               = new Date();
    const inicioMesActual   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const inicioMesAnterior = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

    const [
      totalEmpresas, empresasActivas, empresasSuspendidas,
      nuevasSuscripciones, cancelaciones,
      mrrActualRows, mrrAnteriorRows, planesMasUsados, pagosPendientes
    ] = await Promise.all([
      Empresa.count(),
      Empresa.count({ where: { estado: 'activo' } }),
      Empresa.count({ where: { estado: 'suspendido' } }),
      Suscripcion.count({ where: { creado_en: { [Op.gte]: inicioMesActual } } }),
      Suscripcion.count({ where: { estado: 'cancelada', actualizado_en: { [Op.gte]: inicioMesActual } } }),
      Pago.findAll({
        attributes: [[fn('COALESCE', fn('SUM', col('monto')), 0), 'mrr']],
        where: { estado: 'pagado', creado_en: { [Op.gte]: inicioMesActual } }
      }),
      Pago.findAll({
        attributes: [[fn('COALESCE', fn('SUM', col('monto')), 0), 'mrr']],
        where: { estado: 'pagado', creado_en: { [Op.gte]: inicioMesAnterior, [Op.lt]: inicioMesActual } }
      }),
      Suscripcion.findAll({
        attributes: ['plan_id', [fn('COUNT', col('plan_id')), 'cantidad']],
        include: [{ model: Plan, attributes: ['nombre', 'codigo'] }],
        group: ['plan_id', 'Plan.id'],
        order: [[literal('cantidad'), 'DESC']],
        limit: 5
      }),
      Pago.count({ where: { estado: { [Op.in]: ['pendiente', 'vencido'] } } })
    ]);

    const mrrActual   = Number(mrrActualRows[0]?.dataValues?.mrr || 0);
    const mrrAnterior = Number(mrrAnteriorRows[0]?.dataValues?.mrr || 0);
    const crecimientoMensualPct = mrrAnterior > 0
      ? Number((((mrrActual - mrrAnterior) / mrrAnterior) * 100).toFixed(2))
      : (mrrActual > 0 ? 100 : 0);

    return res.json({
      total_empresas: totalEmpresas, empresas_activas: empresasActivas,
      empresas_suspendidas: empresasSuspendidas, mrr: mrrActual,
      nuevas_suscripciones: nuevasSuscripciones, cancelaciones,
      pagos_pendientes: pagosPendientes,
      churn_pct: empresasActivas > 0 ? Number(((cancelaciones / empresasActivas) * 100).toFixed(2)) : 0,
      planes_mas_usados: planesMasUsados,
      crecimiento_mensual_pct: crecimientoMensualPct
    });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

// FIX: incluye Plan con campos del modelo v3 (precio_mensual, no precio)
const listarSuscripciones = async (_req, res) => {
  try {
    return res.json(await Suscripcion.findAll({
      include: [
        { model: Empresa, attributes: ['id', 'nombre', 'estado'] },
        { model: Plan,    attributes: ['id', 'nombre', 'codigo', 'precio_mensual'] }
      ],
      order: [['id', 'DESC']]
    }));
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

// FIX: usa fecha_inicio / fecha_fin (no periodo_inicio / periodo_fin del modelo viejo)
const crearSuscripcion = async (req, res) => {
  try {
    if (!req.body.empresa_id || !req.body.plan_id)
      return res.status(400).json({ error: 'Campos requeridos: empresa_id, plan_id' });

    const estado = req.body.estado || 'activa';
    if (!ESTADOS_SUSCRIPCION.includes(estado))
      return res.status(400).json({ error: 'Estado de suscripción inválido' });

    const tx = await sequelize.transaction();
    try {
      await Suscripcion.update(
        { estado: 'cancelada' },
        { where: { empresa_id: req.body.empresa_id, estado: 'activa' }, transaction: tx }
      );

      const suscripcion = await Suscripcion.create({
        empresa_id:      req.body.empresa_id,
        plan_id:         req.body.plan_id,
        estado,
        fecha_inicio:    req.body.fecha_inicio    || new Date(),
        fecha_fin:       req.body.fecha_fin       || null,
        auto_renovacion: req.body.auto_renovacion !== false
      }, { transaction: tx });

      const plan = await Plan.findByPk(req.body.plan_id, { transaction: tx });
      if (plan) {
        await Empresa.update(
          { plan: plan.codigo, plan_id: plan.id },
          { where: { id: req.body.empresa_id }, transaction: tx }
        );
      }

      await tx.commit();
      await audit(req, 'crear_suscripcion', 'suscripcion', suscripcion.id, req.body);
      clearFeatureCache(req.body.empresa_id);
      return res.status(201).json(suscripcion);
    } catch (inner) {
      await tx.rollback();
      return res.status(400).json({ error: inner.message });
    }
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

// FIX: fecha_vencimiento ahora requerida (campo obligatorio en Pago v3)
const registrarPago = async (req, res) => {
  try {
    const required = ['empresa_id', 'suscripcion_id', 'monto', 'fecha_vencimiento'];
    const missing  = required.filter(f => !req.body[f] && req.body[f] !== 0);
    if (missing.length) return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });

    const estado = req.body.estado || 'pendiente';
    if (!ESTADOS_PAGO.includes(estado))
      return res.status(400).json({ error: 'Estado de pago inválido' });

    const pago = await Pago.create({ ...req.body, estado });
    await audit(req, 'registrar_pago', 'pago', pago.id, req.body);
    return res.status(201).json(pago);
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

// FIX: MRR desde Pago (no Suscripcion.monto_mensual)
const metricasSaas = async (_req, res) => {
  try {
    const now   = new Date();
    const meses = [];
    for (let i = 5; i >= 0; i--) {
      const inicio = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const fin    = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1));
      // eslint-disable-next-line no-await-in-loop
      const [mrrRows, nuevas, canceladas] = await Promise.all([
        Pago.findAll({
          attributes: [[fn('COALESCE', fn('SUM', col('monto')), 0), 'mrr']],
          where: { estado: 'pagado', creado_en: { [Op.gte]: inicio, [Op.lt]: fin } }
        }),
        Suscripcion.count({ where: { creado_en: { [Op.gte]: inicio, [Op.lt]: fin } } }),
        Suscripcion.count({ where: { estado: 'cancelada', actualizado_en: { [Op.gte]: inicio, [Op.lt]: fin } } })
      ]);
      meses.push({
        mes:                  inicio.toISOString().slice(0, 7),
        mrr:                  Number(mrrRows[0]?.dataValues?.mrr || 0),
        nuevas_suscripciones: nuevas,
        cancelaciones:        canceladas
      });
    }
    return res.json({ series_6m: meses });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

module.exports = {
  dashboard,
  listarSuscripciones,
  crearSuscripcion,
  registrarPago,
  metricasSaas
};
