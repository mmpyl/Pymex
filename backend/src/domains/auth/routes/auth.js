/**
 * Rutas del Dominio AUTH para Autenticación
 */

const router = require('express').Router();
const { check } = require('express-validator');
const { validateSchema } = require('../../../middleware/schema');
const { validate } = require('../../../middleware/validation');

// Controladores del dominio
const authController = require('../controllers/authController');

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
 */
router.post('/register',
  [
    check('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
    check('email').isEmail().withMessage('Email inválido'),
    check('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres')
  ],
  validate,
  authController.register
);

/**
 * @swagger
 * /auth/start-trial:
 *   post:
 *     summary: Iniciar trial de una nueva empresa
 *     tags: [Auth]
 */
router.post('/start-trial',
  [
    check('empresa_nombre').trim().notEmpty().withMessage('Nombre de la empresa es requerido'),
    check('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
    check('email').isEmail().withMessage('Email inválido'),
    check('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres')
  ],
  validate,
  authController.startTrial
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login de usuario de empresa
 *     tags: [Auth]
 */
router.post('/login',
  [
    check('email').isEmail().withMessage('Email inválido'),
    check('password').notEmpty().withMessage('Password es requerido')
  ],
  validate,
  authController.login
);

/**
 * @swagger
 * /auth/login-admin:
 *   post:
 *     summary: Login de administrador
 *     tags: [Auth]
 */
router.post('/login-admin',
  [
    check('email').isEmail().withMessage('Email inválido'),
    check('password').notEmpty().withMessage('Password es requerido')
  ],
  validate,
  authController.loginAdmin
);

/**
 * @swagger
 * /auth/perfil:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Auth]
 */
router.get('/perfil', authController.perfil);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refrescar token de acceso
 *     tags: [Auth]
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /auth/bootstrap-super-admin:
 *   post:
 *     summary: Bootstrap de super admin (solo desarrollo)
 *     tags: [Auth]
 */
router.post('/bootstrap-super-admin', authController.bootstrapSuperAdmin);

module.exports = router;
