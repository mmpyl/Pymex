const coreModels = require('../domains/core/models');
const { eventBus } = require('../domains/eventBus');
const { asyncHandler, NotFoundError } = require('../middleware/errorHandler');

const { Producto, Categoria } = coreModels;

const listar = asyncHandler(async (req, res) => {
    const productos = await Producto.findAll({
        where: { empresa_id: req.usuario.empresa_id, estado: 'activo' },
        order: [['nombre', 'ASC']]
    });
    res.json(productos);
});

const crear = asyncHandler(async (req, res) => {
    const producto = await Producto.create({
        ...req.body,
        empresa_id: req.usuario.empresa_id // siempre del token, nunca del body
    });

    // Publicar evento PRODUCT_CREATED
    eventBus.publish('PRODUCT_CREATED', {
        producto_id: producto.id,
        empresa_id: req.usuario.empresa_id,
        nombre: producto.nombre,
        categoria_id: producto.categoria_id
    }, 'CORE');

    res.status(201).json(producto);
});

const actualizar = asyncHandler(async (req, res) => {
    const producto = await Producto.findOne({
        where: { id: req.params.id, empresa_id: req.usuario.empresa_id }
    });
    if (!producto) {
        throw new NotFoundError('Producto no encontrado');
    }
    
    const productoActualizado = await producto.update(req.body);

    // Publicar evento PRODUCT_UPDATED
    eventBus.publish('PRODUCT_UPDATED', {
        producto_id: producto.id,
        empresa_id: req.usuario.empresa_id,
        campos_actualizados: Object.keys(req.body)
    }, 'CORE');

    res.json(productoActualizado);
});

const eliminar = asyncHandler(async (req, res) => {
    const producto = await Producto.findOne({
        where: { id: req.params.id, empresa_id: req.usuario.empresa_id }
    });
    if (!producto) {
        throw new NotFoundError('Producto no encontrado');
    }
    
    await producto.update({ estado: 'inactivo' }); // borrado lógico

    // Publicar evento PRODUCT_DELETED
    eventBus.publish('PRODUCT_DELETED', {
        producto_id: producto.id,
        empresa_id: req.usuario.empresa_id
    }, 'CORE');

    res.json({ mensaje: 'Producto eliminado' });
});

module.exports = { listar, crear, actualizar, eliminar };