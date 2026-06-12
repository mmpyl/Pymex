/**
 * Facturacion Repository Implementation
 * Implementación del repositorio usando la API REST
 */

import api from '../../../api/axios.js';
import { FacturacionRepository } from '../domain/repository.js';
import { Comprobante, ResumenFacturacion } from '../domain/entities.js';

export class FacturacionAPIRepository extends FacturacionRepository {
  constructor() {
    super();
  }

  async getComprobantes() {
    const response = await api.get('/facturacion/comprobantes');
    return (response.data || []).map((c) => new Comprobante(c));
  }

  async emitirBoleta(ventaId, datos) {
    const response = await api.post(`/facturacion/boleta/${ventaId}`, datos);
    return response.data;
  }

  async emitirFactura(ventaId, datos) {
    const response = await api.post(`/facturacion/factura/${ventaId}`, datos);
    return response.data;
  }

  async descargarPDF(id, tipo) {
    const response = await api.get(`/facturacion/pdf/${id}/${tipo}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async getVentasDisponibles() {
    const response = await api.get('/ventas');
    return response.data || [];
  }

  async getResumen() {
    const comprobantes = await this.getComprobantes();
    return new ResumenFacturacion({
      total_emitidos: comprobantes.length,
      aceptados: comprobantes.filter((c) => c.estado === 'aceptado').length,
      rechazados: comprobantes.filter((c) => c.estado === 'rechazado').length,
      pendientes: comprobantes.filter((c) => c.estado === 'pendiente').length,
    });
  }
}

// Instancia singleton para usar en toda la aplicación
export const facturacionRepository = new FacturacionAPIRepository();
