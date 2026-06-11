/**
 * Controlador de Productos - Versión TypeScript
 * Maneja las operaciones CRUD para productos con tipado fuerte
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { Producto, CrearProductoDTO, ActualizarProductoDTO, FiltrosProductos } from '../types/producto';
import { ApiResponse, PaginationResult, UsuarioAutenticado } from '../interfaces/common';
import { eventBus } from '../domains/eventBus';
import coreModels from '../domains/core/models';

const { Producto: ProductoModel } = coreModels;

// Extender Request con usuario tipado
interface ProductoRequest extends Request {
  usuario: UsuarioAutenticado;
  body: CrearProductoDTO | ActualizarProductoDTO;
  params: { id: string };
  query: Partial<FiltrosProductos>;
}

/**
 * Listar todos los productos de la empresa
 * GET /api/productos
 */
const listar = asyncHandler(async (req: ProductoRequest, res: Response<ApiResponse<Producto[]>>) => {
  const empresa_id = req.usuario.empresa_id;
  
  const productos = await ProductoModel.findAll({
    where: { 
      empresa_id, 
      estado: 'activo' 
    },
    order: [['nombre', 'ASC']],
    include: [
      {
        association: 'categoria',
        attributes: ['id', 'nombre']
      },
      {
        association: 'proveedor',
        attributes: ['id', 'nombre']
      }
    ]
  });

  const response: ApiResponse<Producto[]> = {
    success: true,
    data: productos,
    message: 'Productos listados exitosamente'
  };

  res.json(response);
});

/**
 * Obtener un producto por ID
 * GET /api/productos/:id
 */
const obtenerPorId = asyncHandler(async (req: ProductoRequest, res: Response<ApiResponse<Producto>>) => {
  const { id } = req.params;
  const empresa_id = req.usuario.empresa_id;

  const producto = await ProductoModel.findOne({
    where: { id, empresa_id },
    include: [
      {
        association: 'categoria',
        attributes: ['id', 'nombre']
      },
      {
        association: 'proveedor',
        attributes: ['id', 'nombre']
      }
    ]
  });

  if (!producto) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    });
  }

  const response: ApiResponse<Producto> = {
    success: true,
    data: producto
  };

  res.json(response);
});

/**
 * Crear un nuevo producto
 * POST /api/productos
 */
const crear = asyncHandler(async (req: ProductoRequest, res: Response<ApiResponse<Producto>>) => {
  const empresa_id = req.usuario.empresa_id;
  const datosProducto: CrearProductoDTO = req.body;

  // Validaciones básicas
  if (!datosProducto.nombre || !datosProducto.precio_venta) {
    return res.status(400).json({
      success: false,
      message: 'Nombre y precio de venta son requeridos',
      errors: [
        { field: 'nombre', message: 'El nombre es requerido' },
        { field: 'precio_venta', message: 'El precio de venta es requerido' }
      ]
    });
  }

  const producto = await ProductoModel.create({
    ...datosProducto,
    empresa_id,
    stock_actual: datosProducto.stock_minimo ? datosProducto.stock_minimo : 0,
    unidad_medida: datosProducto.unidad_medida || 'unidad',
    estado: 'activo'
  });

  // Publicar evento PRODUCT_CREATED
  eventBus.publish('PRODUCT_CREATED', {
    producto_id: producto.id,
    empresa_id,
    nombre: producto.nombre,
    categoria_id: producto.categoria_id,
    timestamp: new Date().toISOString()
  }, 'CORE');

  const response: ApiResponse<Producto> = {
    success: true,
    data: producto,
    message: 'Producto creado exitosamente'
  };

  res.status(201).json(response);
});

/**
 * Actualizar un producto existente
 * PUT /api/productos/:id
 */
const actualizar = asyncHandler(async (req: ProductoRequest, res: Response<ApiResponse<Producto>>) => {
  const { id } = req.params;
  const empresa_id = req.usuario.empresa_id;
  const datosActualizar: ActualizarProductoDTO = req.body;

  const producto = await ProductoModel.findOne({
    where: { id, empresa_id }
  });

  if (!producto) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    });
  }

  const camposActualizados = Object.keys(datosActualizar);
  const productoActualizado = await producto.update(datosActualizar);

  // Publicar evento PRODUCT_UPDATED
  eventBus.publish('PRODUCT_UPDATED', {
    producto_id: producto.id,
    empresa_id,
    campos_actualizados: camposActualizados,
    timestamp: new Date().toISOString()
  }, 'CORE');

  const response: ApiResponse<Producto> = {
    success: true,
    data: productoActualizado,
    message: 'Producto actualizado exitosamente'
  };

  res.json(response);
});

/**
 * Eliminar un producto (borrado lógico)
 * DELETE /api/productos/:id
 */
const eliminar = asyncHandler(async (req: ProductoRequest, res: Response<ApiResponse<{ mensaje: string }>>) => {
  const { id } = req.params;
  const empresa_id = req.usuario.empresa_id;

  const producto = await ProductoModel.findOne({
    where: { id, empresa_id }
  });

  if (!producto) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    });
  }

  // Borrado lógico: cambiar estado a inactivo
  await producto.update({ estado: 'inactivo' });

  // Publicar evento PRODUCT_DELETED
  eventBus.publish('PRODUCT_DELETED', {
    producto_id: producto.id,
    empresa_id,
    timestamp: new Date().toISOString()
  }, 'CORE');

  const response: ApiResponse<{ mensaje: string }> = {
    success: true,
    data: { mensaje: 'Producto eliminado exitosamente' },
    message: 'Producto dado de baja correctamente'
  };

  res.json(response);
});

/**
 * Buscar productos con filtros avanzados
 * GET /api/productos/buscar
 */
const buscar = asyncHandler(async (req: ProductoRequest, res: Response<ApiResponse<PaginationResult<Producto>>>) => {
  const { 
    categoria_id, 
    proveedor_id, 
    busqueda, 
    stock_bajo, 
    sin_stock,
    page = 1,
    limit = 20,
    sortBy = 'nombre',
    order = 'ASC'
  } = req.query;

  const empresa_id = req.usuario.empresa_id;
  const where: any = { empresa_id, estado: 'activo' };

  // Aplicar filtros
  if (categoria_id) where.categoria_id = categoria_id;
  if (proveedor_id) where.proveedor_id = proveedor_id;
  if (busqueda) {
    where.nombre = { [require('sequelize').Op.iLike]: `%${busqueda}%` };
  }
  if (stock_bajo) {
    where.stock_actual = { [require('sequelize').Op.lt]: where.stock_minimo || 10 };
  }
  if (sin_stock) {
    where.stock_actual = 0;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await ProductoModel.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [[sortBy as string, order as 'ASC' | 'DESC']],
    include: [
      {
        association: 'categoria',
        attributes: ['id', 'nombre']
      },
      {
        association: 'proveedor',
        attributes: ['id', 'nombre']
      }
    ]
  });

  const totalPages = Math.ceil(count / Number(limit));

  const response: ApiResponse<PaginationResult<Producto>> = {
    success: true,
    data: {
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    },
    message: 'Búsqueda completada exitosamente'
  };

  res.json(response);
});

export {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  buscar
};
