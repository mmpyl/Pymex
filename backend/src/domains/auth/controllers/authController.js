/**
 * Controlador de Autenticación del Dominio AUTH
 * 
 * Este controlador maneja las solicitudes HTTP relacionadas con autenticación.
 * Utiliza el authService para la lógica de negocio.
 */

const crypto = require('crypto');
const { asyncHandler, ValidationError, ConflictError, AuthenticationError, NotFoundError, ServiceUnavailableError } = require('../../../middleware/errorHandler');
const logger = require('../../../utils/logger');

// Servicios del dominio
const authService = require('../services/authService');
const { Usuario, Rol, sequelize } = require('../models');
const coreModels = require('../../core/models');
const billingModels = require('../../billing/models');
const { eventBus } = require('../../eventBus');

const { Empresa } = coreModels;
const { Plan, Suscripcion } = billingModels;

/**
 * Registra una nueva empresa y usuario administrador
 */
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
      empresa:  { id: empresa.id, nombre: empresa.nombre },
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

/**
 * Inicia sesión de usuario de empresa
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Autenticar usuario usando el servicio
  const { usuario, rolNombre, aviso, empresa } = await authService.authenticateUser(email, password);
  
  // Generar tokens
  const token = authService.generarTokenEmpresa(usuario, rolNombre);
  const { refreshToken, refreshTokenHash, expiresAt } = authService.generarRefreshToken({
    id: usuario.id,
    userType: 'empresa',
    email: usuario.email
  });
  
  // Almacenar refresh token
  const RevokedToken = require('../models/RevokedToken');
  await RevokedToken.create({
    token_hash: refreshTokenHash,
    token_type: 'refresh',
    revoked_at: new Date(),
    expires_at: expiresAt
  });
  
  // Registrar actividad de auditoría
  await authService.registrarActividadAuth('LOGIN_SUCCESS', {
    userId: usuario.id,
    email: usuario.email,
    empresaId: usuario.empresa_id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    rol: rolNombre
  });
  
  return res.json({
    token,
    refreshToken,
    tokenExpiresIn: process.env.JWT_EXPIRES || '8h',
    refreshTokenExpiresAt: expiresAt,
    aviso,
    usuario: {
      id:         usuario.id,
      empresa_id: usuario.empresa_id,
      rol_id:     usuario.rol_id,
      rol:        rolNombre,
      nombre:     usuario.nombre,
      email:      usuario.email,
      empresa
    }
  });
});

/**
 * Inicia sesión de administrador
 */
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Autenticar admin usando el servicio
  const { admin } = await authService.authenticateAdmin(email, password, {
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Generar tokens
  const token = authService.generarTokenAdmin(admin);
  const { refreshToken, refreshTokenHash, expiresAt } = authService.generarRefreshToken({
    id: admin.id,
    userType: 'admin',
    email: admin.email
  });
  
  // Almacenar refresh token
  const RevokedToken = require('../models/RevokedToken');
  await RevokedToken.create({
    token_hash: refreshTokenHash,
    token_type: 'refresh_admin',
    revoked_at: new Date(),
    expires_at: expiresAt
  });
  
  // Registrar actividad de auditoría
  await authService.registrarActividadAuth('ADMIN_LOGIN_SUCCESS', {
    adminId: admin.id,
    email: admin.email,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    rol: admin.rol
  });
  
  return res.json({
    token,
    refreshToken,
    tokenExpiresIn: process.env.JWT_EXPIRES || '8h',
    refreshTokenExpiresAt: expiresAt,
    admin: { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol }
  });
});

/**
 * Obtiene el perfil del usuario autenticado
 */
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

