/**
 * Dashboard Repository Interface
 * Define el contrato para el acceso a datos del Dashboard
 */

export class DashboardRepository {
  /**
   * Obtiene el resumen del dashboard
   * @returns {Promise<ResumenDashboard>}
   */
  async getResumen() {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene las series de ventas y gastos mensuales
   * @returns {Promise<SerieFinanciera[]>}
   */
  async getSeriesMensuales() {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene los productos más vendidos
   * @returns {Promise<ProductoPopular[]>}
   */
  async getTopProductos(limit = 5) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene las alertas no leídas
   * @returns {Promise<Alerta[]>}
   */
  async getAlertasNoLeidas(limit = 5) {
    throw new Error('Method not implemented');
  }
}
