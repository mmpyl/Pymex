/**
 * Controlador RBAC (Role-Based Access Control) del Dominio AUTH
 * 
 * Maneja la gestión de roles, permisos y usuarios.
 */

const bcrypt = require('bcryptjs');
const { asyncHandler, ValidationError, ConflictError, NotFoundError } = require('../../../middleware/errorHandler');
const { eventBus } = require('../../eventBus');

// Modelos del dominio AUTH
const authModels = require('../models');
const { Usuario, Rol, Permiso, RolPermiso } = authModels;

/**
 * Obtiene todos los roles con sus permisos
 */
const getRoles = asyncHandler(async (req, res) => {
  const roles = await Rol.findAll({
    include: [{ 
      model: Permiso, 
      attributes: ['id', 'nombre', 'codigo'], 
      through: { attributes: [] } 
    }],
    order: [['id', 'ASC']]
  });
  res.json(roles);
});

/**
 * Obtiene todos los permisos disponibles
 */
const getPermisos = asyncHandler(async (req, res) => {
  const permisos = await Permiso.findAll({ 
    order: [['codigo', 'ASC']] 
  });
  res.json(permisos);
});

/**
 * Actualiza los permisos de un rol
 */
const updateRolPermisos = asyncHandler(async (req, res) => {
  const rolId = Number(req.params.rolId);
  const permisos = Array.isArray(req.body.permisos) 
    ? req.body.permisos.map(Number) 
    : [];

  const rol = await Rol.findByPk(rolId);
  if (!rol) {
    throw new NotFoundError('Rol no encontrado');
  }

  await RolPermiso.destroy({ where: { rol_id: rolId } });
  if (permisos.length) {
    await RolPermiso.bulkCreate(
      permisos.map((permisoId) => ({ rol_id: rolId, permiso_id: permisoId }))
    );
  }

  // Publicar evento para invalidar caché de roles
  eventBus.publish('ROLE_CHANGED', { 
    rol_id: rolId, 
    empresa_id: req.usuario.empresa_id,
    permisos_actualizados: permisos 
  }, 'AUTH');

  res.json({ 
    mensaje: 'Permisos del rol actualizados', 
    rol_id: rolId, 
    permisos 
  });
});

/**
 * Obtiene todos los usuarios de la empresa
 */
const getUsuarios = asyncHandler(async (req, res) => {
  const usuarios = await Usuario.findAll({
    where: { empresa_id: req.usuario.empresa_id },
    attributes: ['id', 'empresa_id', 'rol_id', 'nombre', 'email', 'estado', 'fecha_registro'],
    include: [{ model: Rol, attributes: ['id', 'nombre'] }],
    order: [['id', 'ASC']]
  });
  res.json(usuarios);
});

/**
 * Crea un nuevo usuario en la empresa
 */
const createUsuario = asyncHandler(async (req, res) => {
  const { nombre, email, password, rol_id } = req.body;
  
  if (!nombre || !email || !password || !rol_id) {
    throw new ValidationError('nombre, email, password y rol_id son obligatorios');
  }

  const existe = await Usuario.findOne({ 
    where: { empresa_id: req.usuario.empresa_id, email } 
  });
  if (existe) {
    throw new ConflictError('Ya existe un usuario con ese email en la empresa');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({
    empresa_id: req.usuario.empresa_id,
    rol_id,
    nombre,
    email,
    password: passwordHash,
    estado: 'activo'
  });

  res.status(201).json({
    id: usuario.id,
    empresa_id: usuario.empresa_id,
    rol_id: usuario.rol_id,
    nombre: usuario.nombre,
    email: usuario.email,
    estado: usuario.estado
  });
});

/**
 * Actualiza el rol de un usuario
 */
const updateUsuarioRol = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findOne({
    where: { id: Number(req.params.id), empresa_id: req.usuario.empresa_id }
  });
  
  if (!usuario) {
    throw new NotFoundError('Usuario no encontrado');
  }

  const { rol_id } = req.body;
  if (!rol_id) {
    throw new ValidationError('rol_id es obligatorio');
  }

  usuario.rol_id = rol_id;
  await usuario.save();

  // Publicar evento para invalidar caché de roles
  eventBus.publish('USER_ROLE_UPDATED', { 
    usuario_id: usuario.id, 
    empresa_id: req.usuario.empresa_id,
    nuevo_rol_id: rol_id 
  }, 'AUTH');

  res.json({ 
    mensaje: 'Rol actualizado', 
    usuario_id: usuario.id, 
    rol_id: usuario.rol_id 
  });
});

module.exports = {
  getRoles,
  getPermisos,
  updateRolPermisos,
  getUsuarios,
  createUsuario,
  updateUsuarioRol
};
