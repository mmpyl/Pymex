const { Usuario, Rol, Permiso } = require('../models');

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
      if (rolActual === 'super_admin') return next();

      const usuario = await getUsuarioConRolYPermisos(req);
      if (!usuario || !usuario.Rol) {
        return res.status(403).json({ error: 'Rol no asignado o usuario inactivo' });
      }

      const rolNorm = normalizar(usuario.Rol.nombre);
      const esAdmin = ['admin_empresa', 'admin empresa', 'admin'].includes(rolNorm);
      if (!esAdmin && !permitidos.includes(rolNorm)) {
        return res.status(403).json({ error: 'No tienes permiso por rol para esta acción' });
      }

      next();
    } catch (error) {
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
      if (rolActual === 'super_admin') return next();

      const usuario = await getUsuarioConRolYPermisos(req);

      if (!usuario || !usuario.Rol) {
        return res.status(403).json({ error: 'Usuario sin configuración RBAC' });
      }

      const rolNorm = normalizar(usuario.Rol.nombre);
      const esAdmin = ['admin_empresa', 'admin empresa', 'admin'].includes(rolNorm);
      if (esAdmin) return next();

      const permisos = (usuario.Rol.Permisos || []).map(p => normalizar(p.codigo));
      if (!permisos.includes(permiso)) {
        return res.status(403).json({
          error: 'Permiso denegado',
          permiso_requerido: permisoCodigo
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
};

// Compatibilidad con código previo
const verificarRol = (...rolesPermitidos) => checkRole(...rolesPermitidos);

module.exports = { verificarRol, checkRole, checkPermission, invalidarCacheRoles };
