// backend/src/routes/auth.js — versión consolidada
const router = require('express').Router();
const { check } = require('express-validator');
const {
  register, startTrial, login, loginAdmin,
  perfil, refreshToken, bootstrapSuperAdmin
} = require('../controllers/authController');
const { verificarTokenEmpresa, verificarTokenAdmin, revokeToken } = require('../middleware/auth');
const { validateSchema } = require('../middleware/schema');
const { validate } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y autorización de usuarios
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar una nueva empresa y usuario administrador
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - empresa_nombre
 *               - empresa_email
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               empresa_nombre:
 *                 type: string
 *                 example: "Mi Empresa S.A."
 *               empresa_email:
 *                 type: string
 *                 format: email
 *                 example: "contacto@miempresa.com"
 *               nombre:
 *                 type: string
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@miempresa.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Empresa y usuario registrados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Empresa y usuario creados exitosamente"
 *                 token:
 *                   type: string
 *                   description: Token JWT de autenticación
 *       400:
 *         description: Error en validación de datos
 *       409:
 *         description: Email ya registrado
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@miempresa.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT de autenticación
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Credenciales inválidas
 */

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión de usuario
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Sesión cerrada correctamente"
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Iniciar sesión como administrador
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@sapyme.com"
 *               password:
 *                 type: string
 *                 example: "adminpass123"
 *     responses:
 *       200:
 *         description: Login de administrador exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT de administrador
 *       401:
 *         description: Credenciales inválidas
 */

/**
 * @swagger
 * /auth/admin/profile:
 *   get:
 *     summary: Obtener perfil del administrador autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del administrador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "admin@sapyme.com"
 *                 rol:
 *                   type: string
 *                   example: "super_admin"
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /auth/bootstrap-super-admin:
 *   post:
 *     summary: Crear el primer super administrador (solo desarrollo)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - secret
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               secret:
 *                 type: string
 *                 description: Secret de configuración para bootstrap
 *                 example: "my-secret-key"
 *               nombre:
 *                 type: string
 *                 example: "Super Admin"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "superadmin@sapyme.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Super administrador creado exitosamente
 *       400:
 *         description: Error en validación o secret inválido
 *       403:
 *         description: Bootstrap deshabilitado en producción
 */

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

const refreshTokenValido = check('refreshToken')
  .isLength({ min: 128, max: 128 }) // 64 bytes hex = 128 caracteres
  .trim()
  .withMessage('Refresh token inválido');

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

// ─── Refresh Token ────────────────────────────────────────────────────────────
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Obtener nuevo access token usando refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "a1b2c3d4e5f6..."
 *     responses:
 *       200:
 *         description: Nuevo access token generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Nuevo access token JWT
 *                 refreshToken:
 *                   type: string
 *                   description: Nuevo refresh token (rotación)
 *                 tokenExpiresIn:
 *                   type: string
 *                   description: Tiempo de expiración del access token
 *                 refreshTokenExpiresAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de expiración del refresh token
 *       401:
 *         description: Refresh token inválido o expirado
 */
router.post('/refresh', validate([refreshTokenValido]), refreshToken);

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