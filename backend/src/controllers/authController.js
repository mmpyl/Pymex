// backend/src/controllers/authController.js — versión consolidada
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authModels = require('../domains/auth/models');
const coreModels = require('../domains/core/models');
const billingModels = require('../domains/billing/models');
const { eventBus } = require('../domains/eventBus');
const { asyncHandler, ValidationError, ConflictError, AuthenticationError, AuthorizationError, NotFoundError, ServiceUnavailableError } = require('../middleware/errorHandler');

const { Empresa, sequelize } = coreModels;
const { Usuario, Rol } = authModels;
const { Plan, Suscripcion } = billingModels;
const UsuarioAdmin = require('../domains/auth/models/UsuarioAdmin');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generarTokenEmpresa = (usuario, rolNombre) =>
  jwt.sign(
    {
      token_type: 'empresa',
      id:         usuario.id,
      empresa_id: usuario.empresa_id,
      rol_id:     usuario.rol_id,
      rol:        rolNombre, // Incluir nombre del rol en el token
      nombre:     usuario.nombre,
      jti:        crypto.randomUUID()
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '8h' }
  );

const generarTokenAdmin = (admin) =>
  jwt.sign(
    {
      token_type: 'admin',
      id:         admin.id,
      rol:        admin.rol,
      nombre:     admin.nombre,
      jti:        crypto.randomUUID()
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '8h' }
  );

const register = asyncHandler(async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      await t.rollback();
      throw new ValidationError('Faltan campos obligatorios para el registro');
    }

    // Verificar si ya existe un usuario con ese email
    const usuarioExistente = await Usuario.findOne({ where: { email }, transaction: t });
    if (usuarioExistente) {
      await t.rollback();
      throw new ConflictError('Ya existe un usuario registrado con ese email');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Crear empresa automáticamente con datos generados
    const empresa = await Empresa.create({
      nombre: `${nombre}'s Empresa`,
      email: email,
      plan: 'basico',
      estado: 'activo'
    }, { transaction: t });

    const rolAdmin = await Rol.findOne({
      where: sequelize.where(sequelize.fn('LOWER', sequelize.col('nombre')), 'admin'),
      transaction: t
    });

    const usuario = await Usuario.create({
      empresa_id: empresa.id,
      rol_id:     rolAdmin?.id || 1,
      nombre, email, password: passwordHash, estado: 'activo'
    }, { transaction: t });

    // Trial automático
    const TRIAL_DIAS = Number(process.env.TRIAL_DIAS || 14);
    let planTrial = await Plan.findOne({ where: { codigo: 'trial', estado: 'activo' }, transaction: t });
    if (!planTrial) {
      planTrial = await Plan.findOne({ where: { estado: 'activo' }, order: [['precio_mensual', 'ASC']], transaction: t });
    }

    let suscripcionCreada = null;
    if (planTrial) {
      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + TRIAL_DIAS);
      suscripcionCreada = await Suscripcion.create({
        empresa_id: empresa.id, plan_id: planTrial.id,
        estado: 'trial', fecha_inicio: new Date(), fecha_fin: fechaFin, auto_renovacion: false
      }, { transaction: t });
      await empresa.update({ plan: planTrial.codigo }, { transaction: t });
    }

    await t.commit();

    // ✅ PUBLICAR EVENTO: Email de bienvenida y notificaciones
    eventBus.publish('USER_REGISTERED', {
      userId: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      empresaId: empresa.id,
      fecha: new Date().toISOString()
    }, 'AUTH');

    return res.status(201).json({
      mensaje:  'Registro completado',
      empresa:  { id: empresa.id, nombre: empresa.nombre, email: empresa.email },
      usuario:  { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
      trial:    suscripcionCreada
        ? { plan: planTrial.nombre, dias: TRIAL_DIAS, expira: suscripcionCreada.fecha_fin }
        : null
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

// ─── START TRIAL ──────────────────────────────────────────────────────────────
const startTrial = asyncHandler(async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { empresa_nombre, empresa_email, empresa_ruc, nombre, email, password, dias_trial = 14 } = req.body;

    if (!empresa_nombre || !empresa_email || !nombre || !email || !password) {
      await t.rollback();
      throw new ValidationError('Faltan campos obligatorios para iniciar trial');
    }

    const empresaExistente = await Empresa.findOne({ where: { email: empresa_email }, transaction: t });
    if (empresaExistente) {
      await t.rollback();
      throw new ConflictError('Ya existe una empresa registrada con ese email');
    }

    let planUsado = await Plan.findOne({ where: { codigo: 'trial', estado: 'activo' }, transaction: t });
    if (!planUsado) {
      planUsado = await Plan.findOne({ where: { estado: 'activo' }, order: [['precio_mensual', 'ASC']], transaction: t });
    }
    if (!planUsado) {
      await t.rollback();
      throw new ServiceUnavailableError('El servicio no está disponible en este momento. Contacta a soporte.');
    }

    const empresa = await Empresa.create({
      nombre: empresa_nombre, email: empresa_email,
      ruc: empresa_ruc || null, plan: planUsado.codigo, estado: 'activo'
    }, { transaction: t });

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({
      empresa_id: empresa.id, rol_id: 1,
      nombre, email, password: passwordHash, estado: 'activo'
    }, { transaction: t });

    const inicio = new Date();
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + Number(dias_trial));

    await Suscripcion.create({
      empresa_id: empresa.id, plan_id: planUsado.id,
      estado: 'trial', fecha_inicio: inicio, fecha_fin: fin, auto_renovacion: false
    }, { transaction: t });

    await t.commit();

    // ✅ PUBLICAR EVENTO: Trial iniciado - notificar sistema
    eventBus.publish('TRIAL_STARTED', {
      userId: usuario.id,
      empresaId: empresa.id,
      email: empresa.email,
      planCodigo: planUsado.codigo,
      diasTrial: dias_trial,
      fechaFin: fin,
      fecha: new Date().toISOString()
    }, 'AUTH');

    return res.status(201).json({
      mensaje: 'Trial iniciado',
      empresa: { id: empresa.id, nombre: empresa.nombre, fecha_fin_trial: fin },
      usuario: { id: usuario.id, email: usuario.email }
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ValidationError('Email y contraseña son obligatorios');
  }

  const usuario = await Usuario.findOne({
    where:   { email, estado: 'activo' },
    include: [
      { model: Empresa, attributes: ['id', 'nombre', 'estado', 'plan'] },
      { model: Rol, attributes: ['id', 'nombre'] }
    ]
  });

  if (!usuario) {
    throw new AuthenticationError('Credenciales inválidas');
  }

  const coincide = await bcrypt.compare(password, usuario.password);
  if (!coincide) {
    throw new AuthenticationError('Credenciales inválidas');
  }

  const aviso = usuario.Empresa?.estado === 'suspendido'
    ? 'Tu empresa está suspendida. Contacta al soporte.'
    : null;

  const rolNombre = usuario.Rol?.nombre || 'admin';
  const token = generarTokenEmpresa(usuario, rolNombre);
  return res.json({
    token,
    aviso,
    usuario: {
      id:         usuario.id,
      empresa_id: usuario.empresa_id,
      rol_id:     usuario.rol_id,
      rol:        rolNombre,
      nombre:     usuario.nombre,
      email:      usuario.email,
      empresa:    usuario.Empresa
    }
  });
});

// ─── LOGIN ADMIN ──────────────────────────────────────────────────────────────
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ValidationError('Email y contraseña son obligatorios');
  }

  const admin = await UsuarioAdmin.findOne({ where: { email, estado: 'activo' } });
  if (!admin) {
    throw new AuthenticationError('Credenciales admin inválidas');
  }

  const coincide = await bcrypt.compare(password, admin.password);
  if (!coincide) {
    throw new AuthenticationError('Credenciales admin inválidas');
  }

  const token = generarTokenAdmin(admin);
  return res.json({
    token,
    admin: { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol }
  });
});

