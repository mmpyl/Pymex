/**
 * Inventario Domain Entities
 * Representa las entidades del dominio Inventario
 */

export class ProductoInventario {
  constructor({ id, nombre, stock, stock_minimo, precio_compra, precio_venta }) {
    this.id = id;
    this.nombre = nombre;
    this.stock = stock || 0;
    this.stock_minimo = stock_minimo || 0;
    this.precio_compra = parseFloat(precio_compra) || 0;
    this.precio_venta = parseFloat(precio_venta) || 0;
  }

  get estaBajoStock() {
    return this.stock <= this.stock_minimo;
  }

  get diferenciaStock() {
    return this.stock_minimo - this.stock;
  }
}

export class MovimientoInventario {
  constructor({ id, producto_id, producto_nombre, tipo, cantidad, motivo, fecha }) {
    this.id = id;
    this.producto_id = producto_id;
    this.producto_nombre = producto_nombre;
    this.tipo = tipo || 'entrada'; // entrada, salida, ajuste
    this.cantidad = parseInt(cantidad) || 0;
    this.motivo = motivo || '';
    this.fecha = fecha || new Date().toISOString();
  }

  static getTipoConfig(tipo) {
    const config = {
      entrada: { color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Entrada' },
      salida: { color: 'text-red-700', bg: 'bg-red-100', label: 'Salida' },
      ajuste: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Ajuste' },
    };
    return config[tipo] || { color: 'text-slate-700', bg: 'bg-slate-100', label: tipo };
  }
}

export class ResumenInventario {
  constructor({ total_productos, stock_bajo, movimientos_hoy }) {
    this.total_productos = total_productos || 0;
    this.stock_bajo = stock_bajo || 0;
    this.movimientos_hoy = movimientos_hoy || 0;
  }
}
