// backend/src/routes/usuarios.js
// MERGE RESUELTO: combina ambas ramas:
//   - Rama HEAD: CRUD completo de usuarios de empresa con límite max_usuarios
//   - Rama feature: endpoint trial-status
// Resultado: ambas funcionalidades en un solo router coherente.

const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const { verificarToken }  = require('../middleware/auth');
const { verificarRol }    = require('../middleware/roles');
const { checkLimit }      = require('../middleware/featureGate');
const { Usuario, Suscripcion, Plan } = require('../models');

router.use(verificarToken);

// ─── GET /api/usuarios/trial-status ──────────────────────────────────────────
router.get('/trial-status', async (req, res) => {
  try {
    const sub = await Suscripcion.findOne({
      where:   { empresa_id: req.usuario.empresa_id, estado: 'trial' },
      include: [{ model: Plan, attributes: ['nombre', 'codigo'] }],
      order:   [['fecha_inicio', 'DESC']]
    });

    if (!sub) return res.json({ estado: null });

    const hoy           = new Date();
    const expira        = sub.fecha_fin ? new Date(sub.fecha_fin) : null;
    const diasRestantes = expira
      ? Math.max(0, Math.ceil((expira - hoy) / (1000 * 60 * 60 * 24)))
      : null;

    return res.json({
      estado:          'trial',
      dias_restantes:  diasRestantes,
      expira:          expira?.toISOString() || null,
      plan:            sub.Plan?.nombre
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── GET /api/usuarios — listar usuarios de la empresa ───────────────────────
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      where:      { empresa_id: req.usuario.empresa_id },
      attributes: ['id', 'nombre', 'email', 'rol_id', 'estado', 'fecha_registro'],
      order:      [['fecha_registro', 'DESC']]
    });
    return res.json(usuarios);
  } catch (e) { return res.status(500).json({ error: e.message }); }
});

// ─── POST /api/usuarios — crear usuario en la empresa (con límite de plan) ───
router.post(
  '/',
  verificarRol('admin', 'gerente'),
  checkLimit('max_usuarios', async (req) =>
    Usuario.count({ where: { empresa_id: req.usuario.empresa_id, estado: 'activo' } })
  ),
  async (req, res) => {
    try {
      const { nombre, email, password, rol_id } = req.body;
      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'nombre, email y password son obligatorios' });
      }

      const existente = await Usuario.findOne({
        where: { email, empresa_id: req.usuario.empresa_id }
      });
      if (existente) {
        return res.status(409).json({ error: 'Ya existe un usuario con ese email en tu empresa' });
      }

      const hash = await bcrypt.hash(password, 10);
      const usuario = await Usuario.create({
        empresa_id: req.usuario.empresa_id,
        rol_id:     rol_id || 3,
        nombre, email, password: hash, estado: 'activo'
      });

      return res.status(201).json({
        id:     usuario.id,
        nombre: usuario.nombre,
        email:  usuario.email,
        rol_id: usuario.rol_id,
        estado: usuario.estado
      });
    } catch (e) { return res.status(400).json({ error: e.message }); }
  }
);

// ─── PUT /api/usuarios/:id — actualizar usuario ───────────────────────────────
router.put('/:id', verificarRol('admin', 'gerente'), async (req, res) => {
  try {
    const u = await Usuario.findOne({
      where: { id: req.params.id, empresa_id: req.usuario.empresa_id }
    });
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });

    const patch = {};
    if (req.body.nombre)   patch.nombre   = req.body.nombre;
    if (req.body.rol_id)   patch.rol_id   = req.body.rol_id;
    if (req.body.estado)   patch.estado   = req.body.estado;
    if (req.body.password) patch.password = await bcrypt.hash(req.body.password, 10);

    await u.update(patch);
    return res.json({ id: u.id, nombre: u.nombre, email: u.email, rol_id: u.rol_id, estado: u.estado });
  } catch (e) { return res.status(400).json({ error: e.message }); }
});

// ─── DELETE /api/usuarios/:id — desactivar usuario (borrado lógico) ───────────
router.delete('/:id', verificarRol('admin'), async (req, res) => {
  try {
    if (String(req.params.id) === String(req.usuario.id)) {
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
    }

    const u = await Usuario.findOne({
      where: { id: req.params.id, empresa_id: req.usuario.empresa_id }
    });
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
    await u.update({ estado: 'inactivo' });
    return res.json({ mensaje: 'Usuario desactivado' });
  } catch (e) { return res.status(500).json({ error: e.message }); }
});

module.exports = router;
