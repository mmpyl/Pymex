/**
 * Gastos Repository Interface
 * Define el contrato para el acceso a datos del dominio Gastos
 */

export class GastosRepository {
  /**
   * Obtiene todos los gastos registrados
   * @returns {Promise<Gasto[]>}
   */
  async getGastos() {
    throw new Error('Method not implemented');
  }

  /**
   * Registra un nuevo gasto
   * @param {Object} gasto - Datos del gasto
   * @returns {Promise<Gasto>}
   */
  async registrarGasto(gasto) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene el resumen de gastos
   * @returns {Promise<ResumenGastos>}
   */
  async getResumen() {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene gastos por categoría
   * @returns {Promise<Object>}
   */
  async getGastosPorCategoria() {
    throw new Error('Method not implemented');
  }
}
