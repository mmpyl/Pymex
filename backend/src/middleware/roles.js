// backend/src/middleware/roles.js — versión mejorada con logging de auditoría
const { Usuario, Rol, Permiso } = require('../domains/auth/models');
const eventBus = require('../domains/eventBus');
const logger = require('../utils/logger');

// Normalización de nombres (quita acentos, minúsculas, trim)
const normalizar = (valor = '') =>
  valor.toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

// Caché dinámica de roles desde DB
let rolesMapDB = null;
let rolesMapTTL = 0;
const ROLES_TTL_MS = 5 * 60 * 1000; // 5 minutos

const ROLES_MAP_FALLBACK = {
  1: 'admin',
  2: 'gerente',
  3: 'empleado',
  4: 'contador',
  5: 'super_admin',
  6: 'soporte'
};

const cargarRolesMap = async () => {
  if (rolesMapDB && Date.now() < rolesMapTTL) return rolesMapDB;
  try {
    const roles = await Rol.findAll({ attributes: ['id', 'nombre'] });
    rolesMapDB = {};
    for (const r of roles) {
      rolesMapDB[r.id] = normalizar(r.nombre);
    }
    rolesMapTTL = Date.now() + ROLES_TTL_MS;
    return rolesMapDB;
  } catch {
    return Object.fromEntries(
      Object.entries(ROLES_MAP_FALLBACK).map(([k, v]) => [k, normalizar(v)])
    );
  }
};

const invalidarCacheRoles = () => { 
  rolesMapDB = null; 
  rolesMapTTL = 0; 
};

// Suscribirse a eventos para invalidar caché cuando cambien roles o permisos
eventBus.subscribe('ROLE_CHANGED', (data) => {
  if (data && data.empresa_id) {
    invalidarCacheRoles();
    console.log(`[Roles Cache] Caché invalidada por ROLE_CHANGED para empresa ${data.empresa_id}`);
  }
});

eventBus.subscribe('PERMISSION_CHANGED', (data) => {
  if (data && data.empresa_id) {
    invalidarCacheRoles();
    console.log(`[Roles Cache] Caché invalidada por PERMISSION_CHANGED para empresa ${data.empresa_id}`);
  }
});

eventBus.subscribe('USER_ROLE_UPDATED', (data) => {
  if (data && data.empresa_id) {
    invalidarCacheRoles();
    console.log(`[Roles Cache] Caché invalidada por USER_ROLE_UPDATED para empresa ${data.empresa_id}`);
  }
});

// Cache de usuario con rol + permisos por request
const getUsuarioConRolYPermisos = async (req) => {
  if (req._usuarioRbac) return req._usuarioRbac;

  const usuario = await Usuario.findOne({
    where: {
      id: req.usuario?.id,
      empresa_id: req.usuario?.empresa_id,
      estado: 'activo'
    },
    include: [{
      model: Rol,
      attributes: ['id', 'nombre'],
      include: [{ model: Permiso, attributes: ['id', 'nombre', 'codigo'], through: { attributes: [] } }]
    }]
  });

  req._usuarioRbac = usuario;
  return usuario;
};

