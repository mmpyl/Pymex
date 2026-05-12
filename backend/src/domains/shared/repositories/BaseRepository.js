/**
 * Interfaz base para todos los repositorios del sistema
 * 
 * Define el contrato común que deben implementar todos los repositorios
 */

class BaseRepository {
  /**
   * Busca una entidad por su ID
   * @param {number|string} id - ID de la entidad
   * @returns {Promise<Object|null>} - La entidad o null si no existe
   */
  async findById(id) {
    throw new Error('Method findById() must be implemented');
  }

  /**
   * Busca todas las entidades
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} - Lista de entidades
   */
  async findAll(options = {}) {
    throw new Error('Method findAll() must be implemented');
  }

  /**
   * Crea una nueva entidad
   * @param {Object} data - Datos de la entidad
   * @returns {Promise<Object>} - La entidad creada
   */
  async create(data) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Actualiza una entidad existente
   * @param {number|string} id - ID de la entidad
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - La entidad actualizada
   */
  async update(id, data) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Elimina una entidad
   * @param {number|string} id - ID de la entidad
   * @returns {Promise<boolean>} - True si se eliminó correctamente
   */
  async delete(id) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Cuenta las entidades que coinciden con los criterios
   * @param {Object} where - Criterios de búsqueda
   * @returns {Promise<number>} - Cantidad de entidades
   */
  async count(where = {}) {
    throw new Error('Method count() must be implemented');
  }

  /**
   * Ejecuta una operación dentro de una transacción
   * @param {Function} callback - Función a ejecutar
   * @returns {Promise<any>} - Resultado de la operación
   */
  async transaction(callback) {
    throw new Error('Method transaction() must be implemented');
  }
}

module.exports = BaseRepository;
