/**
 * Interfaz Pública del Dominio AUTH
 * 
 * Este archivo expone las funciones que otros dominios pueden usar
 * para interactuar con el dominio AUTH sin violar los límites.
 */

const authModels = require('../models');
const { Usuario, Rol } = authModels;
const UsuarioAdmin = require('../models/UsuarioAdmin');

/**
 * Verifica si un usuario existe y está activo
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object|null>} - Datos del usuario o null
 */
const getUserById = async (userId) => {
  return await Usuario.findOne({
    where: { id: userId, estado: 'activo' },
    attributes: ['id', 'empresa_id', 'rol_id', 'nombre', 'email', 'estado']
  });
};

/**
 * Verifica si un administrador existe y está activo
 * @param {number} adminId - ID del administrador
 * @returns {Promise<Object|null>} - Datos del admin o null
 */
const getAdminById = async (adminId) => {
  return await UsuarioAdmin.findOne({
    where: { id: adminId, estado: 'activo' },
    attributes: ['id', 'nombre', 'email', 'rol', 'estado']
  });
};

/**
 * Obtiene los permisos de un usuario a través de su rol
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array<string>>} - Lista de nombres de permisos
 */
const getUserPermissions = async (userId) => {
  const usuario = await Usuario.findOne({
    where: { id: userId, estado: 'activo' },
    include: [
      {
        model: Rol,
        attributes: ['id', 'nombre'],
        include: [{
          model: require('../models/RolPermiso'),
          attributes: [],
          include: [{
            model: require('../models/Permiso'),
            attributes: ['nombre']
          }]
        }]
      }
    ]
  });

  if (!usuario || !usuario.Rol) {
    return [];
  }

  return usuario.Rol.Permisos?.map(p => p.nombre) || [];
};

/**
 * Verifica si una empresa está activa
 * @param {number} empresaId - ID de la empresa
 * @returns {Promise<boolean>}
 */
const isCompanyActive = async (empresaId) => {
  const coreModels = require('../../core/models');
  const { Empresa } = coreModels;
  
  const empresa = await Empresa.findOne({
    where: { id: empresaId },
    attributes: ['id', 'estado']
  });
  
  return empresa?.estado === 'activo';
};

/**
 * Verifica si una empresa está suspendida
 * @param {number} empresaId - ID de la empresa
 * @returns {Promise<boolean>}
 */
const isCompanySuspended = async (empresaId) => {
  const coreModels = require('../../core/models');
  const { Empresa } = coreModels;
  
  const empresa = await Empresa.findOne({
    where: { id: empresaId },
    attributes: ['id', 'estado']
  });
  
  return empresa?.estado === 'suspendido';
};

module.exports = {
  getUserById,
  getAdminById,
  getUserPermissions,
  isCompanyActive,
  isCompanySuspended
};
