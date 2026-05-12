
// backend/src/routes/superAdmin.js — versión corregida
// FIX: Plan.create usa campos del modelo v3 (precio_mensual, no precio/max_usuarios directo)
//      Los límites del plan ahora van a PlanLimit separado, no como columnas en Plan.
// FIX: Suscripcion.update usa fecha_fin (no periodo_fin).
// FIX: Pago.create usa fecha_vencimiento (requerida en v3).
//
// NOTA ARQUITECTURA: Esta ruta usa verificarTokenAdmin para usar tokens de administradores del SaaS.
// Los administradores del SaaS usan tokens de tipo 'admin' (tabla usuarios_admin),
// NO tokens de empresa. Para verificar rol super_admin, se valida contra usuarios_admin.

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { Op, fn, col } = require('sequelize');
const { verificarTokenAdmin } = require('../../middleware/auth');
const { checkAdminRole, checkAdminPermission } = require('../../middleware/adminRbac');
const { Empresa, Rubro, AuditLog, EmpresaRubro } = require('../../domains/core/models');
const { Plan, PlanLimit, Feature, PlanFeature, FeatureOverride, Suscripcion, Pago } = require('../../domains/billing/models');
const { RubroFeature } = require('../../domains/core/models');
const { UsuarioAdmin, Usuario, Rol, Permiso, RolPermiso, AuditoriaAdmin, initializeCrossDomainRelations } = require('../../domains/auth/models');
const eventBus = require('../../domains/eventBus');

// Asegurar que las relaciones cross-domain estén inicializadas
initializeCrossDomainRelations();

router.use(verificarTokenAdmin);

