/**
 * Servicio de Aplicación para Comprobantes - Dominio BILLING
 * 
 * Este servicio actúa como interfaz pública para acceder a comprobantes
 * desde otros dominios, respetando los límites del dominio.
 */

const { Comprobante } = require('../models');

class ComprobanteService {
  /**
   * Obtiene comprobantes de una empresa específica
   * @param {number} empresaId - ID de la empresa
   * @param {object} options - Opciones de consulta
   * @param {number} options.limit - Límite de registros (default: 50, max: 200)
   * @param {string} options.order - Ordenamiento (default: 'DESC')
   * @returns {Promise<Array>} Lista de comprobantes
   */
  async obtenerComprobantesPorEmpresa(empresaId, options = {}) {
    const limit = Math.min(Number(options.limit || 50), 200);
    const order = options.order || 'DESC';

    if (!empresaId || empresaId <= 0) {
      throw new Error('empresa_id es requerido y debe ser válido');
    }

    const comprobantes = await Comprobante.findAll({
      where: { empresa_id: empresaId },
      order: [['fecha_emision', order]],
      limit,
      attributes: [
        'id',
        'tipo',
        'serie',
        'correlativo',
        'numero',
        'total',
        'moneda',
        'estado',
        'fecha_emision'
      ]
    });

    return {
      data: comprobantes,
      total: comprobantes.length,
      limit,
      empresa_id: empresaId
    };
  }

  /**
   * Obtiene un comprobante específico por ID
   * @param {number} id - ID del comprobante
   * @param {number} empresaId - ID de la empresa para validación de tenant
   * @returns {Promise<object|null>} Comprobante o null
   */
  async obtenerComprobantePorId(id, empresaId) {
    if (!id || id <= 0) {
      throw new Error('id es requerido y debe ser válido');
    }

    const comprobante = await Comprobante.findOne({
      where: { 
        id,
        empresa_id: empresaId 
      },
      attributes: [
        'id',
        'empresa_id',
        'venta_id',
        'tipo',
        'serie',
        'correlativo',
        'numero',
        'ruc_cliente',
        'razon_social',
        'direccion',
        'subtotal',
        'igv',
        'total',
        'moneda',
        'estado',
        'sunat_estado',
        'sunat_descripcion',
        'xml_path',
        'cdr_path',
        'pdf_path',
        'hash',
        'fecha_emision',
        'fecha_envio',
        'entorno'
      ]
    });

    return comprobante;
  }

  /**
   * Valida si un comprobante pertenece a una empresa
   * @param {number} comprobanteId - ID del comprobante
   * @param {number} empresaId - ID de la empresa
   * @returns {Promise<boolean>} True si pertenece
   */
  async validarPropiedadComprobante(comprobanteId, empresaId) {
    const count = await Comprobante.count({
      where: {
        id: comprobanteId,
        empresa_id: empresaId
      }
    });

    return count > 0;
  }
}

module.exports = new ComprobanteService();
