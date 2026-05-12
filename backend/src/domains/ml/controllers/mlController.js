/**
 * ML Controller
 * 
 * Controlador del dominio ML (Machine Learning).
 * Maneja las peticiones HTTP relacionadas con predicciones y modelos ML.
 * 
 * Responsabilidades:
 * - Recibir y validar requests HTTP
 * - Delegar lógica de negocio al servicio ML
 * - Formatear respuestas HTTP
 * - Manejar errores específicos de controlador
 */

const logger = require('../../../utils/logger');

class MLController {
  constructor(mlPremiumService) {
    this.mlPremiumService = mlPremiumService;
  }

  /**
   * Entrenar modelos ML para una empresa
   * POST /api/ml/entrenar
   */
  async entrenarModelos(req, res) {
    try {
      const empresaId = req.usuario.empresa_id;
      
      const data = await this.mlPremiumService._mlRequest('post', '/predicciones/entrenar', {
        empresa_id: empresaId
      });
      
      res.json(data);
    } catch (error) {
      logger.error('[ML Controller] Error al entrenar modelos ML', {
        empresa_id: req.usuario?.empresa_id,
        error: error.message
      });
      
      res.status(500).json({ 
        error: 'Error al entrenar modelos ML' 
      });
    }
  }

  /**
   * Obtener predicción de ventas
   * GET /api/ml/ventas
   */
  async getVentas(req, res) {
    try {
      const empresaId = req.usuario.empresa_id;
      const meses = req.query.meses || 3;
      
      const data = await this.mlPremiumService._mlRequest(
        'get', 
        `/predicciones/ventas/${empresaId}?meses=${meses}`
      );
      
      res.json(data);
    } catch (error) {
      logger.error('[ML Controller] Error al obtener predicción de ventas', {
        empresa_id: req.usuario?.empresa_id,
        error: error.message
      });
      
      res.status(500).json({ 
        error: 'Error al obtener predicción de ventas' 
      });
    }
  }

  /**
   * Obtener predicción de demanda
   * GET /api/ml/demanda
   */
  async getDemanda(req, res) {
    try {
      const empresaId = req.usuario.empresa_id;
      
      const data = await this.mlPremiumService._mlRequest(
        'get', 
        `/predicciones/demanda/${empresaId}`
      );
      
      res.json(data);
    } catch (error) {
      logger.error('[ML Controller] Error al obtener predicción de demanda', {
        empresa_id: req.usuario?.empresa_id,
        error: error.message
      });
      
      res.status(500).json({ 
        error: 'Error al obtener predicción de demanda' 
      });
    }
  }

  /**
   * Obtener predicción de stock
   * GET /api/ml/stock
   */
  async getStock(req, res) {
    try {
      const empresaId = req.usuario.empresa_id;
      
      const data = await this.mlPremiumService._mlRequest(
        'get', 
        `/predicciones/stock/${empresaId}`
      );
      
      res.json(data);
    } catch (error) {
      logger.error('[ML Controller] Error al obtener predicción de stock', {
        empresa_id: req.usuario?.empresa_id,
        error: error.message
      });
      
      res.status(500).json({ 
        error: 'Error al obtener predicción de stock' 
      });
    }
  }

  /**
   * Obtener resumen general ML
   * GET /api/ml/resumen
   */
  async getResumen(req, res) {
    try {
      const empresaId = req.usuario.empresa_id;
      
      const data = await this.mlPremiumService._mlRequest(
        'get', 
        `/predicciones/resumen/${empresaId}`
      );
      
      res.json(data);
    } catch (error) {
      logger.error('[ML Controller] Error al obtener resumen ML', {
        empresa_id: req.usuario?.empresa_id,
        error: error.message
      });
      
      res.status(500).json({ 
        error: 'Error al obtener resumen ML' 
      });
    }
  }

  // ─── ENDPOINTS PREMIUM (Enterprise con api_access) ───────────────────────

  /**
   * Obtener predicción de ventas premium
   * GET /api/ml/api/ventas
   * @access Enterprise (api_access feature required)
   */
  async getVentasPremium(req, res) {
    try {
      const empresaId = req.usuario.empresa_id;
      const meses = parseInt(req.query.meses) || 6; // 6 meses default para premium
      
      const result = await this.mlPremiumService.getVentasPremium(empresaId, meses);
      res.json(result);
    } catch (error) {
      logger.error('[ML Controller] Error en endpoint premium /api/ventas', {
        empresa_id: req.usuario?.empresa_id,
        error: error.message
      });
      
      res.status(500).json({ 
        error: 'Error al obtener predicción API premium',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener predicción de demanda premium
   * GET /api/ml/api/demanda
   * @access Enterprise (api_access feature required)
   */
  async getDemandaPremium(req, res) {
    try {
      const empresaId = req.usuario.empresa_id;
      const result = await this.mlPremiumService.getDemandaPremium(empresaId);
      res.json(result);
    } catch (error) {
      logger.error('[ML Controller] Error en endpoint premium /api/demanda', {
        empresa_id: req.usuario?.empresa_id,
        error: error.message
      });
      
      res.status(500).json({ 
        error: 'Error al obtener predicción de demanda premium' 
      });
    }
  }

  /**
   * Obtener predicción de stock premium
   * GET /api/ml/api/stock
   * @access Enterprise (api_access feature required)
   */
  async getStockPremium(req, res) {
    try {
      const empresaId = req.usuario.empresa_id;
      const result = await this.mlPremiumService.getStockPremium(empresaId);
      res.json(result);
    } catch (error) {
      logger.error('[ML Controller] Error en endpoint premium /api/stock', {
        empresa_id: req.usuario?.empresa_id,
        error: error.message
      });
      
      res.status(500).json({ 
        error: 'Error al obtener predicción de stock premium' 
      });
    }
  }

  /**
   * Obtener resumen ejecutivo premium
   * GET /api/ml/api/resumen
   * @access Enterprise (api_access feature required)
   */
  async getResumenPremium(req, res) {
    try {
      const empresaId = req.usuario.empresa_id;
      const result = await this.mlPremiumService.getResumenPremium(empresaId);
      res.json(result);
    } catch (error) {
      logger.error('[ML Controller] Error en endpoint premium /api/resumen', {
        empresa_id: req.usuario?.empresa_id,
        error: error.message
      });
      
      res.status(500).json({ 
        error: 'Error al obtener resumen premium' 
      });
    }
  }

  /**
   * Entrenar modelos premium
   * POST /api/ml/api/entrenar
   * @access Enterprise (api_access feature required)
   */
  async entrenarModelosPremium(req, res) {
    try {
      const empresaId = req.usuario.empresa_id;
      const result = await this.mlPremiumService.entrenarModelosPremium(empresaId);
      res.json(result);
    } catch (error) {
      logger.error('[ML Controller] Error en endpoint premium /api/entrenar', {
        empresa_id: req.usuario?.empresa_id,
        error: error.message
      });
      
      res.status(500).json({ 
        error: 'Error al entrenar modelos premium' 
      });
    }
  }

  /**
   * Health check del servicio premium
   * GET /api/ml/api/health
   * @access Enterprise (api_access feature required)
   */
  async healthCheck(req, res) {
    const circuitState = this.mlPremiumService.getCircuitState();
    res.json({
      service: 'ml_premium',
      ...circuitState,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = MLController;
