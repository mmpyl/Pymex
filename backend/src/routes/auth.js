// backend/src/routes/auth.js — versión consolidada
const router = require('express').Router();
const { check } = require('express-validator');
const {
  register, startTrial, login, loginAdmin,
  perfil, bootstrapSuperAdmin
} = require('../controllers/authController');
const { verificarTokenEmpresa, verificarTokenAdmin, revokeToken } = require('../middleware/auth');
const { validateSchema } = require('../middleware/schema');
const { validate } = require('../middleware/validation');

// Reglas de validación reutilizables
const emailValido = check('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Email inválido');

const passwordValido = check('password')
  .isLength({ min: 6 })
  .trim()
  .escape()
  .withMessage('La contraseña debe tener al menos 6 caracteres');

const nombreValido = check('nombre')
  .trim()
  .escape()
  .isLength({ min: 2, max: 100 })
  .withMessage('El nombre debe tener entre 2 y 100 caracteres');

const empresaNombreValido = check('empresa_nombre')
  .trim()
  .escape()
  .isLength({ min: 2, max: 150 })
  .withMessage('El nombre de la empresa debe tener entre 2 y 150 caracteres');

const empresaEmailValido = check('empresa_email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Email de empresa inválido');

const authRules = [emailValido, passwordValido];

// ─── Empresas ─────────────────────────────────────────────────────────────────
router.post('/register',
  validate([empresaNombreValido, empresaEmailValido, nombreValido, ...authRules]),
  register
);

router.post('/start-trial',
  validate([empresaNombreValido, empresaEmailValido, nombreValido, ...authRules]),
  startTrial
);

router.post('/login', validate(authRules), login);

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
router.post('/admin/login', validate(authRules), loginAdmin);

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
  validate([
    check('secret')
      .isLength({ min: 8 })
      .trim()
      .withMessage('El secret debe tener al menos 8 caracteres'),
    nombreValido,
    ...authRules
  ]),
  bootstrapSuperAdmin
);

module.exports = router;