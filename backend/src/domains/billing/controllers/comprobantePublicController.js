/**
 * Controlador para API Pública de Comprobantes - Dominio BILLING
 * 
 * Este controlador maneja las solicitudes a la API pública de comprobantes
 * con autenticación por API Key.
 */

const comprobanteService = require('../services/comprobanteService');
const { NotFoundError } = require('../../../middleware/errorHandler');

class ComprobantePublicController {
  /**
   * GET /api/public/v1/comprobantes
   * Obtiene lista de comprobantes de la empresa autenticada por API Key
   */
  async listarComprobantes(req, res, next) {
    try {
      const empresaId = req.apiKey.empresa_id;
      const { limit, order } = req.query;

      const resultado = await comprobanteService.obtenerComprobantesPorEmpresa(
        empresaId,
        { limit, order }
      );

      return res.json({
        success: true,
        data: resultado.data,
        pagination: {
          total: resultado.total,
          limit: resultado.limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/public/v1/comprobantes/:id
   * Obtiene un comprobante específico por ID
   */
  async obtenerComprobante(req, res, next) {
    try {
      const empresaId = req.apiKey.empresa_id;
      const { id } = req.params;

      const comprobante = await comprobanteService.obtenerComprobantePorId(
        parseInt(id),
        empresaId
      );

      if (!comprobante) {
        throw new NotFoundError('Comprobante no encontrado');
      }

      return res.json({
        success: true,
        data: comprobante
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ComprobantePublicController();
