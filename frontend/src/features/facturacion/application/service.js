/**
 * Facturacion Application Services
 * Contiene la lógica de aplicación del dominio Facturacion
 */

import { facturacionRepository } from '../infrastructure/repository.js';

export class FacturacionService {
  constructor() {
    this.repository = facturacionRepository;
  }

  /**
   * Carga todos los datos necesarios para la facturación
   */
  async loadFacturacionData() {
    const [comprobantes, resumen, ventas] = await Promise.all([
      this.repository.getComprobantes(),
      this.repository.getResumen(),
      this.repository.getVentasDisponibles(),
    ]);

    return {
      comprobantes,
      resumen,
      ventas,
    };
  }

  /**
   * Emite un comprobante electrónico
   */
  async emitirComprobante(tipo, ventaId, datos) {
    if (tipo === 'factura') {
      return await this.repository.emitirFactura(ventaId, datos);
    }
    return await this.repository.emitirBoleta(ventaId, datos);
  }

  /**
   * Descarga el PDF de un comprobante
   */
  async descargarPDF(id, tipo) {
    const tiposConPDF = ['factura', 'boleta'];
    if (!tiposConPDF.includes(tipo?.toLowerCase())) {
      throw new Error('PDF no disponible para este tipo de comprobante');
    }
    return await this.repository.descargarPDF(id, tipo);
  }

  /**
   * Obtiene las estadísticas de facturación
   */
  getEstadisticas(resumen) {
    return [
      {
        label: 'Total emitidos',
        valor: resumen.total_emitidos,
        color: 'text-indigo-700 border-indigo-500',
        icono: '🧾',
      },
      {
        label: 'Aceptados',
        valor: resumen.aceptados,
        color: 'text-emerald-700 border-emerald-500',
        icono: '✅',
      },
      {
        label: 'Rechazados',
        valor: resumen.rechazados,
        color: 'text-red-700 border-red-500',
        icono: '❌',
      },
      {
        label: 'Entorno',
        valor: 'Beta SUNAT',
        color: 'text-amber-700 border-amber-500',
        icono: '🔧',
      },
    ];
  }
}

// Instancia singleton
export const facturacionService = new FacturacionService();
