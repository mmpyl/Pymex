/**
 * Reportes Repository Interface
 * Define el contrato para el acceso a datos del dominio Reportes
 */

export class ReportesRepository {
  /**
   * Descarga un reporte de ventas en PDF
   * @param {string} desde - Fecha inicial
   * @param {string} hasta - Fecha final
   * @returns {Promise<Blob>}
   */
  async descargarVentasPDF(desde, hasta) {
    throw new Error('Method not implemented');
  }

  /**
   * Descarga un reporte de ventas en Excel
   * @param {string} desde - Fecha inicial
   * @param {string} hasta - Fecha final
   * @returns {Promise<Blob>}
   */
  async descargarVentasExcel(desde, hasta) {
    throw new Error('Method not implemented');
  }

  /**
   * Descarga un reporte de gastos en Excel
   * @returns {Promise<Blob>}
   */
  async descargarGastosExcel() {
    throw new Error('Method not implemented');
  }
}
