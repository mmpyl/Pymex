// backend/src/controllers/admin/adminController.js

const { Op, fn, col, literal } = require('sequelize');
const {
  sequelize,
  Empresa,
  Usuario,
  Plan,
  Feature,
  PlanFeature,
  PlanLimit,
  Suscripcion,
  FeatureOverride,
  Pago,
  AuditoriaAdmin,
  Rubro,
  EmpresaRubro
} = require('../../models');
const { clearFeatureCache, getEffectiveFeaturesForEmpresa } = require('../../services/featureGateService');
const { runBillingCollection, applyPaymentAndReactivate } = require('../../services/billingService');
const { createCheckoutForPago } = require('../../services/paymentGatewayService');

const ESTADOS_EMPRESA = ['activo', 'suspendido', 'eliminado'];
const ESTADOS_PAGO = ['pagado', 'pendiente', 'vencido'];
const ESTADOS_SUSCRIPCION = ['activa', 'cancelada', 'suspendida', 'trial'];

const parsePagination = (req) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(req.query.pageSize || 20), 1), 100);
  return { page, pageSize, offset: (page - 1) * pageSize };
};

const err500 = (res, error) => {
  return res.status(500).json({ error: error?.message || 'Error interno del servidor' });
};

const audit = async (req, accion, entidad, entidad_id, detalles = {}) => {
  try {
    const adminId = req.admin?.id || req.usuario?.id;
    if (!adminId) return;

    await AuditoriaAdmin.create({
      admin_usuario_id: adminId,
      accion,
      entidad,
      entidad_id,
      detalles,
      ip: req.ip
    });
  } catch {
    // Auditoría no debe romper el flujo principal.
  }
};

const requireFields = (obj, fields) => {
  const missing = fields.filter((field) => obj[field] === undefined || obj[field] === null || obj[field] === '');
  return missing.length ? `Campos requeridos: ${missing.join(', ')}` : null;
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

const listarEmpresas = async (req, res) => {
  try {
    const { page, pageSize, offset } = parsePagination(req);
    const { q, estado } = req.query;
    const where = {};

    if (estado) where.estado = estado;
    if (q) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
        { ruc: { [Op.iLike]: `%${q}%` } }
      ];
    }

    const { rows, count } = await Empresa.findAndCountAll({
      where,
      include: [{ model: Rubro, through: { attributes: [] } }],
      order: [['id', 'DESC']],
      limit: pageSize,
      offset
    });

    return res.json({ data: rows, meta: { page, pageSize, total: count } });
  } catch (error) {
    return err500(res, error);
  }
};

const crearEmpresa = async (req, res) => {
  try {
    const missing = requireFields(req.body, ['nombre', 'email']);
    if (missing) return res.status(400).json({ error: missing });

    const estado = req.body.estado || 'activo';
    if (!ESTADOS_EMPRESA.includes(estado)) {
      return res.status(400).json({ error: 'Estado de empresa inválido' });
    }

    const empresa = await Empresa.create({
      nombre: req.body.nombre,
      email: req.body.email,
      ruc: req.body.ruc || null,
      plan: req.body.plan || 'basico',
      estado
    });

    await audit(req, 'crear_empresa', 'empresa', empresa.id, req.body);
    return res.status(201).json(empresa);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const actualizarEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    if (req.body.estado && !ESTADOS_EMPRESA.includes(req.body.estado)) {
      return res.status(400).json({ error: 'Estado de empresa inválido' });
    }

    await empresa.update(req.body);
    await audit(req, 'actualizar_empresa', 'empresa', empresa.id, req.body);
    return res.json(empresa);
  } catch (error) {
    return err500(res, error);
  }
};

const cambiarEstadoEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    if (!ESTADOS_EMPRESA.includes(req.body.estado)) {
      return res.status(400).json({ error: `Estado inválido. Usa: ${ESTADOS_EMPRESA.join(', ')}` });
    }

    await empresa.update({ estado: req.body.estado });
    await audit(req, 'cambiar_estado_empresa', 'empresa', empresa.id, { estado: req.body.estado });
    return res.json({ mensaje: 'Estado actualizado', empresa });
  } catch (error) {
    return err500(res, error);
  }
};

const eliminarEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    await empresa.update({ estado: 'eliminado' });
    await audit(req, 'eliminar_empresa', 'empresa', empresa.id);
    return res.json({ mensaje: 'Empresa eliminada (borrado lógico)' });
  } catch (error) {
    return err500(res, error);
  }
};

const detalleEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id, {
      include: [
        { model: Usuario, attributes: ['id', 'nombre', 'email', 'estado', 'rol_id'] },
        { model: Suscripcion, include: [Plan] },
        { model: FeatureOverride, include: [Feature] },
        { model: Rubro, through: { attributes: [] } }
      ]
    });

    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    return res.json(empresa);
  } catch (error) {
    return err500(res, error);
  }
};

const listarUsuariosEmpresa = async (req, res) => {
  try {
    const users = await Usuario.findAll({
      where: { empresa_id: req.params.id },
      order: [['id', 'DESC']]
    });
    return res.json(users);
  } catch (error) {
    return err500(res, error);
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.params.usuarioId);
    if (!user || String(user.empresa_id) !== String(req.params.id)) {
      return res.status(404).json({ error: 'Usuario no encontrado para la empresa indicada' });
    }

    const patch = {};
    if (req.body.rol_id !== undefined) patch.rol_id = req.body.rol_id;
    if (req.body.estado !== undefined) patch.estado = req.body.estado;

    await user.update(patch);
    await audit(req, 'actualizar_usuario_empresa', 'usuario', user.id, patch);
    return res.json(user);
  } catch (error) {
    return err500(res, error);
  }
};

const listarRubros = async (_req, res) => {
  try {
    const rubros = await Rubro.findAll({ order: [['nombre', 'ASC']] });
    return res.json(rubros);
  } catch (error) {
    return err500(res, error);
  }
};

const crearRubro = async (req, res) => {
  try {
    const missing = requireFields(req.body, ['nombre']);
    if (missing) return res.status(400).json({ error: missing });

    const rubro = await Rubro.create({
      nombre: req.body.nombre.trim(),
      descripcion: req.body.descripcion || null
    });

    await audit(req, 'crear_rubro', 'rubro', rubro.id, req.body);
    return res.status(201).json(rubro);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const actualizarRubro = async (req, res) => {
  try {
    const rubro = await Rubro.findByPk(req.params.id);
    if (!rubro) return res.status(404).json({ error: 'Rubro no encontrado' });

    await rubro.update({
      nombre: req.body.nombre ?? rubro.nombre,
      descripcion: req.body.descripcion ?? rubro.descripcion
    });

    await audit(req, 'actualizar_rubro', 'rubro', rubro.id, req.body);
    return res.json(rubro);
  } catch (error) {
    return err500(res, error);
  }
};

const asignarRubrosEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    const rubroIds = Array.isArray(req.body.rubro_ids) ? req.body.rubro_ids.map(Number) : [];
    if (!rubroIds.length) {
      return res.status(400).json({ error: 'rubro_ids debe incluir al menos un id' });
    }

    const rubros = await Rubro.findAll({ where: { id: { [Op.in]: rubroIds } } });
    if (rubros.length !== rubroIds.length) {
      return res.status(400).json({ error: 'Uno o más rubros no existen' });
    }

    await EmpresaRubro.destroy({ where: { empresa_id: empresa.id } });
    await EmpresaRubro.bulkCreate(rubroIds.map((rubroId) => ({ empresa_id: empresa.id, rubro_id: rubroId })));

    const actualizada = await Empresa.findByPk(empresa.id, {
      include: [{ model: Rubro, through: { attributes: [] } }]
    });

    await audit(req, 'asignar_rubros_empresa', 'empresa', empresa.id, { rubro_ids: rubroIds });
    return res.json({ empresa_id: empresa.id, rubros: actualizada?.Rubros || [] });
  } catch (error) {
    return err500(res, error);
  }
};

