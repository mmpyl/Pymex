/**
 * Repositorio de Usuarios - Dominio AUTH
 * 
 * Implementa las operaciones de acceso a datos para la entidad Usuario
 */

const BaseRepository = require('../../shared/repositories/BaseRepository');
const { Usuario } = require('../models');

class UsuarioRepository extends BaseRepository {
  /**
   * Busca un usuario por su ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return await Usuario.findByPk(id, {
      include: [{
        model: require('../models/Rol'),
        as: 'rol',
        attributes: ['id', 'nombre']
      }]
    });
  }

  /**
   * Busca todos los usuarios
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>}
   */
  async findAll(options = {}) {
    const { where = {}, include = [], limit, offset, order } = options;
    
    return await Usuario.findAll({
      where,
      include: [
        ...include,
        {
          model: require('../models/Rol'),
          as: 'rol',
          attributes: ['id', 'nombre']
        }
      ],
      limit,
      offset,
      order: order || [['id', 'ASC']]
    });
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} data - Datos del usuario
   * @returns {Promise<Object>}
   */
  async create(data) {
    return await Usuario.create(data);
  }

  /**
   * Actualiza un usuario existente
   * @param {number} id - ID del usuario
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new Error(`Usuario con ID ${id} no encontrado`);
    }
    await usuario.update(data);
    return usuario;
  }

  /**
   * Elimina un usuario (soft delete)
   * @param {number} id - ID del usuario
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new Error(`Usuario con ID ${id} no encontrado`);
    }
    await usuario.update({ estado: 'inactivo' });
    return true;
  }

  /**
   * Cuenta los usuarios que coinciden con los criterios
   * @param {Object} where - Criterios de búsqueda
   * @returns {Promise<number>}
   */
  async count(where = {}) {
    return await Usuario.count({ where });
  }

  /**
   * Ejecuta una operación dentro de una transacción
   * @param {Function} callback - Función a ejecutar
   * @returns {Promise<any>}
   */
  async transaction(callback) {
    const sequelize = require('../../../config/database');
    const transaction = await sequelize.transaction();
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Busca un usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    return await Usuario.findOne({
      where: { email },
      include: [{
        model: require('../models/Rol'),
        as: 'rol',
        attributes: ['id', 'nombre']
      }]
    });
  }

  /**
   * Busca usuarios por empresa
   * @param {number} empresaId - ID de la empresa
   * @returns {Promise<Array>}
   */
  async findByEmpresa(empresaId) {
    return await Usuario.findAll({
      where: { empresa_id: empresaId },
      include: [{
        model: require('../models/Rol'),
        as: 'rol',
        attributes: ['id', 'nombre']
      }]
    });
  }

  /**
   * Busca un usuario activo por ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object|null>}
   */
  async findActiveById(id) {
    return await Usuario.findOne({
      where: { id, estado: 'activo' },
      include: [{
        model: require('../models/Rol'),
        as: 'rol',
        attributes: ['id', 'nombre']
      }]
    });
  }
}

module.exports = UsuarioRepository;
