
// backend/src/routes/superAdmin.js — versión corregida
// FIX: Plan.create usa campos del modelo v3 (precio_mensual, no precio/max_usuarios directo)
//      Los límites del plan ahora van a PlanLimit separado, no como columnas en Plan.
// FIX: Suscripcion.update usa fecha_fin (no periodo_fin).
// FIX: Pago.create usa fecha_vencimiento (requerida en v3).
//
// NOTA ARQUITECTURA: Esta ruta usa verificarToken + checkSuperAdminRol para mantener
// compatibilidad con usuarios de empresa que tienen rol super_admin.
// Para nuevas funcionalidades de admin del SaaS, considerar migrar a /api/admin con tokens admin dedicados.

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { Op, fn, col } = require('sequelize');
const { verificarToken } = require('../middleware/auth');
const { checkSuperAdminRol } = require('../middleware/superAdmin');
const { Empresa, Rubro, AuditLog } = require('../domains/core/models');
const { Plan, PlanLimit, Feature, PlanFeature, RubroFeature, FeatureOverride, Suscripcion, Pago } = require('../domains/billing/models');
const { Usuario, Rol } = require('../domains/auth/models');

router.use(verificarToken, checkSuperAdminRol);

// ─── EMPRESAS ─────────────────────────────────────────────────────────────────
router.post('/empresas', async (req, res) => {
  try {
    const { nombre, email, ruc = null, plan_id = null, rubro_id = null, estado = 'activo' } = req.body;
    if (!nombre || !email) return res.status(400).json({ error: 'nombre y email son obligatorios' });
    const empresa = await Empresa.create({ nombre, email, ruc, plan_id, rubro_id, estado });
    return res.status(201).json(empresa);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

router.put('/empresas/:id', async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(Number(req.params.id));
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    const allowed = ['nombre', 'email', 'ruc', 'plan_id', 'rubro_id', 'estado'];
    allowed.forEach(key => { if (req.body[key] !== undefined) empresa[key] = req.body[key]; });
    await empresa.save();
    return res.json(empresa);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

router.patch('/empresas/:id/estado', async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(Number(req.params.id));
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    const estadosValidos = ['activo', 'suspendido', 'eliminado'];
    if (!estadosValidos.includes(req.body.estado))
      return res.status(400).json({ error: `Estado inválido. Usa: ${estadosValidos.join(', ')}` });
    empresa.estado = req.body.estado;
    await empresa.save();
    return res.json({ id: empresa.id, estado: empresa.estado });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ─── FEATURES ─────────────────────────────────────────────────────────────────
router.post('/features', async (req, res) => {
  try {
    const { nombre, codigo, descripcion = '', estado = 'activo' } = req.body;
    if (!nombre || !codigo) return res.status(400).json({ error: 'nombre y codigo son obligatorios' });
    const feature = await Feature.create({ nombre, codigo, descripcion, estado });
    return res.status(201).json(feature);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

router.put('/features/plan/:planId/:featureId', async (req, res) => {
  try {
    await PlanFeature.upsert({
      plan_id: Number(req.params.planId),
      feature_id: Number(req.params.featureId),
      activo: Boolean(req.body.activo)
    });
    return res.json({ ok: true });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

router.put('/features/rubro/:rubroId/:featureId', async (req, res) => {
  try {
    await RubroFeature.upsert({
      rubro_id: Number(req.params.rubroId),
      feature_id: Number(req.params.featureId),
      activo: Boolean(req.body.activo)
    });
    return res.json({ ok: true });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

router.put('/features/empresa/:empresaId/:featureId', async (req, res) => {
  try {
    await FeatureOverride.upsert({
      empresa_id: Number(req.params.empresaId),
      feature_id: Number(req.params.featureId),
      activo: Boolean(req.body.activo),
      motivo: req.body.motivo || null
    });
    return res.json({ ok: true });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ─── PLANES ───────────────────────────────────────────────────────────────────
// FIX: Plan v3 solo tiene nombre, codigo, precio_mensual, estado.
//      Los límites (max_usuarios, max_productos, etc.) van en PlanLimit.
router.post('/planes', async (req, res) => {
  try {
    const { nombre, codigo, descripcion = '', precio_mensual = 0, estado = 'activo' } = req.body;
    if (!nombre || !codigo) return res.status(400).json({ error: 'nombre y codigo son obligatorios' });
    const plan = await Plan.create({ nombre, codigo, descripcion, precio_mensual, estado });

    // Crear límites si se proporcionan
    const limites = {
      max_usuarios: req.body.max_usuarios || 5,
      max_productos: req.body.max_productos || 200,
      max_ventas_mes: req.body.max_ventas_mes || 999999
    };
    await Promise.all(
      Object.entries(limites).map(([limite, valor]) =>
        PlanLimit.create({ plan_id: plan.id, limite, valor })
      )
    );

    return res.status(201).json(plan);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

router.put('/planes/:id', async (req, res) => {
  try {
    const plan = await Plan.findByPk(Number(req.params.id));
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });
    const fields = ['nombre', 'codigo', 'descripcion', 'precio_mensual', 'estado'];
    fields.forEach(key => { if (req.body[key] !== undefined) plan[key] = req.body[key]; });
    await plan.save();
    return res.json(plan);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ─── SUSCRIPCIONES ────────────────────────────────────────────────────────────
router.get('/suscripciones', async (req, res) => {
  try {
    const list = await Suscripcion.findAll({
      include: [
        { model: Empresa, attributes: ['id', 'nombre', 'estado'] },
        { model: Plan, attributes: ['id', 'nombre', 'codigo'] }
      ],
      order: [['id', 'DESC']]
    });
    return res.json(list);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// FIX: actualizar plan de suscripción (cambia plan_id, no campo 'plan' string)
router.patch('/suscripciones/:id/plan', async (req, res) => {
  try {
    const suscripcion = await Suscripcion.findByPk(Number(req.params.id));
    if (!suscripcion) return res.status(404).json({ error: 'Suscripción no encontrada' });
    if (req.body.plan_id) {
      suscripcion.plan_id = req.body.plan_id;
      const plan = await Plan.findByPk(req.body.plan_id);
      if (plan) {
        await Empresa.update({ plan: plan.codigo }, { where: { id: suscripcion.empresa_id } });
      }
    }
    await suscripcion.save();
    return res.json(suscripcion);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

router.patch('/suscripciones/:id/suspender', async (req, res) => {
  try {
    const suscripcion = await Suscripcion.findByPk(Number(req.params.id));
    if (!suscripcion) return res.status(404).json({ error: 'Suscripción no encontrada' });
    await suscripcion.update({ estado: 'suspendida' });
    await Empresa.update({ estado: 'suspendido' }, { where: { id: suscripcion.empresa_id } });
    return res.json({ ok: true, suscripcion_id: suscripcion.id, estado: 'suspendida' });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ─── PAGOS ────────────────────────────────────────────────────────────────────
// FIX: fecha_vencimiento es requerida en Pago v3
router.post('/pagos', async (req, res) => {
  try {
    const { empresa_id, suscripcion_id, monto, moneda = 'PEN', referencia = null } = req.body;
    if (!empresa_id || !suscripcion_id || !monto)
      return res.status(400).json({ error: 'empresa_id, suscripcion_id y monto son obligatorios' });

    const fechaVencimiento = req.body.fecha_vencimiento
      ? new Date(req.body.fecha_vencimiento)
      : (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d; })();

    const pago = await Pago.create({
      empresa_id, suscripcion_id, monto, moneda,
      estado: 'pagado',
      fecha_vencimiento: fechaVencimiento,
      fecha_pago: new Date(),
      referencia
    });
    return res.status(201).json(pago);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

router.get('/pagos', async (req, res) => {
  try {
    const pagos = await Pago.findAll({
      include: [{ model: Empresa, attributes: ['id', 'nombre'] }],
      order: [['id', 'DESC']]
    });
    return res.json(pagos);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ─── USUARIOS ADMIN DE EMPRESA ────────────────────────────────────────────────
router.post('/admins', async (req, res) => {
  try {
    const { empresa_id, nombre, email, password, rol_id } = req.body;
    if (!empresa_id || !nombre || !email || !password || !rol_id)
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    const rol = await Rol.findByPk(rol_id);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await Usuario.create({
      empresa_id, rol_id, nombre, email, password: passwordHash, estado: 'activo'
    });
    return res.status(201).json({
      id: user.id, empresa_id: user.empresa_id,
      rol_id: user.rol_id, nombre: user.nombre, email: user.email
    });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

router.get('/roles-admin', async (req, res) => {
  try {
    return res.json(await Rol.findAll({ order: [['id', 'ASC']] }));
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ─── AUDITORÍA ────────────────────────────────────────────────────────────────
router.get('/auditoria', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 200), 1000);
    const logs = await AuditLog.findAll({
      include: [
        { model: Empresa, attributes: ['id', 'nombre'] },
        { model: Usuario, attributes: ['id', 'nombre', 'email'] }
      ],
      order: [['fecha', 'DESC']],
      limit
    });
    return res.json(logs);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ─── DASHBOARD SAAS ───────────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalEmpresas, activas, mrrRows, nuevasEmpresas, planMasUsado, totalSubs, canceladas] =
      await Promise.all([
        Empresa.count(),
        Empresa.count({ where: { estado: 'activo' } }),
        Pago.findAll({
          attributes: [[fn('COALESCE', fn('SUM', col('monto')), 0), 'mrr']],
          where: { estado: 'pagado', creado_en: { [Op.gte]: startMonth } }
        }),
        Empresa.count({ where: { fecha_registro: { [Op.gte]: startMonth } } }),
        Suscripcion.findAll({
          attributes: ['plan_id', [fn('COUNT', col('Suscripcion.id')), 'total']],
          include: [{ model: Plan, attributes: ['nombre', 'codigo'] }],
          where: { estado: { [Op.in]: ['activa', 'trial'] } },
          group: ['plan_id', 'Plan.id'],
          order: [[fn('COUNT', col('Suscripcion.id')), 'DESC']],
          limit: 1
        }),
        Suscripcion.count(),
        Suscripcion.count({ where: { estado: 'cancelada' } })
      ]);

    const mrr = Number(mrrRows[0]?.dataValues?.mrr || 0);
    const churn = totalSubs > 0 ? Number(((canceladas / totalSubs) * 100).toFixed(2)) : 0;

    return res.json({
      total_empresas: totalEmpresas,
      empresas_activas: activas,
      mrr,
      churn,
      plan_mas_usado: planMasUsado[0]?.Plan?.nombre || null,
      nuevas_empresas_mes: nuevasEmpresas
    });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

module.exports = router;
