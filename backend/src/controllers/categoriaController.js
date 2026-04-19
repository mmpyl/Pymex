const { Categoria } = require('../models');

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
