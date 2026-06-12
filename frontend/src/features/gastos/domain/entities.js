/**
 * Gastos Domain Entities
 * Representa las entidades del dominio Gastos
 */

export class Gasto {
  constructor({ id, categoria, descripcion, monto, fecha }) {
    this.id = id;
    this.categoria = categoria || 'Otros';
    this.descripcion = descripcion || '';
    this.monto = parseFloat(monto) || 0;
    this.fecha = fecha || new Date().toISOString();
  }

  get montoFormateado() {
    return new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.monto);
  }

  static getCategorias() {
    return ['Alquiler', 'Servicios', 'Salarios', 'Transporte', 'Marketing', 'Suministros', 'Otros'];
  }
}

export class ResumenGastos {
  constructor({ total_gastos, gastos_por_categoria, gastos_mes_actual }) {
    this.total_gastos = total_gastos || 0;
    this.gastos_por_categoria = gastos_por_categoria || {};
    this.gastos_mes_actual = gastos_mes_actual || 0;
  }

  get totalFormateado() {
    return new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.total_gastos);
  }
}
