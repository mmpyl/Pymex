// backend/src/controllers/authController.js — versión consolidada
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const authModels = require('../domains/auth/models');
const coreModels = require('../domains/core/models');
const billingModels = require('../domains/billing/models');

const { Empresa, sequelize } = coreModels;
const { Usuario, Rol } = authModels;
const { Plan, Suscripcion } = billingModels;
const UsuarioAdmin = require('../domains/auth/models/UsuarioAdmin');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generarTokenEmpresa = (usuario) =>
  jwt.sign(
    {
      token_type: 'empresa',
      id:         usuario.id,
      empresa_id: usuario.empresa_id,
      rol_id:     usuario.rol_id,
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

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { empresa_nombre, empresa_email, empresa_ruc, nombre, email, password } = req.body;

    if (!empresa_nombre || !empresa_email || !nombre || !email || !password) {
      await t.rollback();
      return res.status(400).json({ error: 'Faltan campos obligatorios para el registro' });
    }

    const existente = await Empresa.findOne({ where: { email: empresa_email }, transaction: t });
    if (existente) {
      await t.rollback();
      return res.status(409).json({ error: 'Ya existe una empresa registrada con ese email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const empresa = await Empresa.create({
      nombre: empresa_nombre, email: empresa_email,
      ruc: empresa_ruc || null, plan: 'basico', estado: 'activo'
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
    return res.status(500).json({ error: error.message });
  }
};

// ─── START TRIAL ──────────────────────────────────────────────────────────────
const startTrial = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { empresa_nombre, empresa_email, empresa_ruc, nombre, email, password, dias_trial = 14 } = req.body;

    if (!empresa_nombre || !empresa_email || !nombre || !email || !password) {
      await t.rollback();
      return res.status(400).json({ error: 'Faltan campos obligatorios para iniciar trial' });
    }

    const empresaExistente = await Empresa.findOne({ where: { email: empresa_email }, transaction: t });
    if (empresaExistente) {
      await t.rollback();
      return res.status(409).json({ error: 'Ya existe una empresa registrada con ese email' });
    }

    let planUsado = await Plan.findOne({ where: { codigo: 'trial', estado: 'activo' }, transaction: t });
    if (!planUsado) {
      planUsado = await Plan.findOne({ where: { estado: 'activo' }, order: [['precio_mensual', 'ASC']], transaction: t });
    }
    if (!planUsado) {
      await t.rollback();
      return res.status(503).json({ error: 'El servicio no está disponible en este momento. Contacta a soporte.' });
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
    const fin    = new Date(inicio);
    fin.setDate(fin.getDate() + Number(dias_trial));

    await Suscripcion.create({
      empresa_id: empresa.id, plan_id: planUsado.id,
      estado: 'trial', fecha_inicio: inicio, fecha_fin: fin, auto_renovacion: false
    }, { transaction: t });

    await t.commit();
    return res.status(201).json({
      mensaje: 'Trial iniciado',
      empresa: { id: empresa.id, nombre: empresa.nombre, fecha_fin_trial: fin },
      usuario: { id: usuario.id, email: usuario.email }
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ error: error.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const usuario = await Usuario.findOne({
      where:   { email, estado: 'activo' },
      include: [{ model: Empresa, attributes: ['id', 'nombre', 'estado', 'plan'] }]
    });

    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) return res.status(401).json({ error: 'Credenciales inválidas' });

    const aviso = usuario.Empresa?.estado === 'suspendido'
      ? 'Tu empresa está suspendida. Contacta al soporte.'
      : null;

    const token = generarTokenEmpresa(usuario);
    return res.json({
      token,
      aviso,
      usuario: {
        id:         usuario.id,
        empresa_id: usuario.empresa_id,
        rol_id:     usuario.rol_id,
        nombre:     usuario.nombre,
        email:      usuario.email,
        empresa:    usuario.Empresa
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ─── LOGIN ADMIN ──────────────────────────────────────────────────────────────
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const admin = await UsuarioAdmin.findOne({ where: { email, estado: 'activo' } });
    if (!admin) return res.status(401).json({ error: 'Credenciales admin inválidas' });

    const coincide = await bcrypt.compare(password, admin.password);
    if (!coincide) return res.status(401).json({ error: 'Credenciales admin inválidas' });

    const token = generarTokenAdmin(admin);
    return res.json({
      token,
      admin: { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ─── PERFIL ───────────────────────────────────────────────────────────────────
const perfil = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({
      where:      { id: req.usuario.id, empresa_id: req.usuario.empresa_id },
      attributes: ['id', 'empresa_id', 'rol_id', 'nombre', 'email', 'estado'],
      include:    [{ model: Empresa, attributes: ['id', 'nombre', 'plan', 'estado'] }]
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(usuario);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ─── BOOTSTRAP SUPER ADMIN — SOLO DESARROLLO ──────────────────────────────────
const bootstrapSuperAdmin = async (req, res) => {
  // ⚠️ CRÍTICO: En producción debe estar SIEMPRE deshabilitado
  if (process.env.NODE_ENV === 'production' || process.env.BOOTSTRAP_DISABLED === 'true') {
    return res.status(404).json({ 
      error: 'Endpoint no disponible en producción. Contacta al administrador del sistema.' 
    });
  }

  const bootstrapSecret = process.env.BOOTSTRAP_SUPER_ADMIN_SECRET;
  if (!bootstrapSecret) {
    return res.status(503).json({ 
      error: 'BOOTSTRAP_SUPER_ADMIN_SECRET no configurado. Este endpoint es solo para desarrollo inicial.' 
    });
  }

  const { secret, nombre, email, password } = req.body;
  if (secret !== bootstrapSecret) {
    // Log de intento fallido para auditoría
    console.warn('[AUDIT] Intento fallido de bootstrap super admin desde IP:', req.ip);
    return res.status(403).json({ error: 'Secret inválido para bootstrap super admin' });
  }
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'nombre, email y password son obligatorios' });
  }

  const t = await sequelize.transaction();
  try {
    const existente = await UsuarioAdmin.findOne({ where: { email }, transaction: t });
    if (existente) {
      await t.rollback();
      return res.status(409).json({ error: 'Ya existe un admin con ese email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await UsuarioAdmin.create({
      nombre, email, password: passwordHash, rol: 'super_admin', estado: 'activo'
    }, { transaction: t });

    await t.commit();
    
    // Log de éxito para auditoría
    console.log('[AUDIT] Super admin creado exitosamente:', email);
    
    return res.status(201).json({
      mensaje:     'Super admin creado. ESTABLECE BOOTSTRAP_DISABLED=true INMEDIATAMENTE.',
      advertencia: 'Este endpoint será deshabilitado en el próximo reinicio si BOOTSTRAP_DISABLED=true',
      super_admin: { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol }
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { register, startTrial, login, loginAdmin, perfil, bootstrapSuperAdmin };