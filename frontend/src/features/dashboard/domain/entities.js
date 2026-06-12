/**
 * Dashboard Domain Entities
 * Representa las entidades del dominio Dashboard
 */

export class ResumenDashboard {
  constructor({
    ventas_mes,
    gastos_mes,
    total_productos,
    stock_bajo,
    crecimiento_ventas,
  }) {
    this.ventas_mes = ventas_mes || 0;
    this.gastos_mes = gastos_mes || 0;
    this.total_productos = total_productos || 0;
    this.stock_bajo = stock_bajo || 0;
    this.crecimiento_ventas = crecimiento_ventas || 0;
  }

  get utilidad() {
    return this.ventas_mes - this.gastos_mes;
  }

  get margen() {
    if (this.ventas_mes === 0) return 0;
    return ((this.utilidad / this.ventas_mes) * 100).toFixed(1);
  }
}

export class SerieFinanciera {
  constructor({ mes, ventas, gastos }) {
    this.mes = mes;
    this.ventas = ventas || 0;
    this.gastos = gastos || 0;
  }
}

export class ProductoPopular {
  constructor({ producto_id, nombre, total_ingresos }) {
    this.producto_id = producto_id;
    this.nombre = nombre;
    this.total_ingresos = parseFloat(total_ingresos) || 0;
  }
}

export class Alerta {
  constructor({ id, tipo, mensaje, leido, fecha }) {
    this.id = id;
    this.tipo = tipo;
    this.mensaje = mensaje;
    this.leido = leido || false;
    this.fecha = fecha || new Date().toISOString();
  }

  static getTipoConfig(tipo) {
    const config = {
      stock_bajo: { color: 'bg-red-500', badge: 'text-red-700 bg-red-100', label: 'Stock bajo' },
      ventas_bajas: { color: 'bg-amber-500', badge: 'text-amber-700 bg-amber-100', label: 'Ventas bajas' },
      gastos_altos: { color: 'bg-violet-500', badge: 'text-violet-700 bg-violet-100', label: 'Gastos altos' },
    };
    return config[tipo] || { color: 'bg-slate-500', badge: 'text-slate-700 bg-slate-100', label: 'Alerta' };
  }
}

export class KPIDashboard {
  constructor({ label, value, sub, color }) {
    this.label = label;
    this.value = value;
    this.sub = sub;
    this.color = color;
  }
}
