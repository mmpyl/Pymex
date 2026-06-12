/**
 * Ventas Domain Entities
 * Representa las entidades del dominio Ventas
 */

export class Venta {
  constructor({
    id,
    cliente_id,
    metodo_pago,
    total,
    estado,
    fecha,
    items = [],
    Cliente = null,
  }) {
    this.id = id;
    this.cliente_id = cliente_id;
    this.metodo_pago = metodo_pago || 'efectivo';
    this.total = parseFloat(total) || 0;
    this.estado = estado || 'completada';
    this.fecha = fecha || new Date().toISOString();
    this.items = items;
    this.Cliente = Cliente;
  }

  get totalFormateado() {
    return new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.total);
  }

  static METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia', 'yape'];
}

export class ItemVenta {
  constructor({ producto_id, cantidad, precio_unitario, Producto = null }) {
    this.producto_id = producto_id;
    this.cantidad = parseInt(cantidad) || 1;
    this.precio_unitario = parseFloat(precio_unitario) || 0;
    this.Producto = Producto;
  }

  get subtotal() {
    return this.cantidad * this.precio_unitario;
  }
}

export class ClienteVenta {
  constructor({ id, nombre, documento }) {
    this.id = id;
    this.nombre = nombre;
    this.documento = documento;
  }

  get nombreCompleto() {
    return this.documento ? `${this.nombre} — ${this.documento}` : this.nombre;
  }
}

export class ResumenVentas {
  constructor({ total_ventas, ventas_mes, crecimiento }) {
    this.total_ventas = total_ventas || 0;
    this.ventas_mes = ventas_mes || 0;
    this.crecimiento = crecimiento || 0;
  }
}