const listarPlanes = async (_req, res) => {
  try {
    const planes = await Plan.findAll({
      include: [PlanFeature, PlanLimit],
      order: [['precio_mensual', 'ASC']]
    });
    return res.json(planes);
  } catch (error) {
    return err500(res, error);
  }
};

const crearPlan = async (req, res) => {
  try {
    const missing = requireFields(req.body, ['nombre', 'codigo']);
    if (missing) return res.status(400).json({ error: missing });

    const plan = await Plan.create(req.body);
    return res.status(201).json(plan);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const actualizarPlan = async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });

    await plan.update(req.body);
    return res.json(plan);
  } catch (error) {
    return err500(res, error);
  }
};

const listarFeatures = async (_req, res) => {
  try {
    const features = await Feature.findAll({ order: [['id', 'DESC']] });
    return res.json(features);
  } catch (error) {
    return err500(res, error);
  }
};

const crearFeature = async (req, res) => {
  try {
    const missing = requireFields(req.body, ['nombre', 'codigo']);
    if (missing) return res.status(400).json({ error: missing });

    const feature = await Feature.create(req.body);
    return res.status(201).json(feature);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const asignarFeaturePlan = async (req, res) => {
  try {
    if (!req.body.feature_id) return res.status(400).json({ error: 'feature_id es requerido' });

    const [link, created] = await PlanFeature.findOrCreate({
      where: { plan_id: req.params.id, feature_id: req.body.feature_id },
      defaults: { activo: req.body.activo !== false }
    });

    if (!created) await link.update({ activo: req.body.activo !== false });
    return res.status(created ? 201 : 200).json(link);
  } catch (error) {
    return err500(res, error);
  }
};

const guardarLimitePlan = async (req, res) => {
  try {
    if (!req.body.limite || req.body.valor === undefined) {
      return res.status(400).json({ error: 'limite y valor son requeridos' });
    }

    const [limit, created] = await PlanLimit.findOrCreate({
      where: { plan_id: req.params.id, limite: req.body.limite },
      defaults: { valor: req.body.valor }
    });

    if (!created) await limit.update({ valor: req.body.valor });
    return res.json(limit);
  } catch (error) {
    return err500(res, error);
  }
};

const crearOverride = async (req, res) => {
  try {
    if (!req.body.feature_id || typeof req.body.activo !== 'boolean') {
      return res.status(400).json({ error: 'feature_id y activo(boolean) son requeridos' });
    }

    const [override, created] = await FeatureOverride.findOrCreate({
      where: { empresa_id: req.params.id, feature_id: req.body.feature_id },
      defaults: {
        activo: req.body.activo,
        motivo: req.body.motivo
      }
    });

    if (!created) {
      await override.update({ activo: req.body.activo, motivo: req.body.motivo || override.motivo });
    }

    await audit(req, 'override_feature_empresa', 'feature_override', override.id, req.body);
    clearFeatureCache(req.params.id);
    return res.status(created ? 201 : 200).json(override);
  } catch (error) {
    return err500(res, error);
  }
};

const featuresEfectivosEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    const features = await getEffectiveFeaturesForEmpresa(req.params.id);
    return res.json({ empresa_id: Number(req.params.id), features });
  } catch (error) {
    return err500(res, error);
  }
};

