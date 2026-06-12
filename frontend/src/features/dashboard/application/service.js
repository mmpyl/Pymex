/**
 * Dashboard Application Services
 * Contiene la lógica de aplicación del dominio Dashboard
 */

import { dashboardRepository } from '../infrastructure/repository.js';

export class DashboardService {
  constructor() {
    this.repository = dashboardRepository;
  }

  /**
   * Carga todos los datos necesarios para el dashboard
   */
  async loadDashboardData() {
    const [resumen, series, topProductos, alertas] = await Promise.all([
      this.repository.getResumen(),
      this.repository.getSeriesMensuales(),
      this.repository.getTopProductos(5),
      this.repository.getAlertasNoLeidas(5),
    ]);

    return {
      resumen,
      series,
      topProductos,
      alertas,
    };
  }

  /**
   * Calcula los KPIs del dashboard
   */
  calculateKPIs(resumen) {
    const fmt = (n) => {
      if (!n && n !== 0) return '—';
      return new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    };

    const fmtInt = (n) => new Intl.NumberFormat('es-PE').format(n || 0);

    const utilidad = (resumen?.ventas_mes || 0) - (resumen?.gastos_mes || 0);
    const margen = resumen?.ventas_mes > 0 ? ((utilidad / resumen.ventas_mes) * 100).toFixed(1) : 0;

    return [
      {
        label: 'Ventas del mes',
        value: `S/ ${fmt(resumen?.ventas_mes)}`,
        sub: resumen?.crecimiento_ventas != null ? `${resumen.crecimiento_ventas.toFixed(1)}% vs mes pasado` : 'Sin variación',
        color: 'text-indigo-700',
      },
      {
        label: 'Gastos del mes',
        value: `S/ ${fmt(resumen?.gastos_mes)}`,
        sub: 'Control de egresos',
        color: 'text-rose-600',
      },
      {
        label: 'Utilidad neta',
        value: `S/ ${fmt(utilidad)}`,
        sub: `${margen}% margen`,
        color: utilidad >= 0 ? 'text-emerald-600' : 'text-rose-600',
      },
      {
        label: 'Productos activos',
        value: fmtInt(resumen?.total_productos),
        sub: `${fmtInt(resumen?.stock_bajo)} con stock bajo`,
        color: 'text-amber-600',
      },
    ];
  }

  /**
   * Calcula la serie financiera para visualización
   */
  calculateSerieFinanciera(resumen) {
    const utilidad = (resumen?.ventas_mes || 0) - (resumen?.gastos_mes || 0);
    return [
      { label: 'Ventas', value: resumen?.ventas_mes || 0, color: 'bg-indigo-500' },
      { label: 'Gastos', value: resumen?.gastos_mes || 0, color: 'bg-rose-500' },
      { label: 'Utilidad', value: utilidad, color: utilidad >= 0 ? 'bg-emerald-500' : 'bg-rose-700' },
    ];
  }
}

// Instancia singleton
export const dashboardService = new DashboardService();
