const coreModels = require('../domains/core/models');
const eventBus = require('../domains/eventBus');

const { Proveedor } = coreModels;

const listar = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({
      where: { empresa_id: req.usuario.empresa_id },
      order: [['nombre', 'ASC']]
    });
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const proveedor = await Proveedor.create({
      ...req.body,
      empresa_id: req.usuario.empresa_id
    });

    // Publicar evento para otros dominios
    eventBus.publish('SUPPLIER_CREATED', {
      proveedorId: proveedor.id,
      empresa_id: proveedor.empresa_id,
      nombre: proveedor.nombre,
      timestamp: new Date()
    }, 'CORE');

    res.status(201).json(proveedor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({
      where: { id: req.params.id, empresa_id: req.usuario.empresa_id }
    });
    if (!proveedor) {return res.status(404).json({ error: 'Proveedor no encontrado' });}
    await proveedor.update(req.body);
    res.json(proveedor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({
      where: { id: req.params.id, empresa_id: req.usuario.empresa_id }
    });
    if (!proveedor) {return res.status(404).json({ error: 'Proveedor no encontrado' });}
    await proveedor.destroy();
    res.json({ mensaje: 'Proveedor eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { listar, crear, actualizar, eliminar };