const ejecutarCobranza = async (req, res) => {
  try {
    const resultado = await runBillingCollection();
    await audit(req, 'billing_run_collection', 'billing', null, resultado);
    return res.json(resultado);
  } catch (error) {
    return err500(res, error);
  }
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

const cambiarPlanSuscripcion = async (req, res) => {
  try {
    const suscripcion = await Suscripcion.findByPk(req.params.id);
    if (!suscripcion) return res.status(404).json({ error: 'Suscripción no encontrada' });

    if (req.body.estado && !ESTADOS_SUSCRIPCION.includes(req.body.estado)) {
      return res.status(400).json({ error: 'Estado de suscripción inválido' });
    }

    await suscripcion.update(req.body);
    await audit(req, 'actualizar_suscripcion', 'suscripcion', suscripcion.id, req.body);
    clearFeatureCache(suscripcion.empresa_id);

    return res.json(suscripcion);
  } catch (error) {
    return err500(res, error);
  }
};

const listarPagos = async (req, res) => {
  try {
    const where = {};
    if (req.query.estado) where.estado = req.query.estado;

    const pagos = await Pago.findAll({ include: [Empresa, Suscripcion], where, order: [['id', 'DESC']] });
    return res.json(pagos);
  } catch (error) {
    return err500(res, error);
  }
};

const registrarPago = async (req, res) => {
  try {
    const missing = requireFields(req.body, ['empresa_id', 'suscripcion_id', 'monto', 'fecha_vencimiento']);
    if (missing) return res.status(400).json({ error: missing });

    const estado = req.body.estado || 'pendiente';
    if (!ESTADOS_PAGO.includes(estado)) {
      return res.status(400).json({ error: 'Estado de pago inválido' });
    }

    const pago = await Pago.create({ ...req.body, estado });
    await audit(req, 'registrar_pago', 'pago', pago.id, req.body);

    return res.status(201).json(pago);
  } catch (error) {
    return err500(res, error);
  }
};

const generarCheckoutPago = async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });

    const idempotencyKey = req.headers['idempotency-key'] || `checkout_${pago.id}_${Date.now()}`;
    const checkout = await createCheckoutForPago(pago, idempotencyKey);

    await pago.update({ referencia: checkout.external_id || pago.referencia });
    await audit(req, 'generar_checkout_pago', 'pago', pago.id, {
      checkout_url: checkout.checkout_url,
      provider: checkout.provider
    });

    return res.json({
      pago_id: pago.id,
      checkout_url: checkout.checkout_url,
      provider: checkout.provider
    });
  } catch (error) {
    return err500(res, error);
  }
};

const marcarPagoPagado = async (req, res) => {
  try {
    const pago = await applyPaymentAndReactivate(req.params.id, req.body?.referencia || null);
    await audit(req, 'marcar_pago_pagado', 'pago', pago.id, { referencia: req.body?.referencia || null });
    return res.json({ ok: true, pago_id: pago.id, estado: 'pagado' });
  } catch (error) {
    return err500(res, error);
  }
};

const listarAuditoria = async (req, res) => {
  try {
    const { page, pageSize, offset } = parsePagination(req);
    const { rows, count } = await AuditoriaAdmin.findAndCountAll({
      order: [['id', 'DESC']],
      limit: pageSize,
      offset
    });

    return res.json({ data: rows, meta: { page, pageSize, total: count } });
  } catch (error) {
    return err500(res, error);
  }
};

const metricasSaas = async (_req, res) => {
  try {
    const now = new Date();
    const meses = [];

    for (let i = 5; i >= 0; i -= 1) {
      const inicio = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const fin = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1));

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
        mes: inicio.toISOString().slice(0, 7),
        mrr: Number(mrrRows[0]?.dataValues?.mrr || 0),
        nuevas_suscripciones: nuevas,
        cancelaciones: canceladas
      });
    }

    return res.json({ series_6m: meses });
  } catch (error) {
    return err500(res, error);
  }
};

module.exports = {
  dashboard,
  listarEmpresas,
  crearEmpresa,
  actualizarEmpresa,
  cambiarEstadoEmpresa,
  eliminarEmpresa,
  detalleEmpresa,
  listarUsuariosEmpresa,
  actualizarUsuario,
  listarRubros,
  crearRubro,
  actualizarRubro,
  asignarRubrosEmpresa,
  listarPlanes,
  crearPlan,
  actualizarPlan,
  listarFeatures,
  crearFeature,
  asignarFeaturePlan,
  guardarLimitePlan,
  crearOverride,
  featuresEfectivosEmpresa,
  ejecutarCobranza,
  listarSuscripciones,
  crearSuscripcion,
  cambiarPlanSuscripcion,
  listarPagos,
  registrarPago,
  generarCheckoutPago,
  marcarPagoPagado,
  listarAuditoria,
  metricasSaas
};
