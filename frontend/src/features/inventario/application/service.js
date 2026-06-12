/**
 * Inventario Application Services
 * Contiene la lógica de aplicación del dominio Inventario
 */

import { inventarioRepository } from '../infrastructure/repository.js';

export class InventarioService {
  constructor() {
    this.repository = inventarioRepository;
  }

  /**
   * Carga todos los datos necesarios para el inventario
   */
  async loadInventarioData() {
    const [productos, historial] = await Promise.all([
      this.repository.getProductos(),
      this.repository.getHistorial(),
    ]);

    const productosBajoStock = productos.filter((p) => p.estaBajoStock);
    const movimientosHoy = historial.filter(
      (m) => new Date(m.fecha).toDateString() === new Date().toDateString()
    ).length;

    return {
      productos,
      historial,
      resumen: {
        total_productos: productos.length,
        stock_bajo: productosBajoStock.length,
        movimientos_hoy: movimientosHoy,
      },
      productosBajoStock,
    };
  }

  /**
   * Registra un nuevo movimiento de inventario
   */
  async registrarMovimiento(data) {
    const result = await this.repository.registrarMovimiento(data);
    return result;
  }

  /**
   * Obtiene las estadísticas del inventario
   */
  getEstadisticas(productos, historial) {
    const productosBajoStock = productos.filter((p) => p.estaBajoStock);
    const movimientosHoy = historial.filter(
      (m) => new Date(m.fecha).toDateString() === new Date().toDateString()
    ).length;

    return [
      {
        label: 'Total productos',
        valor: productos.length,
        color: 'text-indigo-700',
        border: 'border-indigo-500',
        icono: '📦',
      },
      {
        label: 'Stock bajo',
        valor: productosBajoStock.length,
        color: 'text-red-700',
        border: 'border-red-500',
        icono: '⚠️',
      },
      {
        label: 'Movimientos hoy',
        valor: movimientosHoy,
        color: 'text-emerald-700',
        border: 'border-emerald-500',
        icono: '🔄',
      },
    ];
  }
}

// Instancia singleton
export const inventarioService = new InventarioService();
