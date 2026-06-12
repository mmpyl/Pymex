/**
 * Ventas Repository Interface
 */

export class VentasRepository {
  /**
   * Obtiene todas las ventas
   * @returns {Promise<Venta[]>}
   */
  async getAll() {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene una venta por ID
   * @param {number} id
   * @returns {Promise<Venta>}
   */
  async getById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Crea una nueva venta
   * @param {Object} ventaData
   * @returns {Promise<Venta>}
   */
  async create(ventaData) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene los productos disponibles
   * @returns {Promise<Array>}
   */
  async getProductos() {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene los clientes disponibles
   * @returns {Promise<Array>}
   */
  async getClientes() {
    throw new Error('Method not implemented');
  }
}
