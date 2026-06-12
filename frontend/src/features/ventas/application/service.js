/**
 * Ventas Application Services
 */

import { ventasRepository } from '../infrastructure/repository.js';
import { Venta, ItemVenta } from '../domain/entities.js';

export class VentasService {
  constructor() {
    this.repository = ventasRepository;
  }

  /**
   * Carga todos los datos necesarios para la página de ventas
   */
  async loadVentasData() {
    const [ventas, productos, clientes] = await Promise.all([
      this.repository.getAll(),
      this.repository.getProductos(),
      this.repository.getClientes(),
    ]);

    return { ventas, productos, clientes };
  }

  /**
   * Registra una nueva venta
   */
  async registrarVenta({ cliente_id, metodo_pago, items }) {
    // Validar que haya productos seleccionados
    if (!items || items.length === 0 || items.some((i) => !i.producto_id)) {
      throw new Error('Debe seleccionar al menos un producto');
    }

    const ventaData = {
      cliente_id: cliente_id || null,
      metodo_pago,
      items: items.map((i) => ({
        producto_id: parseInt(i.producto_id),
        cantidad: Number(i.cantidad),
        precio_unitario: parseFloat(i.precio_unitario),
      })),
    };

    return await this.repository.create(ventaData);
  }

  /**
   * Calcula el total de una lista de items
   */
  calcularTotal(items) {
    return items.reduce((sum, i) => sum + (i.cantidad * parseFloat(i.precio_unitario || 0)), 0);
  }

  /**
   * Filtra ventas por término de búsqueda
   */
  filtrarVentas(ventas, search) {
    if (!search) return ventas;
    const q = search.toLowerCase();
    return ventas.filter((v) =>
      v.Cliente?.nombre?.toLowerCase().includes(q) ||
      String(v.id).includes(q) ||
      v.metodo_pago?.toLowerCase().includes(q)
    );
  }

  /**
   * Calcula el total de ventas del mes actual
   */
  calcularTotalMes(ventas) {
    const mesActual = new Date().getMonth();
    return ventas
      .filter((v) => new Date(v.fecha).getMonth() === mesActual)
      .reduce((sum, v) => sum + parseFloat(v.total || 0), 0);
  }
}

// Instancia singleton
export const ventasService = new VentasService();
