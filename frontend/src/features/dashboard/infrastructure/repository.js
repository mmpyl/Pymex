/**
 * Dashboard Repository Implementation
 * Implementación del repositorio usando la API REST
 */

import api from '../../../api/axios';
import { DashboardRepository } from '../domain/repository.js';
import { ResumenDashboard, SerieFinanciera, ProductoPopular, Alerta } from '../domain/entities.js';

export class DashboardAPIRepository extends DashboardRepository {
  constructor() {
    super();
  }

  async getResumen() {
    const response = await api.get('/dashboard/resumen');
    return new ResumenDashboard(response.data);
  }

  async getVentasMensuales() {
    const response = await api.get('/dashboard/ventas-mensuales');
    return response.data.map((d) => ({
      mes: new Date(d.mes).toLocaleDateString('es-PE', { month: 'short' }),
      ventas: parseFloat(d.total || 0),
      gastos: 0,
    }));
  }

  async getGastosMensuales() {
    const response = await api.get('/dashboard/gastos-mensuales');
    return response.data.map((d) => ({
      mes: new Date(d.mes).toLocaleDateString('es-PE', { month: 'short' }),
      gastos: parseFloat(d.total || 0),
    }));
  }

  async getSeriesMensuales() {
    const [ventasData, gastosData] = await Promise.all([
      this.getVentasMensuales(),
      this.getGastosMensuales(),
    ]);

    // Combinar ventas y gastos por mes
    const vMap = {};
    ventasData.forEach((d) => {
      vMap[d.mes] = { mes: d.mes, ventas: d.ventas, gastos: 0 };
    });

    gastosData.forEach((d) => {
      if (vMap[d.mes]) {
        vMap[d.mes].gastos = d.gastos;
      } else {
        vMap[d.mes] = { mes: d.mes, ventas: 0, gastos: d.gastos };
      }
    });

    return Object.values(vMap).slice(-6).map((item) => new SerieFinanciera(item));
  }

  async getTopProductos(limit = 5) {
    const response = await api.get('/dashboard/top-productos');
    return (response.data || []).slice(0, limit).map((p) => new ProductoPopular(p));
  }

  async getAlertasNoLeidas(limit = 5) {
    try {
      const response = await api.get('/alertas');
      return (response.data || [])
        .filter((x) => !x.leido)
        .slice(0, limit)
        .map((a) => new Alerta(a));
    } catch {
      return [];
    }
  }
}

// Instancia singleton para usar en toda la aplicación
export const dashboardRepository = new DashboardAPIRepository();
