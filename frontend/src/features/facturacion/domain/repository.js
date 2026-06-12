/**
 * Facturacion Repository Interface
 * Define el contrato para el acceso a datos del dominio Facturacion
 */

export class FacturacionRepository {
  /**
   * Obtiene todos los comprobantes emitidos
   * @returns {Promise<Comprobante[]>}
   */
  async getComprobantes() {
    throw new Error('Method not implemented');
  }

  /**
   * Emite una boleta electrónica
   * @param {string} ventaId - ID de la venta
   * @param {Object} datos - Datos del cliente
   * @returns {Promise<Object>}
   */
  async emitirBoleta(ventaId, datos) {
    throw new Error('Method not implemented');
  }

  /**
   * Emite una factura electrónica
   * @param {string} ventaId - ID de la venta
   * @param {Object} datos - Datos del cliente
   * @returns {Promise<Object>}
   */
  async emitirFactura(ventaId, datos) {
    throw new Error('Method not implemented');
  }

  /**
   * Descarga el PDF de un comprobante
   * @param {string} id - ID del comprobante
   * @param {string} tipo - Tipo de comprobante
   * @returns {Promise<Blob>}
   */
  async descargarPDF(id, tipo) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene las ventas disponibles para facturar
   * @returns {Promise<Array>}
   */
  async getVentasDisponibles() {
    throw new Error('Method not implemented');
  }
}
