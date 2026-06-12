/**
 * Inventario Repository Interface
 * Define el contrato para el acceso a datos del Inventario
 */

export class InventarioRepository {
  /**
   * Obtiene todos los productos del inventario
   * @returns {Promise<ProductoInventario[]>}
   */
  async getProductos() {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene el historial de movimientos
   * @returns {Promise<MovimientoInventario[]>}
   */
  async getHistorial() {
    throw new Error('Method not implemented');
  }

  /**
   * Registra un nuevo movimiento de inventario
   * @param {Object} movimiento - Datos del movimiento
   * @returns {Promise<{stock_actual: number}>}
   */
  async registrarMovimiento(movimiento) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene productos con stock bajo
   * @returns {Promise<ProductoInventario[]>}
   */
  async getProductosBajoStock() {
    throw new Error('Method not implemented');
  }
}
