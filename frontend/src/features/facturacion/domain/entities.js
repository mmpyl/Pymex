/**
 * Facturacion Domain Entities
 * Representa las entidades del dominio Facturacion
 */

export class Comprobante {
  constructor({ id, numero, tipo, cliente_nombre, cliente_documento, total, estado, fecha, sunat_descripcion }) {
    this.id = id;
    this.numero = numero || '';
    this.tipo = tipo || 'boleta';
    this.cliente_nombre = cliente_nombre || '';
    this.cliente_documento = cliente_documento || '';
    this.total = parseFloat(total) || 0;
    this.estado = estado || 'pendiente'; // aceptado, rechazado, pendiente
    this.fecha = fecha || new Date().toISOString();
    this.sunat_descripcion = sunat_descripcion || '';
  }

  get totalFormateado() {
    return new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2 }).format(this.total);
  }

  static getEstadoConfig(estado) {
    const config = {
      aceptado: { color: 'text-emerald-700', bg: 'bg-emerald-100', label: '✅ Aceptado' },
      rechazado: { color: 'text-red-700', bg: 'bg-red-100', label: '❌ Rechazado' },
      pendiente: { color: 'text-amber-700', bg: 'bg-amber-100', label: '⏳ Pendiente' },
    };
    return config[estado] || { color: 'text-slate-700', bg: 'bg-slate-100', label: estado };
  }

  static getTiposConPDF() {
    return ['factura', 'boleta'];
  }
}

export class ResumenFacturacion {
  constructor({ total_emitidos, aceptados, rechazados, pendientes }) {
    this.total_emitidos = total_emitidos || 0;
    this.aceptados = aceptados || 0;
    this.rechazados = rechazados || 0;
    this.pendientes = pendientes || 0;
  }
}
