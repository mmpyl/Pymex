/**
 * Servicio de Autenticación del Dominio AUTH
 * 
 * Este servicio encapsula la lógica de negocio relacionada con autenticación.
 * Es utilizado internamente por los controladores del dominio AUTH.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { asyncHandler, ValidationError, ConflictError, AuthenticationError, AuthorizationError, NotFoundError } = require('../../../middleware/errorHandler');
const logger = require('../../../utils/logger');

// Modelos del dominio AUTH
const authModels = require('../models');
const { Usuario, Rol, RevokedToken } = authModels;

// Modelos de otros dominios (solo consulta a través de interfaces públicas)
const coreModels = require('../../core/models');
const { Empresa } = coreModels;

const UsuarioAdmin = require('../models/UsuarioAdmin');
const AuditoriaAdmin = require('../models/AuditoriaAdmin');

/**
 * Genera un token de acceso JWT para usuarios de empresa
 */
const generarTokenEmpresa = (usuario, rolNombre) =>
  jwt.sign(
    {
      token_type: 'empresa',
      scope: 'business',
      id:         usuario.id,
      empresa_id: usuario.empresa_id,
      rol_id:     usuario.rol_id,
      rol:        rolNombre,
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
      scope: 'global',
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

/**
 * Verifica credenciales de usuario y retorna datos de autenticación
 */
const authenticateUser = async (email, password) => {
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

  const rolNombre = usuario.Rol?.nombre || 'admin';
  const aviso = usuario.Empresa?.estado === 'suspendido'
    ? 'Tu empresa está suspendida. Contacta al soporte.'
    : null;

  return {
    usuario,
    rolNombre,
    aviso,
    empresa: usuario.Empresa
  };
};

/**
 * Verifica credenciales de administrador y retorna datos de autenticación
 */
const authenticateAdmin = async (email, password, reqInfo = {}) => {
  if (!email || !password) {
    throw new ValidationError('Email y contraseña son obligatorios');
  }

  const admin = await UsuarioAdmin.findOne({ where: { email, estado: 'activo' } });
  if (!admin) {
    await registrarActividadAuth('ADMIN_LOGIN_FAILED', {
      email,
      ip: reqInfo.ip,
      userAgent: reqInfo.userAgent,
      reason: 'Credenciales inválidas - usuario no encontrado'
    });
    throw new AuthenticationError('Credenciales admin inválidas');
  }

  const coincide = await bcrypt.compare(password, admin.password);
  if (!coincide) {
    await registrarActividadAuth('ADMIN_LOGIN_FAILED', {
      adminId: admin.id,
      email: admin.email,
      ip: reqInfo.ip,
      userAgent: reqInfo.userAgent,
      reason: 'Contraseña incorrecta'
    });
    throw new AuthenticationError('Credenciales admin inválidas');
  }

  return { admin };
};

/**
 * Valida y verifica un refresh token
 */
const validateRefreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ValidationError('Refresh token es requerido');
  }
  
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  
  const storedToken = await RevokedToken.findOne({
    where: {
      token_hash: refreshTokenHash,
      token_type: ['refresh', 'refresh_admin']
    }
  });
  
  if (!storedToken) {
    throw new AuthenticationError('Refresh token inválido o expirado');
  }
  
  const now = new Date();
  if (now > storedToken.expires_at) {
    await storedToken.destroy();
    throw new AuthenticationError('Refresh token expirado. Inicia sesión nuevamente.');
  }
  
  return storedToken;
};

module.exports = {
  generarTokenEmpresa,
  generarTokenAdmin,
  generarRefreshToken,
  registrarActividadAuth,
  authenticateUser,
  authenticateAdmin,
  validateRefreshToken
};
