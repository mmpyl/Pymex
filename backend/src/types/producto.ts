/**
 * Tipos y modelos de dominio para Productos
 */

import { AuditoriaBase, FiltrosBase } from './common';

// Modelo de Producto
export interface Producto extends AuditoriaBase {
  id: number;
  empresa_id: number;
  categoria_id?: number;
  nombre: string;
  descripcion?: string;
  sku?: string;
  codigo_barras?: string;
  precio_costo: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo?: number;
  unidad_medida: string;
  estado: 'activo' | 'inactivo';
  imagen_url?: string;
  proveedor_id?: number;
}

// DTO para crear producto
export interface CrearProductoDTO {
  nombre: string;
  descripcion?: string;
  sku?: string;
  codigo_barras?: string;
  precio_costo: number;
  precio_venta: number;
  stock_minimo?: number;
  unidad_medida?: string;
  categoria_id?: number;
  proveedor_id?: number;
}

// DTO para actualizar producto
export interface ActualizarProductoDTO extends Partial<CrearProductoDTO> {
  stock_actual?: number;
  estado?: 'activo' | 'inactivo';
}

// Filtros para productos
export interface FiltrosProductos extends FiltrosBase {
  categoria_id?: number;
  proveedor_id?: number;
  busqueda?: string;
  stock_bajo?: boolean;
  sin_stock?: boolean;
}

// Producto con relaciones
export interface ProductoConRelaciones extends Producto {
  categoria?: {
    id: number;
    nombre: string;
  };
  proveedor?: {
    id: number;
    nombre: string;
  };
}