// ─── EMPRESAS ─────────────────────────────────────────────────────────────────
router.get('/empresas', async (req, res) => {
  try {
    const list = await Empresa.findAll({
      include: [
        { 
          model: Rubro, 
          as: 'rubros',
          attributes: ['id', 'nombre'],
          through: { attributes: [] }
        }
      ],
      order: [['id', 'DESC']]
    });
    return res.json(list);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

router.post('/empresas', async (req, res) => {
  try {
    const { nombre, email = null, ruc = null, plan_id = null, rubro_ids = [], estado = 'activo' } = req.body;
    if (!nombre) return res.status(400).json({ error: 'nombre es obligatorio' });
    
    // Crear empresa con email y plan_id
    const empresa = await Empresa.create({ nombre, email, ruc, plan_id, estado });
    
    // Si se proporcionan rubro_ids, crear las relaciones en la tabla intermedia
    if (Array.isArray(rubro_ids) && rubro_ids.length > 0) {
      const rubros = await Rubro.findAll({ where: { id: rubro_ids } });
      if (rubros.length !== rubro_ids.length) {
        await empresa.destroy();
        return res.status(404).json({ error: 'Uno o más rubros no encontrados' });
      }
      await EmpresaRubro.bulkCreate(rubro_ids.map((rubroId) => ({ empresa_id: empresa.id, rubro_id: rubroId })));
    }
    
    return res.status(201).json(empresa);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

router.put('/empresas/:id', async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(Number(req.params.id));
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    
    const allowed = ['nombre', 'email', 'ruc', 'plan_id', 'estado'];
    allowed.forEach(key => { if (req.body[key] !== undefined) empresa[key] = req.body[key]; });
    await empresa.save();
    
    // Manejar actualización de rubros a través de la tabla intermedia
    if (req.body.rubro_ids !== undefined) {
      await EmpresaRubro.destroy({ where: { empresa_id: empresa.id } });
      
      if (Array.isArray(req.body.rubro_ids) && req.body.rubro_ids.length > 0) {
        const rubros = await Rubro.findAll({ where: { id: req.body.rubro_ids } });
        if (rubros.length !== req.body.rubro_ids.length) {
          return res.status(404).json({ error: 'Uno o más rubros no encontrados' });
        }
        await EmpresaRubro.bulkCreate(req.body.rubro_ids.map((rubroId) => ({ empresa_id: empresa.id, rubro_id: rubroId })));
      }
    }
    
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

router.delete('/empresas/:id', async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(Number(req.params.id));
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    await empresa.destroy();
    return res.json({ mensaje: 'Empresa eliminada correctamente' });
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

// Listar todos los planes
router.get('/planes', async (req, res) => {
  try {
    const planes = await Plan.findAll({
      include: [
        { 
          model: PlanLimit, 
          as: 'limits',
          attributes: ['limite', 'valor'] 
        },
        {
          model: PlanFeature,
          as: 'planFeatures',
          attributes: ['activo'],
          include: [{
            model: Feature,
            as: 'feature',
            attributes: ['id', 'nombre', 'codigo']
          }]
        }
      ],
      order: [['precio_mensual', 'ASC']]
    });

    // Transformar la respuesta para que sea compatible con el frontend
    const planosTransformados = planes.map(plan => {
      const planData = plan.toJSON();
      const features = (planData.planFeatures || [])
        .filter(pf => pf.activo)
        .map(pf => ({ ...pf.feature, activo: pf.activo }));
      
      return {
        ...planData,
        features,
        planFeatures: undefined // Eliminar campo intermedio
      };
    });

    return res.json(planosTransformados);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ─── SUSCRIPCIONES ────────────────────────────────────────────────────────────
router.get('/suscripciones', async (req, res) => {
  try {
    const list = await Suscripcion.findAll({
      include: [
        { model: Empresa, as: 'empresa', attributes: ['id', 'nombre', 'estado'] },
        { model: Plan, as: 'plan', attributes: ['id', 'nombre', 'codigo'] }
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
      include: [
        { model: Empresa, as: 'empresa', attributes: ['id', 'nombre'] },
        { model: Suscripcion, as: 'suscripcion', attributes: ['id', 'empresa_id'] }
      ],
      order: [['id', 'DESC']]
    });
    return res.json(pagos);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ─── USUARIOS ADMIN DE EMPRESA ────────────────────────────────────────────────
// Obtener todos los usuarios con sus detalles
router.get('/usuarios', async (req, res) => {
  try {
    const list = await Usuario.findAll({
      include: [
        { model: Empresa, as: 'empresa', attributes: ['id', 'nombre', 'estado'] },
        { model: Rol, as: 'rol', attributes: ['id', 'nombre', 'descripcion'] }
      ],
      order: [['id', 'DESC']]
    });
    return res.json(list);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Obtener un usuario específico
router.get('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(Number(req.params.id), {
      include: [
        { model: Empresa, as: 'empresa', attributes: ['id', 'nombre', 'estado'] },
        { model: Rol, as: 'rol', attributes: ['id', 'nombre', 'descripcion'] }
      ]
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(usuario);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Crear nuevo usuario admin de empresa
router.post('/usuarios', async (req, res) => {
  try {
    const { empresa_id, nombre, email, password, rol_id, estado = 'activo' } = req.body;
    if (!empresa_id || !nombre || !email || !password || !rol_id)
      return res.status(400).json({ error: 'empresa_id, nombre, email, password y rol_id son obligatorios' });
    
    const rol = await Rol.findByPk(rol_id);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });
    
    // Verificar si el email ya existe
    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ error: 'El email ya está registrado' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await Usuario.create({
      empresa_id, rol_id, nombre, email, password: passwordHash, estado
    });
    
    return res.status(201).json({
      id: user.id,
      empresa_id: user.empresa_id,
      rol_id: user.rol_id,
      nombre: user.nombre,
      email: user.email,
      estado: user.estado
    });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Actualizar usuario
router.put('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(Number(req.params.id));
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const allowed = ['nombre', 'email', 'rol_id', 'estado'];
    allowed.forEach(key => {
      if (req.body[key] !== undefined) usuario[key] = req.body[key];
    });
    
    // Si se proporciona nueva contraseña, hashearla
    if (req.body.password) {
      usuario.password = await bcrypt.hash(req.body.password, 10);
    }
    
    await usuario.save();
    return res.json(usuario);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Eliminar usuario
router.delete('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(Number(req.params.id));
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    await usuario.destroy();
    return res.json({ ok: true, message: 'Usuario eliminado correctamente' });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Actualizar estado del usuario
router.patch('/usuarios/:id/estado', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(Number(req.params.id));
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const estadosValidos = ['activo', 'inactivo', 'suspendido'];
    if (!estadosValidos.includes(req.body.estado))
      return res.status(400).json({ error: `Estado inválido. Usa: ${estadosValidos.join(', ')}` });
    
    usuario.estado = req.body.estado;
    await usuario.save();
    return res.json({ id: usuario.id, estado: usuario.estado });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Endpoint legacy para compatibilidad
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
        { model: Empresa, as: 'empresa', attributes: ['id', 'nombre'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email'] }
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

// ═══════════════════════════════════════════════════════════════════════════════
// GESTIÓN DE USUARIOS SUPER-ADMIN
// ═══════════════════════════════════════════════════════════════════════════════

// Obtener todos los usuarios super-admin
router.get('/super-admins', async (req, res) => {
  try {
    const list = await UsuarioAdmin.findAll({
      attributes: ['id', 'nombre', 'email', 'rol', 'estado', 'creado_en', 'actualizado_en'],
      order: [['id', 'DESC']]
    });
    return res.json(list);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Obtener un usuario super-admin específico
router.get('/super-admins/:id', async (req, res) => {
  try {
    const admin = await UsuarioAdmin.findByPk(Number(req.params.id), {
      attributes: ['id', 'nombre', 'email', 'rol', 'estado', 'creado_en', 'actualizado_en']
    });
    if (!admin) return res.status(404).json({ error: 'Super-admin no encontrado' });
    return res.json(admin);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Crear nuevo usuario super-admin
router.post('/super-admins', async (req, res) => {
  try {
    const { nombre, email, password, rol = 'super_admin', estado = 'activo' } = req.body;
    
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'nombre, email y password son obligatorios' });
    }

    // Verificar si el email ya existe
    const existingAdmin = await UsuarioAdmin.findOne({ where: { email } });
    if (existingAdmin) return res.status(409).json({ error: 'El email ya está registrado' });

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await UsuarioAdmin.create({
      nombre,
      email,
      password: passwordHash,
      rol,
      estado
    });

    // Auditoría
    await AuditoriaAdmin.create({
      admin_usuario_id: req.admin?.id,
      accion: 'CREATE',
      entidad: 'UsuarioAdmin',
      entidad_id: admin.id,
      detalles: { nombre, email, rol },
      ip: req.ip
    });

    return res.status(201).json({
      id: admin.id,
      nombre: admin.nombre,
      email: admin.email,
      rol: admin.rol,
      estado: admin.estado
    });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Actualizar usuario super-admin
router.put('/super-admins/:id', async (req, res) => {
  try {
    const admin = await UsuarioAdmin.findByPk(Number(req.params.id));
    if (!admin) return res.status(404).json({ error: 'Super-admin no encontrado' });

    const allowed = ['nombre', 'email', 'rol', 'estado'];
    allowed.forEach(key => {
      if (req.body[key] !== undefined) admin[key] = req.body[key];
    });

    // Si se proporciona nueva contraseña, hashearla
    if (req.body.password) {
      admin.password = await bcrypt.hash(req.body.password, 10);
    }

    await admin.save();

    // Auditoría
    await AuditoriaAdmin.create({
      admin_usuario_id: req.admin?.id,
      accion: 'UPDATE',
      entidad: 'UsuarioAdmin',
      entidad_id: admin.id,
      detalles: { campos_actualizados: Object.keys(req.body) },
      ip: req.ip
    });

    return res.json({
      id: admin.id,
      nombre: admin.nombre,
      email: admin.email,
      rol: admin.rol,
      estado: admin.estado
    });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Eliminar usuario super-admin (soft delete cambiando estado)
router.delete('/super-admins/:id', async (req, res) => {
  try {
    const admin = await UsuarioAdmin.findByPk(Number(req.params.id));
    if (!admin) return res.status(404).json({ error: 'Super-admin no encontrado' });

    // No permitir eliminarse a sí mismo
    if (req.admin?.id === admin.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    admin.estado = 'eliminado';
    await admin.save();

    // Auditoría
    await AuditoriaAdmin.create({
      admin_usuario_id: req.admin?.id,
      accion: 'DELETE',
      entidad: 'UsuarioAdmin',
      entidad_id: admin.id,
      detalles: {},
      ip: req.ip
    });

    return res.json({ mensaje: 'Super-admin eliminado correctamente' });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Cambiar estado de super-admin
router.patch('/super-admins/:id/estado', async (req, res) => {
  try {
    const admin = await UsuarioAdmin.findByPk(Number(req.params.id));
    if (!admin) return res.status(404).json({ error: 'Super-admin no encontrado' });

    const estadosValidos = ['activo', 'inactivo', 'suspendido', 'eliminado'];
    if (!estadosValidos.includes(req.body.estado)) {
      return res.status(400).json({ error: `Estado inválido. Usa: ${estadosValidos.join(', ')}` });
    }

    admin.estado = req.body.estado;
    await admin.save();

    // Auditoría
    await AuditoriaAdmin.create({
      admin_usuario_id: req.admin?.id,
      accion: 'UPDATE_STATUS',
      entidad: 'UsuarioAdmin',
      entidad_id: admin.id,
      detalles: { estado: req.body.estado },
      ip: req.ip
    });

    return res.json({ id: admin.id, estado: admin.estado });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GESTIÓN DE OTROS USUARIOS (con asignación de plan, rol, rubro, configuraciones)
// ═══════════════════════════════════════════════════════════════════════════════

// Obtener todos los usuarios con filtros y relaciones completas
router.get('/usuarios-gestion', async (req, res) => {
  try {
    const { empresa_id, rol_id, estado, search } = req.query;
    
    const where = {};
    if (empresa_id) where.empresa_id = Number(empresa_id);
    if (rol_id) where.rol_id = Number(rol_id);
    if (estado) where.estado = estado;
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const list = await Usuario.findAll({
      where,
      include: [
        { 
          model: Empresa, 
          as: 'empresa',
          attributes: ['id', 'nombre', 'email', 'estado'],
          include: [
            { model: Plan, as: 'plan', attributes: ['id', 'nombre', 'codigo', 'precio_mensual'] },
            { model: Rubro, as: 'rubros', attributes: ['id', 'nombre'] }
          ]
        },
        { 
          model: Rol, 
          as: 'rol',
          attributes: ['id', 'nombre', 'descripcion'],
          include: [{ model: Permiso, as: 'permisos', attributes: ['id', 'nombre', 'codigo'], through: { attributes: [] } }]
        }
      ],
      order: [['id', 'DESC']]
    });
    return res.json(list);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Asignar plan a usuario (a través de su empresa)
router.post('/usuarios/:id/asignar-plan', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(Number(req.params.id), {
      include: [{ model: Empresa, as: 'empresa' }]
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { plan_id } = req.body;
    if (!plan_id) return res.status(400).json({ error: 'plan_id es obligatorio' });

    const plan = await Plan.findByPk(plan_id);
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });

    // Actualizar plan de la empresa
    usuario.empresa.plan_id = plan_id;
    await usuario.empresa.save();

    // Actualizar o crear suscripción
    let suscripcion = await Suscripcion.findOne({ where: { empresa_id: usuario.empresa_id } });
    if (suscripcion) {
      suscripcion.plan_id = plan_id;
      suscripcion.estado = 'activa';
      await suscripcion.save();
    } else {
      suscripcion = await Suscripcion.create({
        empresa_id: usuario.empresa_id,
        plan_id,
        estado: 'activa',
        fecha_inicio: new Date(),
        fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      });
    }

    // Auditoría
    await AuditoriaAdmin.create({
      admin_usuario_id: req.admin?.id,
      accion: 'ASSIGN_PLAN',
      entidad: 'Usuario',
      entidad_id: usuario.id,
      detalles: { plan_id, plan_nombre: plan.nombre, empresa_id: usuario.empresa_id },
      ip: req.ip
    });

    return res.json({
      mensaje: 'Plan asignado correctamente',
      usuario_id: usuario.id,
      empresa_id: usuario.empresa_id,
      plan_id: plan.id,
      plan_nombre: plan.nombre,
      suscripcion_id: suscripcion.id
    });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Asignar rol a usuario
router.post('/usuarios/:id/asignar-rol', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(Number(req.params.id));
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { rol_id } = req.body;
    if (!rol_id) return res.status(400).json({ error: 'rol_id es obligatorio' });

    const rol = await Rol.findByPk(rol_id);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });

    const oldRolId = usuario.rol_id;
    usuario.rol_id = rol_id;
    await usuario.save();

    // Publicar evento para invalidar caché de roles
    eventBus.publish('USER_ROLE_UPDATED', { 
      usuario_id: usuario.id, 
      empresa_id: usuario.empresa_id,
      anterior_rol_id: oldRolId,
      nuevo_rol_id: rol_id 
    }, 'rbac');

    // Auditoría
    await AuditoriaAdmin.create({
      admin_usuario_id: req.admin?.id,
      accion: 'ASSIGN_ROLE',
      entidad: 'Usuario',
      entidad_id: usuario.id,
      detalles: { rol_id, rol_nombre: rol.nombre, anterior_rol_id: oldRolId },
      ip: req.ip
    });

    return res.json({
      mensaje: 'Rol asignado correctamente',
      usuario_id: usuario.id,
      rol_id: rol.id,
      rol_nombre: rol.nombre
    });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Asignar rubro a usuario (a través de su empresa)
router.post('/usuarios/:id/asignar-rubro', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(Number(req.params.id), {
      include: [{ model: Empresa, as: 'empresa' }]
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { rubro_id } = req.body;
    if (!rubro_id) return res.status(400).json({ error: 'rubro_id es obligatorio' });

    const rubro = await Rubro.findByPk(rubro_id);
    if (!rubro) return res.status(404).json({ error: 'Rubro no encontrado' });

    // Actualizar rubro de la empresa usando la tabla intermedia
    await EmpresaRubro.destroy({ where: { empresa_id: usuario.empresa_id } });
    await EmpresaRubro.create({ empresa_id: usuario.empresa_id, rubro_id });

    // Auditoría
    await AuditoriaAdmin.create({
      admin_usuario_id: req.admin?.id,
      accion: 'ASSIGN_RUBRO',
      entidad: 'Usuario',
      entidad_id: usuario.id,
      detalles: { rubro_id, rubro_nombre: rubro.nombre, empresa_id: usuario.empresa_id },
      ip: req.ip
    });

    return res.json({
      mensaje: 'Rubro asignado correctamente',
      usuario_id: usuario.id,
      empresa_id: usuario.empresa_id,
      rubro_id: rubro.id,
      rubro_nombre: rubro.nombre
    });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Actualizar configuración completa de usuario (plan, rol, rubro, estado)
router.put('/usuarios/:id/configuracion', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(Number(req.params.id), {
      include: [{ model: Empresa, as: 'empresa' }]
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { plan_id, rol_id, rubro_id, estado, nombre, email } = req.body;
    const cambios = [];

    // Actualizar datos básicos del usuario
    if (nombre !== undefined) {
      usuario.nombre = nombre;
      cambios.push('nombre');
    }
    if (email !== undefined) {
      // Verificar que el email no esté en uso por otro usuario
      const existingUser = await Usuario.findOne({ 
        where: { email, id: { [Op.ne]: usuario.id } } 
      });
      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está en uso por otro usuario' });
      }
      usuario.email = email;
      cambios.push('email');
    }
    if (estado !== undefined) {
      const estadosValidos = ['activo', 'inactivo', 'suspendido'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: `Estado inválido. Usa: ${estadosValidos.join(', ')}` });
      }
      usuario.estado = estado;
      cambios.push('estado');
    }

    // Actualizar rol
    if (rol_id !== undefined) {
      const rol = await Rol.findByPk(rol_id);
      if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });
      usuario.rol_id = rol_id;
      cambios.push(`rol: ${rol.nombre}`);
    }

    await usuario.save();

    // Actualizar configuración de la empresa
    if (plan_id !== undefined || rubro_id !== undefined) {
      const empresaUpdates = {};
      if (plan_id !== undefined) {
        const plan = await Plan.findByPk(plan_id);
        if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });
        empresaUpdates.plan_id = plan_id;
        cambios.push(`plan: ${plan.nombre}`);
      }
      if (rubro_id !== undefined) {
        const rubro = await Rubro.findByPk(rubro_id);
        if (!rubro) return res.status(404).json({ error: 'Rubro no encontrado' });
        // Actualizar rubro usando la tabla intermedia
        await EmpresaRubro.destroy({ where: { empresa_id: usuario.empresa_id } });
        await EmpresaRubro.create({ empresa_id: usuario.empresa_id, rubro_id });
        cambios.push(`rubro: ${rubro.nombre}`);
      }
      
      await usuario.empresa.update(empresaUpdates);
    }

    // Actualizar suscripción si cambió el plan
    if (plan_id !== undefined) {
      let suscripcion = await Suscripcion.findOne({ where: { empresa_id: usuario.empresa_id } });
      if (suscripcion) {
        await suscripcion.update({ plan_id, estado: 'activa' });
      } else {
        await Suscripcion.create({
          empresa_id: usuario.empresa_id,
          plan_id,
          estado: 'activa',
          fecha_inicio: new Date(),
          fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
      }
    }

    // Auditoría
    await AuditoriaAdmin.create({
      admin_usuario_id: req.admin?.id,
      accion: 'UPDATE_CONFIG',
      entidad: 'Usuario',
      entidad_id: usuario.id,
      detalles: { cambios },
      ip: req.ip
    });

    return res.json({
      mensaje: 'Configuración actualizada correctamente',
      usuario_id: usuario.id,
      cambios_realizados: cambios
    });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Obtener permisos de un usuario
router.get('/usuarios/:id/permisos', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(Number(req.params.id), {
      include: [
        { 
          model: Rol, 
          include: [{ model: Permiso, attributes: ['id', 'nombre', 'codigo'], through: { attributes: [] } }]
        }
      ]
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const permisos = usuario.Rol?.Permisos || [];
    return res.json({
      usuario_id: usuario.id,
      usuario_nombre: usuario.nombre,
      rol_id: usuario.rol_id,
      rol_nombre: usuario.Rol?.nombre,
      permisos: permisos.map(p => ({ id: p.id, nombre: p.nombre, codigo: p.codigo }))
    });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Listar todos los roles disponibles para asignación
router.get('/roles-disponibles', async (req, res) => {
  try {
    const roles = await Rol.findAll({
      attributes: ['id', 'nombre', 'descripcion'],
      include: [
        { 
          model: Permiso, 
          attributes: ['id', 'nombre', 'codigo'], 
          through: { attributes: [] } 
        }
      ],
      order: [['id', 'ASC']]
    });
    return res.json(roles);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Listar todos los planes disponibles para asignación
router.get('/planes-disponibles', async (req, res) => {
  try {
    const planes = await Plan.findAll({
      where: { estado: 'activo' },
      attributes: ['id', 'nombre', 'codigo', 'descripcion', 'precio_mensual'],
      include: [
        { 
          model: PlanLimit, 
          attributes: ['limite', 'valor'] 
        },
        {
          model: Feature,
          attributes: ['id', 'nombre', 'codigo'],
          through: { attributes: ['activo'] }
        }
      ],
      order: [['precio_mensual', 'ASC']]
    });
    return res.json(planes);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// Listar todos los rubros disponibles para asignación
router.get('/rubros-disponibles', async (req, res) => {
  try {
    const rubros = await Rubro.findAll({
      attributes: ['id', 'nombre', 'descripcion'],
      include: [
        {
          model: Feature,
          attributes: ['id', 'nombre', 'codigo'],
          through: { attributes: ['activo'] }
        }
      ],
      order: [['nombre', 'ASC']]
    });
    return res.json(rubros);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ─── RUBROS FEATURES ────────────────────────────────────────────────────────────
// Obtener todas las features asociadas a rubros
router.get('/rubros/features', async (req, res) => {
  try {
    const rubroFeatures = await RubroFeature.findAll({
      include: [
        {
          model: Rubro,
          as: 'rubro', 
          attributes: ['id', 'nombre', 'descripcion']
        },
        {
          model: Feature,
          as: 'feature',
          attributes: ['id', 'nombre', 'codigo', 'descripcion']
        }
      ],
      order: [[Rubro, 'nombre', 'ASC'], [Feature, 'nombre', 'ASC']]
    });
    return res.json(rubroFeatures);
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

// ─── AUDIT HEALTH ───────────────────────────────────────────────────────────────
// Verificar estado del sistema de auditoría
router.get('/audit/health', async (req, res) => {
  try {
    const [totalLogs, logsHoy, ultimaAuditoria] = await Promise.all([
      AuditLog.count(),
      AuditLog.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      AuditLog.findOne({
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt', 'metodo', 'ruta']
      })
    ]);

    return res.json({
      status: 'healthy',
      audit_enabled: true,
      total_logs: totalLogs,
      logs_hoy: logsHoy,
      ultima_auditoria: ultimaAuditoria ? ultimaAuditoria.createdAt : null
    });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

module.exports = router;
