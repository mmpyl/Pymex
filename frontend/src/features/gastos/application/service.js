/**
 * Gastos Application Services
 * Contiene la lógica de aplicación del dominio Gastos
 */

import { gastosRepository } from '../infrastructure/repository.js';
import { Gasto } from '../domain/entities.js';

export class GastosService {
  constructor() {
    this.repository = gastosRepository;
  }

  /**
   * Carga todos los datos necesarios para la gestión de gastos
   */
  async loadGastosData() {
    const [gastos, resumen] = await Promise.all([
      this.repository.getGastos(),
      this.repository.getResumen(),
    ]);

    return {
      gastos,
      resumen,
      categorias: Gasto.getCategorias(),
    };
  }

  /**
   * Registra un nuevo gasto
   */
  async registrarGasto(data) {
    const gasto = await this.repository.registrarGasto(data);
    return gasto;
  }

  /**
   * Obtiene las estadísticas de gastos
   */
  getEstadisticas(resumen) {
    return {
      total: resumen.total_gastos,
      totalFormateado: resumen.totalFormateado,
      porCategoria: resumen.gastos_por_categoria,
    };
  }
}

// Instancia singleton
export const gastosService = new GastosService();
