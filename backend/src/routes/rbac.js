const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { verificarToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/roles');
const authModels = require('../domains/auth/models');

const { Usuario, Rol, Permiso, RolPermiso } = authModels;

router.use(verificarToken);

router.get('/roles', checkPermission('usuarios_gestionar'), async (req, res) => {
  try {
    const roles = await Rol.findAll({
      include: [{ model: Permiso, attributes: ['id', 'nombre', 'codigo'], through: { attributes: [] } }],
      order: [['id', 'ASC']]
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/permisos', checkPermission('usuarios_gestionar'), async (req, res) => {
  try {
    const permisos = await Permiso.findAll({ order: [['codigo', 'ASC']] });
    res.json(permisos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/roles/:rolId/permisos', checkPermission('usuarios_gestionar'), async (req, res) => {
  try {
    const rolId = Number(req.params.rolId);
    const permisos = Array.isArray(req.body.permisos) ? req.body.permisos.map(Number) : [];

    const rol = await Rol.findByPk(rolId);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });

    await RolPermiso.destroy({ where: { rol_id: rolId } });
    if (permisos.length) {
      await RolPermiso.bulkCreate(permisos.map((permisoId) => ({ rol_id: rolId, permiso_id: permisoId })));
    }

    // Publicar evento para invalidar caché de roles
    const eventBus = require('../domains/eventBus');
    eventBus.publish('ROLE_CHANGED', { 
      rol_id: rolId, 
      empresa_id: req.usuario.empresa_id,
      permisos_actualizados: permisos 
    }, 'rbac');

    res.json({ mensaje: 'Permisos del rol actualizados', rol_id: rolId, permisos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/usuarios', checkPermission('usuarios_gestionar'), async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      where: { empresa_id: req.usuario.empresa_id },
      attributes: ['id', 'empresa_id', 'rol_id', 'nombre', 'email', 'estado', 'fecha_registro'],
      include: [{ model: Rol, attributes: ['id', 'nombre'] }],
      order: [['id', 'ASC']]
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/usuarios', checkPermission('usuarios_gestionar'), async (req, res) => {
  try {
    const { nombre, email, password, rol_id } = req.body;
    if (!nombre || !email || !password || !rol_id) {
      return res.status(400).json({ error: 'nombre, email, password y rol_id son obligatorios' });
    }

    const existe = await Usuario.findOne({ where: { empresa_id: req.usuario.empresa_id, email } });
    if (existe) return res.status(409).json({ error: 'Ya existe un usuario con ese email en la empresa' });

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({
      empresa_id: req.usuario.empresa_id,
      rol_id,
      nombre,
      email,
      password: passwordHash,
      estado: 'activo'
    });

    res.status(201).json({
      id: usuario.id,
      empresa_id: usuario.empresa_id,
      rol_id: usuario.rol_id,
      nombre: usuario.nombre,
      email: usuario.email,
      estado: usuario.estado
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/usuarios/:id/rol', checkPermission('usuarios_gestionar'), async (req, res) => {
  try {
    const usuario = await Usuario.findOne({
      where: { id: Number(req.params.id), empresa_id: req.usuario.empresa_id }
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { rol_id } = req.body;
    if (!rol_id) return res.status(400).json({ error: 'rol_id es obligatorio' });

    usuario.rol_id = rol_id;
    await usuario.save();

    // Publicar evento para invalidar caché de roles cuando cambia el rol de un usuario
    const eventBus = require('../domains/eventBus');
    eventBus.publish('USER_ROLE_UPDATED', { 
      usuario_id: usuario.id, 
      empresa_id: req.usuario.empresa_id,
      nuevo_rol_id: rol_id 
    }, 'rbac');

    res.json({ mensaje: 'Rol actualizado', usuario_id: usuario.id, rol_id: usuario.rol_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
