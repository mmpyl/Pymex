// backend/src/controllers/authController.js — versión consolidada
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authModels = require('../domains/auth/models');
const coreModels = require('../domains/core/models');
const billingModels = require('../domains/billing/models');
const { eventBus } = require('../domains/eventBus');
const { asyncHandler, ValidationError, ConflictError, AuthenticationError, AuthorizationError, NotFoundError, ServiceUnavailableError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const { Empresa, sequelize } = coreModels;
const { Usuario, Rol } = authModels;
const { Plan, Suscripcion } = billingModels;
const UsuarioAdmin = require('../domains/auth/models/UsuarioAdmin');
const RevokedToken = require('../domains/auth/models/RevokedToken');
const AuditoriaAdmin = require('../domains/auth/models/AuditoriaAdmin');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Genera un token de acceso JWT para usuarios de empresa
 */
const generarTokenEmpresa = (usuario, rolNombre) =>
  jwt.sign(
    {
      token_type: 'empresa',
      scope: 'business', // Claim explícito de scope para validación
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

/**
 * Genera un token de acceso JWT para administradores
 */
const generarTokenAdmin = (admin) =>
  jwt.sign(
    {
      token_type: 'admin',
      scope: 'global', // Claim explícito de scope para validación
      id:         admin.id,
      rol:        admin.rol,
      nombre:     admin.nombre,
      jti:        crypto.randomUUID()
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '8h' }
  );

/**
 * Genera un refresh token seguro (hash almacenado en DB)
 * @param {Object} userData - Datos del usuario para asociar al token
 * @param {number} userData.id - ID del usuario
 * @param {string} userData.userType - Tipo de usuario: 'empresa' o 'admin'
 * @param {string} userData.email - Email del usuario
 * @returns {{ refreshToken: string, refreshTokenHash: string, expiresAt: Date }}
 */
const generarRefreshToken = (userData = {}) => {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30));
  
  return { 
    refreshToken, 
    refreshTokenHash, 
    expiresAt,
    userId: userData.id || null,
    userType: userData.userType || 'empresa',
    metadata: {
      email: userData.email || null,
      createdAt: new Date().toISOString()
    }
  };
};

/**
 * Registra actividad de auditoría para autenticación
 */
const registrarActividadAuth = async (evento, datos, transaction = null) => {
  try {
    await AuditoriaAdmin.create({
      evento,
      metadata: datos,
      fecha: new Date()
    }, { transaction });
    
    logger.info(`[AUDIT] ${evento}`, { 
      event: evento, 
      ...datos,
      component: 'auth_audit'
    });
  } catch (error) {
    logger.error('[AUDIT] Error registrando actividad de autenticación', {
      error: error.message,
      evento,
      datos,
      component: 'auth_audit'
    });
  }
};

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

// ─── START TRIAL ──────────────────────────────────────────────────────────────
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
  
  // Generar refresh token para sesiones de larga duración
  const { refreshToken, refreshTokenHash, expiresAt } = generarRefreshToken({
    id: usuario.id,
    userType: 'empresa',
    email: usuario.email
  });
  
  // Almacenar refresh token en la base de datos
  await RevokedToken.create({
    token_hash: refreshTokenHash,
    token_type: 'refresh',
    revoked_at: new Date(), // Usamos revoked_at como fecha de creación
    expires_at: expiresAt
  });
  
  // Registrar actividad de auditoría para login exitoso
  await registrarActividadAuth('LOGIN_SUCCESS', {
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
    // Registrar intento fallido de login admin para auditoría
    await registrarActividadAuth('ADMIN_LOGIN_FAILED', {
      email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      reason: 'Credenciales inválidas - usuario no encontrado'
    });
    throw new AuthenticationError('Credenciales admin inválidas');
  }

  const coincide = await bcrypt.compare(password, admin.password);
  if (!coincide) {
    // Registrar intento fallido de login admin para auditoría
    await registrarActividadAuth('ADMIN_LOGIN_FAILED', {
      adminId: admin.id,
      email: admin.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      reason: 'Contraseña incorrecta'
    });
    throw new AuthenticationError('Credenciales admin inválidas');
  }

  const token = generarTokenAdmin(admin);
  
  // Generar refresh token para sesiones de larga duración
  const { refreshToken, refreshTokenHash, expiresAt } = generarRefreshToken({
    id: admin.id,
    userType: 'admin',
    email: admin.email
  });
  
  // Almacenar refresh token en la base de datos
  await RevokedToken.create({
    token_hash: refreshTokenHash,
    token_type: 'refresh_admin',
    revoked_at: new Date(),
    expires_at: expiresAt
  });
  
  // Registrar actividad de auditoría para login exitoso
  await registrarActividadAuth('ADMIN_LOGIN_SUCCESS', {
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

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
/**
 * Endpoint para obtener nuevo access token usando refresh token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw new ValidationError('Refresh token es requerido');
  }
  
  // Calcular hash del refresh token recibido
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  
  // Buscar el refresh token en la base de datos
  const storedToken = await RevokedToken.findOne({
    where: {
      token_hash: refreshTokenHash,
      token_type: ['refresh', 'refresh_admin']
    }
  });
  
  if (!storedToken) {
    await registrarActividadAuth('REFRESH_TOKEN_INVALID', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      reason: 'Refresh token no encontrado'
    });
    throw new AuthenticationError('Refresh token inválido o expirado');
  }
  
  // Verificar si el token ha expirado
  const now = new Date();
  if (now > storedToken.expires_at) {
    // Eliminar token expirado
    await storedToken.destroy();
    
    await registrarActividadAuth('REFRESH_TOKEN_EXPIRED', {
      tokenId: storedToken.id,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    throw new AuthenticationError('Refresh token expirado. Inicia sesión nuevamente.');
  }
  
  // Determinar tipo de token y generar nuevos tokens
  let newAccessToken, newRefreshTokenData, newExpiresAt;
  
  const tokenPayload = verifyRefreshToken(refreshToken);
  const tokenUserId = tokenPayload?.userId;

  if (storedToken.token_type === 'refresh') {
    // Token de empresa - buscar usuario y generar nuevo access token
    const usuario = await Usuario.findOne({
      where: { id: tokenUserId, estado: 'activo' },
      include: [
        { model: Empresa, attributes: ['id', 'nombre', 'estado', 'plan'] },
        { model: Rol, attributes: ['id', 'nombre'] }
      ]
    });
    
    if (!usuario) {
      await registrarActividadAuth('REFRESH_TOKEN_USER_NOT_FOUND', {
        tokenId: storedToken.id,
        userId: tokenUserId,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      throw new AuthenticationError('Usuario no encontrado. Inicia sesión nuevamente.');
    }
    
    // Verificar si la empresa está suspendida
    if (usuario.Empresa?.estado === 'suspendido') {
      await registrarActividadAuth('REFRESH_TOKEN_COMPANY_SUSPENDED', {
        tokenId: storedToken.id,
        userId: usuario.id,
        empresaId: usuario.empresa_id,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      throw new AuthenticationError('Empresa suspendida. Contacta al soporte.');
    }
    
    const rolNombre = usuario.Rol?.nombre || 'admin';
    newAccessToken = generarTokenEmpresa(usuario, rolNombre);
    
    // Generar nuevo refresh token (rotación de tokens)
    newRefreshTokenData = generarRefreshToken({
      id: usuario.id,
      userType: 'empresa',
      email: usuario.email
    });
    
    // Invalidar el refresh token anterior (rotación)
    await storedToken.destroy();
    
    // Almacenar nuevo refresh token
    await RevokedToken.create({
      token_hash: newRefreshTokenData.refreshTokenHash,
      token_type: 'refresh',
      revoked_at: new Date(),
      expires_at: newRefreshTokenData.expiresAt
    });
    
    await registrarActividadAuth('REFRESH_TOKEN_SUCCESS', {
      tokenId: storedToken.id,
      userId: usuario.id,
      email: usuario.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      tokenType: 'empresa'
    });
    
    return res.json({
      token: newAccessToken,
      refreshToken: newRefreshTokenData.refreshToken,
      tokenExpiresIn: process.env.JWT_EXPIRES || '8h',
      refreshTokenExpiresAt: newRefreshTokenData.expiresAt
    });
    
  } else if (storedToken.token_type === 'refresh_admin') {
    // Token de admin - buscar admin y generar nuevo access token
    const admin = await UsuarioAdmin.findOne({
      where: { id: tokenUserId, estado: 'activo' }
    });
    
    if (!admin) {
      await registrarActividadAuth('REFRESH_TOKEN_ADMIN_NOT_FOUND', {
        tokenId: storedToken.id,
        userId: tokenUserId,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      throw new AuthenticationError('Administrador no encontrado. Inicia sesión nuevamente.');
    }
    
    newAccessToken = generarTokenAdmin(admin);
    
    // Generar nuevo refresh token (rotación de tokens)
    newRefreshTokenData = generarRefreshToken({
      id: admin.id,
      userType: 'admin',
      email: admin.email
    });
    
    // Invalidar el refresh token anterior (rotación)
    await storedToken.destroy();
    
    // Almacenar nuevo refresh token
    await RevokedToken.create({
      token_hash: newRefreshTokenData.refreshTokenHash,
      token_type: 'refresh_admin',
      revoked_at: new Date(),
      expires_at: newRefreshTokenData.expiresAt
    });
    
    await registrarActividadAuth('REFRESH_TOKEN_SUCCESS', {
      tokenId: storedToken.id,
      adminId: admin.id,
      email: admin.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      tokenType: 'admin'
    });
    
    return res.json({
      token: newAccessToken,
      refreshToken: newRefreshTokenData.refreshToken,
      tokenExpiresIn: process.env.JWT_EXPIRES || '8h',
      refreshTokenExpiresAt: newRefreshTokenData.expiresAt
    });
  }
  
  // Caso no debería ocurrir
  throw new AuthenticationError('Tipo de token inválido');
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
    await registrarActividadAuth('BOOTSTRAP_ADMIN_FAILED', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      reason: 'Secret inválido'
    });
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
      await registrarActividadAuth('BOOTSTRAP_ADMIN_FAILED', {
        email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        reason: 'Email ya existe'
      });
      throw new ConflictError('Ya existe un admin con ese email');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await UsuarioAdmin.create({
      nombre, email, password: passwordHash, rol: 'super_admin', estado: 'activo'
    }, { transaction: t });

    await t.commit();

    // Log de éxito para auditoría
    await registrarActividadAuth('BOOTSTRAP_ADMIN_SUCCESS', {
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

module.exports = { register, startTrial, login, loginAdmin, perfil, refreshToken, bootstrapSuperAdmin };