/**
 * Refresca el token de acceso usando refresh token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  // Validar refresh token
  const storedToken = await authService.validateRefreshToken(refreshToken);
  
  // Decodificar token para obtener payload
  const jwt = require('jsonwebtoken');
  let tokenPayload;
  try {
    tokenPayload = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (error) {
    throw new AuthenticationError('Refresh token inválido');
  }
  
  const tokenUserId = tokenPayload?.userId || storedToken.userId;
  
  let newAccessToken, newRefreshTokenData;
  
  if (storedToken.token_type === 'refresh') {
    // Token de empresa
    const usuario = await Usuario.findOne({
      where: { id: tokenUserId, estado: 'activo' },
      include: [
        { model: Empresa, attributes: ['id', 'nombre', 'estado', 'plan'] },
        { model: Rol, attributes: ['id', 'nombre'] }
      ]
    });
    
    if (!usuario) {
      throw new AuthenticationError('Usuario no encontrado. Inicia sesión nuevamente.');
    }
    
    if (usuario.Empresa?.estado === 'suspendido') {
      throw new AuthenticationError('Empresa suspendida. Contacta al soporte.');
    }
    
    const rolNombre = usuario.Rol?.nombre || 'admin';
    newAccessToken = authService.generarTokenEmpresa(usuario, rolNombre);
    newRefreshTokenData = authService.generarRefreshToken({
      id: usuario.id,
      userType: 'empresa',
      email: usuario.email
    });
    
    // Rotación de tokens
    await storedToken.destroy();
    const RevokedToken = require('../models/RevokedToken');
    await RevokedToken.create({
      token_hash: newRefreshTokenData.refreshTokenHash,
      token_type: 'refresh',
      revoked_at: new Date(),
      expires_at: newRefreshTokenData.expiresAt
    });
    
    await authService.registrarActividadAuth('REFRESH_TOKEN_SUCCESS', {
      tokenId: storedToken.id,
      userId: usuario.id,
      email: usuario.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      tokenType: 'empresa'
    });
    
  } else if (storedToken.token_type === 'refresh_admin') {
    // Token de admin
    const UsuarioAdmin = require('../models/UsuarioAdmin');
    const admin = await UsuarioAdmin.findOne({
      where: { id: tokenUserId, estado: 'activo' }
    });
    
    if (!admin) {
      throw new AuthenticationError('Administrador no encontrado. Inicia sesión nuevamente.');
    }
    
    newAccessToken = authService.generarTokenAdmin(admin);
    newRefreshTokenData = authService.generarRefreshToken({
      id: admin.id,
      userType: 'admin',
      email: admin.email
    });
    
    // Rotación de tokens
    await storedToken.destroy();
    const RevokedToken = require('../models/RevokedToken');
    await RevokedToken.create({
      token_hash: newRefreshTokenData.refreshTokenHash,
      token_type: 'refresh_admin',
      revoked_at: new Date(),
      expires_at: newRefreshTokenData.expiresAt
    });
    
    await authService.registrarActividadAuth('REFRESH_TOKEN_SUCCESS', {
      tokenId: storedToken.id,
      adminId: admin.id,
      email: admin.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      tokenType: 'admin'
    });
  } else {
    throw new AuthenticationError('Tipo de token inválido');
  }
  
  return res.json({
    token: newAccessToken,
    refreshToken: newRefreshTokenData.refreshToken,
    tokenExpiresIn: process.env.JWT_EXPIRES || '8h',
    refreshTokenExpiresAt: newRefreshTokenData.expiresAt
  });
});

/**
 * Bootstrap de super admin (solo desarrollo)
 */
const bootstrapSuperAdmin = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production' || process.env.BOOTSTRAP_DISABLED === 'true') {
    throw new NotFoundError('Endpoint no disponible en producción. Contacta al administrador del sistema.');
  }

  const bootstrapSecret = process.env.BOOTSTRAP_SUPER_ADMIN_SECRET;
  if (!bootstrapSecret) {
    throw new ServiceUnavailableError('BOOTSTRAP_SUPER_ADMIN_SECRET no configurado.');
  }

  const { secret, nombre, email, password } = req.body;
  if (secret !== bootstrapSecret) {
    await authService.registrarActividadAuth('BOOTSTRAP_ADMIN_FAILED', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      reason: 'Secret inválido'
    });
    throw new AuthenticationError('Secret inválido para bootstrap super admin');
  }
  if (!nombre || !email || !password) {
    throw new ValidationError('nombre, email y password son obligatorios');
  }

  const t = await sequelize.transaction();
  try {
    const UsuarioAdmin = require('../models/UsuarioAdmin');
    const existente = await UsuarioAdmin.findOne({ where: { email }, transaction: t });
    if (existente) {
      await t.rollback();
      await authService.registrarActividadAuth('BOOTSTRAP_ADMIN_FAILED', {
        email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        reason: 'Email ya existe'
      });
      throw new ConflictError('Ya existe un admin con ese email');
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await UsuarioAdmin.create({
      nombre, email, password: passwordHash, rol: 'super_admin', estado: 'activo'
    }, { transaction: t });

    await t.commit();

    await authService.registrarActividadAuth('BOOTSTRAP_ADMIN_SUCCESS', {
      adminId: admin.id,
      email: admin.email,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

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

/**
 * Inicia un trial para una nueva empresa
 */
const startTrial = asyncHandler(async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { empresa_nombre, empresa_ruc, nombre, email, password, dias_trial = 14 } = req.body;

    if (!empresa_nombre || !nombre || !email || !password) {
      await t.rollback();
      throw new ValidationError('Faltan campos obligatorios para iniciar trial');
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
      nombre: empresa_nombre,
      ruc: empresa_ruc || null, plan: planUsado.codigo, estado: 'activo'
    }, { transaction: t });

    const bcrypt = require('bcryptjs');
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

    // ✅ PUBLICAR EVENTO: Trial iniciado
    eventBus.publish('TRIAL_STARTED', {
      userId: usuario.id,
      empresaId: empresa.id,
      email: usuario.email,
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

module.exports = { 
  register, 
  startTrial, 
  login, 
  loginAdmin, 
  perfil, 
  refreshToken, 
  bootstrapSuperAdmin 
};
