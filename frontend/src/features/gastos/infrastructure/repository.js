/**
 * Gastos Repository Implementation
 * Implementación del repositorio usando la API REST
 */

import api from '../../../api/axios.js';
import { GastosRepository } from '../domain/repository.js';
import { Gasto, ResumenGastos } from '../domain/entities.js';

export class GastosAPIRepository extends GastosRepository {
  constructor() {
    super();
  }

  async getGastos() {
    const response = await api.get('/gastos');
    return response.data.map((g) => new Gasto(g));
  }

  async registrarGasto(gasto) {
    const response = await api.post('/gastos', gasto);
    return new Gasto(response.data);
  }

  async getResumen() {
    const gastos = await this.getGastos();
    const total = gastos.reduce((sum, g) => sum + g.monto, 0);
    
    const porCategoria = {};
    gastos.forEach((g) => {
      if (!porCategoria[g.categoria]) {
        porCategoria[g.categoria] = 0;
      }
      porCategoria[g.categoria] += g.monto;
    });

    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();
    const gastosMesActual = gastos
      .filter((g) => {
        const fecha = new Date(g.fecha);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
      })
      .reduce((sum, g) => sum + g.monto, 0);

    return new ResumenGastos({
      total_gastos: total,
      gastos_por_categoria: porCategoria,
      gastos_mes_actual: gastosMesActual,
    });
  }

  async getGastosPorCategoria() {
    const resumen = await this.getResumen();
    return resumen.gastos_por_categoria;
  }
}

// Instancia singleton para usar en toda la aplicación
export const gastosRepository = new GastosAPIRepository();
