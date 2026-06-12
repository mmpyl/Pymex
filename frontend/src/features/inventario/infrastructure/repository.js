/**
 * Inventario Repository Implementation
 * Implementación del repositorio usando la API REST
 */

import api from '../../../api/axios.js';
import { InventarioRepository } from '../domain/repository.js';
import { ProductoInventario, MovimientoInventario } from '../domain/entities.js';

export class InventarioAPIRepository extends InventarioRepository {
  constructor() {
    super();
  }

  async getProductos() {
    const response = await api.get('/inventario');
    return response.data.map((p) => new ProductoInventario(p));
  }

  async getHistorial() {
    const response = await api.get('/inventario/historial');
    return response.data.map((m) => new MovimientoInventario(m));
  }

  async registrarMovimiento(movimiento) {
    const response = await api.post('/inventario/movimiento', movimiento);
    return response.data;
  }

  async getProductosBajoStock() {
    const productos = await this.getProductos();
    return productos.filter((p) => p.estaBajoStock);
  }
}

// Instancia singleton para usar en toda la aplicación
export const inventarioRepository = new InventarioAPIRepository();
