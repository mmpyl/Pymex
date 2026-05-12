/**
 * Servicio para gestión de productos del dominio CORE
 */

const coreModels = require('../models');
const { eventBus } = require('../../eventBus');

const { Producto, Categoria, sequelize } = coreModels;
const { Op } = require('sequelize');

class ProductoService {
  /**
   * Listar productos con filtros y paginación
   */
  async listar(empresa_id, filters = {}) {
    const { categoria_id, activo, search, page = 1, limit = 20 } = filters;
    
    const where = { empresa_id };
    
    if (categoria_id) {
      where.categoria_id = categoria_id;
    }
    
    if (activo !== undefined) {
      where.estado = activo ? 'activo' : 'inactivo';
    } else {
      where.estado = 'activo';
    }
    
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { descripcion: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Producto.findAndCountAll({
      where,
      include: [{ model: Categoria, attributes: ['id', 'nombre'] }],
      order: [['nombre', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    return {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      rows
    };
  }

  /**
   * Crear un nuevo producto
   */
  async crear(data, empresa_id) {
    const producto = await Producto.create({
      ...data,
      empresa_id
    });

    // Publicar evento PRODUCT_CREATED
    eventBus.publish('PRODUCT_CREATED', {
      producto_id: producto.id,
      empresa_id,
      nombre: producto.nombre,
      categoria_id: producto.categoria_id
    }, 'CORE');

    return producto;
  }

  /**
   * Actualizar producto existente
   */
  async actualizar(id, data, empresa_id) {
    const producto = await Producto.findOne({
      where: { id, empresa_id }
    });
    
    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    const productoActualizado = await producto.update(data);

    // Publicar evento PRODUCT_UPDATED
    eventBus.publish('PRODUCT_UPDATED', {
      producto_id: producto.id,
      empresa_id,
      campos_actualizados: Object.keys(data)
    }, 'CORE');

    return productoActualizado;
  }

  /**
   * Eliminar producto (lógico)
   */
  async eliminar(id, empresa_id) {
    const producto = await Producto.findOne({
      where: { id, empresa_id }
    });
    
    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    await producto.update({ estado: 'inactivo' });

    // Publicar evento PRODUCT_DELETED
    eventBus.publish('PRODUCT_DELETED', {
      producto_id: producto.id,
      empresa_id
    }, 'CORE');

    return { mensaje: 'Producto eliminado' };
  }

  /**
   * Verificar stock de un producto
   */
  async verificarStock(producto_id, cantidad, empresa_id) {
    const producto = await Producto.findOne({
      where: { id: producto_id, empresa_id }
    });
    
    if (!producto) {
      throw new Error('Producto no encontrado');
    }
    
    return {
      disponible: producto.stock >= cantidad,
      stock_actual: producto.stock,
      stock_minimo: producto.stock_minimo
    };
  }

  /**
   * Obtener productos con stock bajo
   */
  async obtenerStockBajo(empresa_id) {
    return await Producto.findAll({
      where: {
        empresa_id,
        estado: 'activo',
        stock: { [Op.lte]: sequelize.col('stock_minimo') }
      }
    });
  }
}

module.exports = new ProductoService();
