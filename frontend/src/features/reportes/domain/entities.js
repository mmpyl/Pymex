/**
 * Reportes Domain Entities
 * Representa las entidades del dominio Reportes
 */

export class Reporte {
  constructor({ id, tipo, formato, titulo, descripcion, fecha_generacion }) {
    this.id = id;
    this.tipo = tipo || 'ventas'; // ventas, gastos, inventario
    this.formato = formato || 'pdf'; // pdf, excel
    this.titulo = titulo || '';
    this.descripcion = descripcion || '';
    this.fecha_generacion = fecha_generacion || new Date().toISOString();
  }

  static getTiposReporte() {
    return [
      { id: 'ventas-pdf', titulo: 'Reporte de Ventas', formato: 'PDF', icono: '📄', color: 'text-red-700', bg: 'bg-red-100', btn: 'bg-red-600' },
      { id: 'ventas-excel', titulo: 'Reporte de Ventas', formato: 'Excel', icono: '📊', color: 'text-emerald-700', bg: 'bg-emerald-100', btn: 'bg-emerald-600' },
      { id: 'gastos-excel', titulo: 'Reporte de Gastos', formato: 'Excel', icono: '💸', color: 'text-amber-700', bg: 'bg-amber-100', btn: 'bg-amber-600' },
    ];
  }
}

export class FiltroReporte {
  constructor({ desde, hasta }) {
    this.desde = desde || null;
    this.hasta = hasta || null;
  }

  get tieneRango() {
    return this.desde && this.hasta;
  }

  get rangoFormateado() {
    if (!this.tieneRango) return '';
    return `del ${new Date(this.desde).toLocaleDateString('es-PE')} al ${new Date(this.hasta).toLocaleDateString('es-PE')}`;
  }
}
