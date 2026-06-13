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
 * /auth/register-empresa:
 *   post:
 *     summary: Registrar una nueva empresa y usuario business (administrador de la empresa)
 *     tags: [Auth]
 *     description: Registra una empresa en el sistema y crea un usuario business con rol admin para esa empresa
 */
router.post('/register-empresa',
  [
    check('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
    check('email').isEmail().withMessage('Email inválido'),
    check('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres')
  ],
  validate,
  authController.registerEmpresa
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
 * /auth/login-empresa:
 *   post:
 *     summary: Login de usuario business (usuario de empresa)
 *     tags: [Auth]
 *     description: Autentica un usuario business perteneciente a una empresa
 */
router.post('/login-empresa',
  [
    check('email').isEmail().withMessage('Email inválido'),
    check('password').notEmpty().withMessage('Password es requerido')
  ],
  validate,
  authController.loginEmpresa
);

/**
 * @swagger
 * /auth/login-admin:
 *   post:
 *     summary: Login de administrador del multitennant
 *     tags: [Auth]
 *     description: Autentica un administrador del sistema multitennant (no pertenece a ninguna empresa)
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
