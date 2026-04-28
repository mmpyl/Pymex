/**
 * ML Premium Service
 * 
 * Servicio del dominio ML para funcionalidades premium exclusivas de clientes Enterprise.
 * Este servicio encapsula la lógica de negocio para endpoints premium de predicciones.
 * 
 * Responsabilidades:
 * - Orquestar llamadas al ML Service externo
 * - Aplicar reglas de negocio específicas para clientes premium
 * - Manejar circuit breaker y fallbacks
 * - Enriquecer respuestas con metadatos enterprise
 */

const axios = require('axios');
const CircuitBreaker = require('opossum');
const logger = require('../../../utils/logger');

class MLPremiumService {
  constructor() {
    this.mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000/api';
    this.mlTimeout = Number(process.env.ML_SERVICE_TIMEOUT_MS || process.env.ML_TIMEOUT_MS || 15000);
    this.mlApiKey = process.env.ML_SERVICE_API_KEY;

    this.client = axios.create({
      baseURL: this.mlUrl,
      timeout: this.mlTimeout,
      headers: this.mlApiKey ? { 'x-ml-api-key': this.mlApiKey } : undefined
    });

    this._initCircuitBreaker();
  }

  /**
   * Inicializa el Circuit Breaker para proteger contra fallos en cascada
   */
  _initCircuitBreaker() {
    this.circuit = new CircuitBreaker(async (method, url, data, config) => {
      const response = await this.client[method](url, data, config);
      return response.data;
    }, {
      timeout: this.mlTimeout,
      errorThresholdPercentage: 50,
      resetTimeout: 30000
    });

    // Fallback cuando el circuito está abierto
    this.circuit.fallback((method, url, data, config) => ({
      status: 'degraded',
      message: 'ML service unavailable - operating in degraded mode',
      circuit_state: 'open',
      timestamp: new Date().toISOString()
    }));

    // Logging de eventos
    this.circuit.on('open', () => {
      logger.warn('[ML Premium] Circuit Breaker OPENED - service unavailable');
    });

    this.circuit.on('close', () => {
      logger.info('[ML Premium] Circuit Breaker CLOSED - service recovered');
    });

    this.circuit.on('fallback', (result) => {
      logger.warn('[ML Premium] Circuit Breaker FALLBACK triggered');
    });
  }

  /**
   * Ejecuta una petición con circuit breaker
   */
  async _mlRequest(method, endpoint, data = null, config = {}) {
    return this.circuit.fire(method, endpoint, data, config);
  }

  /**
   * Obtiene predicción de ventas premium para clientes Enterprise
   * 
   * @param {number} empresaId - ID de la empresa
   * @param {number} meses - Cantidad de meses a predecir (default: 6 para premium)
   * @param {object} context - Contexto adicional (usuario, plan, etc.)
   * @returns {Promise<object>} Predicción enriquecida con metadatos enterprise
   */
  async getVentasPremium(empresaId, meses = 6, context = {}) {
    const start = Date.now();
    
    try {
      const data = await this._mlRequest('get', `/predicciones/ventas/${empresaId}?meses=${meses}`);
      
      // Enriquecer respuesta con metadatos enterprise
      const enrichedResponse = {
        fuente: 'ml_api_premium',
        tier: 'enterprise',
        metadata: {
          empresa_id: empresaId,
          meses_predichos: meses,
          timestamp: new Date().toISOString(),
          latency_ms: Date.now() - start,
          api_version: 'v1',
          feature: 'api_access'
        },
        ...data
      };

      logger.info('[ML Premium] Ventas premium obtenidas', {
        empresa_id: empresaId,
        meses,
        latency_ms: Date.now() - start
      });

      return enrichedResponse;
    } catch (error) {
      logger.error('[ML Premium] Error al obtener ventas premium', {
        empresa_id: empresaId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Obtiene predicción de demanda premium
   */
  async getDemandaPremium(empresaId, context = {}) {
    const start = Date.now();
    
    try {
      const data = await this._mlRequest('get', `/predicciones/demanda/${empresaId}`);
      
      return {
        fuente: 'ml_api_premium',
        tier: 'enterprise',
        metadata: {
          empresa_id: empresaId,
          timestamp: new Date().toISOString(),
          latency_ms: Date.now() - start,
          feature: 'api_access'
        },
        ...data
      };
    } catch (error) {
      logger.error('[ML Premium] Error al obtener demanda premium', {
        empresa_id: empresaId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Obtiene predicción de stock premium
   */
  async getStockPremium(empresaId, context = {}) {
    const start = Date.now();
    
    try {
      const data = await this._mlRequest('get', `/predicciones/stock/${empresaId}`);
      
      return {
        fuente: 'ml_api_premium',
        tier: 'enterprise',
        metadata: {
          empresa_id: empresaId,
          timestamp: new Date().toISOString(),
          latency_ms: Date.now() - start,
          feature: 'api_access'
        },
        ...data
      };
    } catch (error) {
      logger.error('[ML Premium] Error al obtener stock premium', {
        empresa_id: empresaId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Obtiene resumen ejecutivo premium con todas las predicciones
   */
  async getResumenPremium(empresaId, context = {}) {
    const start = Date.now();
    
    try {
      const data = await this._mlRequest('get', `/predicciones/resumen/${empresaId}`);
      
      return {
        fuente: 'ml_api_premium',
        tier: 'enterprise',
        metadata: {
          empresa_id: empresaId,
          timestamp: new Date().toISOString(),
          latency_ms: Date.now() - start,
          feature: 'api_access',
          report_type: 'executive_summary'
        },
        ...data
      };
    } catch (error) {
      logger.error('[ML Premium] Error al obtener resumen premium', {
        empresa_id: empresaId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Entrena modelos ML para empresa (operación premium)
   */
  async entrenarModelosPremium(empresaId, context = {}) {
    const start = Date.now();
    
    try {
      const data = await this._mlRequest('post', '/predicciones/entrenar', {
        empresa_id: empresaId
      });
      
      return {
        fuente: 'ml_api_premium',
        tier: 'enterprise',
        metadata: {
          empresa_id: empresaId,
          timestamp: new Date().toISOString(),
          latency_ms: Date.now() - start,
          feature: 'api_access',
          operation: 'model_training'
        },
        ...data
      };
    } catch (error) {
      logger.error('[ML Premium] Error al entrenar modelos premium', {
        empresa_id: empresaId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Estado del circuit breaker (para health checks)
   */
  getCircuitState() {
    return {
      state: this.circuit.state,
      stats: this.circuit.stats,
      healthy: this.circuit.state !== 'open'
    };
  }
}

// Singleton pattern
let instance = null;

const getInstance = () => {
  if (!instance) {
    instance = new MLPremiumService();
  }
  return instance;
};

module.exports = {
  MLPremiumService,
  getInstance
};
