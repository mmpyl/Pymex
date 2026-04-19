// backend/src/routes/auth.js — versión consolidada
const router = require('express').Router();
const {
  register, startTrial, login, loginAdmin,
  perfil, bootstrapSuperAdmin
} = require('../controllers/authController');
const { verificarTokenEmpresa, verificarTokenAdmin, revokeToken } = require('../middleware/auth');
const { validateSchema } = require('../middleware/schema');

const authSchema = {
  email:    { required: true, type: 'string', minLength: 5 },
  password: { required: true, type: 'string', minLength: 6 }
};

// ─── Empresas ─────────────────────────────────────────────────────────────────
router.post('/register',
  validateSchema({
    empresa_nombre: { required: true, type: 'string', minLength: 2 },
    empresa_email:  { required: true, type: 'string', minLength: 5 },
    nombre:         { required: true, type: 'string', minLength: 2 },
    ...authSchema
  }),
  register
);

router.post('/start-trial',
  validateSchema({
    empresa_nombre: { required: true, type: 'string', minLength: 2 },
    empresa_email:  { required: true, type: 'string', minLength: 5 },
    nombre:         { required: true, type: 'string', minLength: 2 },
    ...authSchema
  }),
  startTrial
);

router.post('/login', validateSchema(authSchema), login);

router.get('/profile', verificarTokenEmpresa, perfil);

router.post('/logout', verificarTokenEmpresa, async (req, res) => {
  try {
    if (req.usuario?.jti && req.usuario?.exp) {
      await revokeToken(req.usuario.jti, req.usuario.exp * 1000);
    }
    return res.json({ mensaje: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('[Auth] Error en logout:', error.message);
    return res.json({ mensaje: 'Sesión cerrada' });
  }
});

// ─── Panel super admin ────────────────────────────────────────────────────────
router.post('/admin/login', validateSchema(authSchema), loginAdmin);

router.get('/admin/profile', verificarTokenAdmin, (req, res) => res.json(req.admin));

router.post('/admin/logout', verificarTokenAdmin, async (req, res) => {
  try {
    if (req.admin?.jti && req.admin?.exp) {
      await revokeToken(req.admin.jti, req.admin.exp * 1000);
    }
    return res.json({ mensaje: 'Sesión admin cerrada correctamente' });
  } catch (error) {
    console.error('[Auth] Error en logout admin:', error.message);
    return res.json({ mensaje: 'Sesión cerrada' });
  }
});

// Bootstrap: deshabilitado si BOOTSTRAP_DISABLED=true
router.post('/bootstrap-super-admin',
  validateSchema({
    secret:   { required: true, type: 'string', minLength: 8 },
    nombre:   { required: true, type: 'string', minLength: 2 },
    ...authSchema
  }),
  bootstrapSuperAdmin
);

module.exports = router;