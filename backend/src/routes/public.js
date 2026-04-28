/**
 * Rutas para API Pública - Dominio BILLING
 * 
 * Endpoints públicos con autenticación por API Key para acceso externo
 * a recursos del dominio de facturación.
 * 
 * @module routes/public
 */

const router = require('express').Router();
const { verificarApiKey } = require('../middleware/apiKey');
const comprobantePublicController = require('../domains/billing/controllers/comprobantePublicController');

// Middleware de autenticación por API Key para todas las rutas públicas
router.use(verificarApiKey);

/**
 * @route GET /api/public/v1/comprobantes
 * @group Public - API Pública con autenticación por API Key
 * @param {string} x-api-key.header.required - API Key de autenticación
 * @param {number} limit.query - Límite de registros (default: 50, max: 200)
 * @param {string} order.query - Ordenamiento ASC o DESC (default: DESC)
 * @returns {object} 200 - Lista de comprobantes
 * @returns {Error} 401 - API key requerida
 * @returns {Error} 403 - API key inválida o inactiva
 * @returns {Error} 500 - Error interno del servidor
 * @security ApiKey
 */
router.get('/v1/comprobantes', 
  comprobantePublicController.listarComprobantes.bind(comprobantePublicController)
);

/**
 * @route GET /api/public/v1/comprobantes/:id
 * @group Public - API Pública con autenticación por API Key
 * @param {string} x-api-key.header.required - API Key de autenticación
 * @param {number} id.path.required - ID del comprobante
 * @returns {object} 200 - Comprobante encontrado
 * @returns {Error} 401 - API key requerida
 * @returns {Error} 403 - API key inválida o inactiva
 * @returns {Error} 404 - Comprobante no encontrado
 * @returns {Error} 500 - Error interno del servidor
 * @security ApiKey
 */
router.get('/v1/comprobantes/:id', 
  comprobantePublicController.obtenerComprobante.bind(comprobantePublicController)
);

module.exports = router;
