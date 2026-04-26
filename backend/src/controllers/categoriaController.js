const coreModels = require('../domains/core/models');
const eventBus = require('../domains/eventBus');

const { Categoria } = coreModels;

const listar = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      where: { empresa_id: req.usuario.empresa_id },
      order: [['nombre', 'ASC']]
    });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const categoria = await Categoria.create({
      ...req.body,
      empresa_id: req.usuario.empresa_id
    });
    
    // Publicar evento para otros dominios
    eventBus.publish('CATEGORY_CREATED', {
      categoriaId: categoria.id,
      empresa_id: categoria.empresa_id,
      nombre: categoria.nombre,
      timestamp: new Date()
    }, 'CORE');
    
    res.status(201).json(categoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const categoria = await Categoria.findOne({
      where: { id: req.params.id, empresa_id: req.usuario.empresa_id }
    });
    if (!categoria) return res.status(404).json({ error: 'Categoria no encontrada' });
    await categoria.destroy();
    res.json({ mensaje: 'Categoria eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { listar, crear, eliminar };