// ─── PERFIL ───────────────────────────────────────────────────────────────────
const perfil = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findOne({
    where:      { id: req.usuario.id, empresa_id: req.usuario.empresa_id },
    attributes: ['id', 'empresa_id', 'rol_id', 'nombre', 'email', 'estado'],
    include:    [
      { model: Empresa, attributes: ['id', 'nombre', 'plan', 'estado'] },
      { model: Rol, attributes: ['id', 'nombre'] }
    ]
  });
  if (!usuario) {
    throw new NotFoundError('Usuario no encontrado');
  }
  return res.json({
    ...usuario.toJSON(),
    rol: usuario.Rol?.nombre || 'admin'
  });
});

// ─── BOOTSTRAP SUPER ADMIN — SOLO DESARROLLO ──────────────────────────────────
const bootstrapSuperAdmin = asyncHandler(async (req, res) => {
  // ⚠️ CRÍTICO: En producción debe estar SIEMPRE deshabilitado
  if (process.env.NODE_ENV === 'production' || process.env.BOOTSTRAP_DISABLED === 'true') {
    throw new NotFoundError('Endpoint no disponible en producción. Contacta al administrador del sistema.');
  }

  const bootstrapSecret = process.env.BOOTSTRAP_SUPER_ADMIN_SECRET;
  if (!bootstrapSecret) {
    throw new ServiceUnavailableError('BOOTSTRAP_SUPER_ADMIN_SECRET no configurado. Este endpoint es solo para desarrollo inicial.');
  }

  const { secret, nombre, email, password } = req.body;
  if (secret !== bootstrapSecret) {
    // Log de intento fallido para auditoría
    console.warn('[AUDIT] Intento fallido de bootstrap super admin desde IP:', req.ip);
    throw new AuthorizationError('Secret inválido para bootstrap super admin');
  }
  if (!nombre || !email || !password) {
    throw new ValidationError('nombre, email y password son obligatorios');
  }

  const t = await sequelize.transaction();
  try {
    const existente = await UsuarioAdmin.findOne({ where: { email }, transaction: t });
    if (existente) {
      await t.rollback();
      throw new ConflictError('Ya existe un admin con ese email');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await UsuarioAdmin.create({
      nombre, email, password: passwordHash, rol: 'super_admin', estado: 'activo'
    }, { transaction: t });

    await t.commit();

    // Log de éxito para auditoría
    console.warn('[AUDIT] Super admin creado exitosamente:', email);

    return res.status(201).json({
      mensaje:     'Super admin creado. ESTABLECE BOOTSTRAP_DISABLED=true INMEDIATAMENTE.',
      advertencia: 'Este endpoint será deshabilitado en el próximo reinicio si BOOTSTRAP_DISABLED=true',
      super_admin: { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol }
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

module.exports = { register, startTrial, login, loginAdmin, perfil, bootstrapSuperAdmin };
