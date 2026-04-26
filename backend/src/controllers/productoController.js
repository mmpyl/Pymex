const coreModels = require('../domains/core/models');
const { eventBus } = require('../domains/eventBus');

const { Producto, Categoria } = coreModels;

const listar = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            where: { empresa_id: req.usuario.empresa_id, estado: 'activo' },
            order: [['nombre', 'ASC']]
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crear = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const actualizar = async (req, res) => {
    try {
        const producto = await Producto.findOne({
            where: { id: req.params.id, empresa_id: req.usuario.empresa_id }
        });
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        
        const productoActualizado = await producto.update(req.body);

        // Publicar evento PRODUCT_UPDATED
        eventBus.publish('PRODUCT_UPDATED', {
            producto_id: producto.id,
            empresa_id: req.usuario.empresa_id,
            campos_actualizados: Object.keys(req.body)
        }, 'CORE');

        res.json(productoActualizado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const eliminar = async (req, res) => {
    try {
        const producto = await Producto.findOne({
            where: { id: req.params.id, empresa_id: req.usuario.empresa_id }
        });
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        
        await producto.update({ estado: 'inactivo' }); // borrado lógico

        // Publicar evento PRODUCT_DELETED
        eventBus.publish('PRODUCT_DELETED', {
            producto_id: producto.id,
            empresa_id: req.usuario.empresa_id
        }, 'CORE');

        res.json({ mensaje: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { listar, crear, actualizar, eliminar };