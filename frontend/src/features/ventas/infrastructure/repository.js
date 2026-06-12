/**
 * Ventas Repository Implementation
 */

import api from '../../../api/axios';
import { VentasRepository } from '../domain/repository.js';
import { Venta, ItemVenta, ClienteVenta } from '../domain/entities.js';

export class VentasAPIRepository extends VentasRepository {
  async getAll() {
    const response = await api.get('/ventas');
    return response.data.map((v) => new Venta(v));
  }

  async getById(id) {
    const response = await api.get(`/ventas/${id}`);
    return new Venta(response.data);
  }

  async create(ventaData) {
    const response = await api.post('/ventas', ventaData);
    return new Venta(response.data);
  }

  async getProductos() {
    const response = await api.get('/productos');
    return response.data;
  }

  async getClientes() {
    const response = await api.get('/clientes');
    return response.data.map((c) => new ClienteVenta(c));
  }
}

// Instancia singleton
export const ventasRepository = new VentasAPIRepository();