const checkRole = (...rolesPermitidos) => {
  const permitidos = rolesPermitidos.flat().map(normalizar);

  return async (req, res, next) => {
    try {
      const rolesMap = await cargarRolesMap();
      const rolActual = rolesMap[req.usuario?.rol_id] || '';
      
      // Logging de auditoría para intentos de acceso
      logger.info('Intento de acceso por rol', {
        userId: req.usuario?.id,
        empresaId: req.usuario?.empresa_id,
        rol: rolActual,
        ruta: req.originalUrl,
        metodo: req.method,
        rolesPermitidos: permitidos
      });
      
      if (rolActual === 'super_admin') {
        logger.info('Acceso concedido por super_admin', {
          userId: req.usuario?.id,
          ruta: req.originalUrl
        });
        return next();
      }

      const usuario = await getUsuarioConRolYPermisos(req);
      if (!usuario || !usuario.Rol) {
        logger.warn('Acceso denegado: Rol no asignado o usuario inactivo', {
          userId: req.usuario?.id,
          empresaId: req.usuario?.empresa_id,
          ruta: req.originalUrl
        });
        return res.status(403).json({ error: 'Rol no asignado o usuario inactivo' });
      }

      const rolNorm = normalizar(usuario.Rol.nombre);
      // Nombres de roles estandarizados para evitar confusión semántica
      const esAdmin = ['admin_empresa', 'admin empresa', 'admin'].includes(rolNorm);
      if (!esAdmin && !permitidos.includes(rolNorm)) {
        logger.warn('Acceso denegado por rol insuficiente', {
          userId: req.usuario?.id,
          empresaId: req.usuario?.empresa_id,
          rol: rolNorm,
          ruta: req.originalUrl,
          rolesRequeridos: permitidos
        });
        return res.status(403).json({ error: 'No tienes permiso por rol para esta acción' });
      }

      logger.info('Acceso concedido por rol', {
        userId: req.usuario?.id,
        empresaId: req.usuario?.empresa_id,
        rol: rolNorm,
        ruta: req.originalUrl
      });
      
      next();
    } catch (error) {
      logger.error('Error verificando rol', {
        userId: req.usuario?.id,
        empresaId: req.usuario?.empresa_id,
        error: error.message,
        ruta: req.originalUrl
      });
      return res.status(500).json({ error: error.message });
    }
  };
};

const checkPermission = (permisoCodigo) => {
  const permiso = normalizar(permisoCodigo);

  return async (req, res, next) => {
    try {
      const rolesMap = await cargarRolesMap();
      const rolActual = rolesMap[req.usuario?.rol_id] || '';
      
      // Logging de auditoría para intentos de acceso por permiso
      logger.info('Intento de acceso por permiso', {
        userId: req.usuario?.id,
        empresaId: req.usuario?.empresa_id,
        rol: rolActual,
        permisoRequerido: permisoCodigo,
        ruta: req.originalUrl,
        metodo: req.method
      });
      
      if (rolActual === 'super_admin') {
        logger.info('Acceso concedido por super_admin (permiso)', {
          userId: req.usuario?.id,
          ruta: req.originalUrl
        });
        return next();
      }

      const usuario = await getUsuarioConRolYPermisos(req);

      if (!usuario || !usuario.Rol) {
        logger.warn('Acceso denegado: Usuario sin configuración RBAC', {
          userId: req.usuario?.id,
          empresaId: req.usuario?.empresa_id,
          ruta: req.originalUrl
        });
        return res.status(403).json({ error: 'Usuario sin configuración RBAC' });
      }

      const rolNorm = normalizar(usuario.Rol.nombre);
      // Nombres de roles estandarizados para evitar confusión semántica
      const esAdmin = ['admin_empresa', 'admin empresa', 'admin'].includes(rolNorm);
      if (esAdmin) {
        logger.info('Acceso concedido por rol admin (permiso)', {
          userId: req.usuario?.id,
          empresaId: req.usuario?.empresa_id,
          rol: rolNorm,
          ruta: req.originalUrl
        });
        return next();
      }

      const permisos = (usuario.Rol.Permisos || []).map(p => normalizar(p.codigo));
      if (!permisos.includes(permiso)) {
        logger.warn('Acceso denegado por permiso insuficiente', {
          userId: req.usuario?.id,
          empresaId: req.usuario?.empresa_id,
          rol: rolNorm,
          permisoRequerido: permisoCodigo,
          permisosUsuario: permisos,
          ruta: req.originalUrl
        });
        return res.status(403).json({
          error: 'Permiso denegado',
          permiso_requerido: permisoCodigo
        });
      }

      logger.info('Acceso concedido por permiso', {
        userId: req.usuario?.id,
        empresaId: req.usuario?.empresa_id,
        rol: rolNorm,
        permiso: permisoCodigo,
        ruta: req.originalUrl
      });
      
      next();
    } catch (error) {
      logger.error('Error verificando permiso', {
        userId: req.usuario?.id,
        empresaId: req.usuario?.empresa_id,
        error: error.message,
        ruta: req.originalUrl
      });
      return res.status(500).json({ error: error.message });
    }
  };
};

// Compatibilidad con código previo
const verificarRol = (...rolesPermitidos) => checkRole(...rolesPermitidos);

module.exports = { verificarRol, checkRole, checkPermission, invalidarCacheRoles };
