import api from '../../../../api/axios';

/**
 * API para gestión avanzada de Features
 * 
 * Permite gestionar features a nivel de:
 * - Catálogo global
 * - Planes
 * - Rubros
 * - Overrides por empresa
 */
export const featuresApi = {
  /**
   * Obtiene el catálogo completo de features, planes y rubros
   * @returns {Promise<{features: Array, planes: Array, rubros: Array}>}
   */
  getCatalogo: async () => {
    const { data } = await api.get('/features/catalogo');
    return data;
  },

  /**
   * Crea un nuevo feature en el catálogo
   * @param {Object} payload - Datos del feature
   * @param {string} payload.nombre - Nombre del feature
   * @param {string} payload.codigo - Código único del feature
   * @param {string} [payload.descripcion] - Descripción opcional
   * @param {string} [payload.estado='activo'] - Estado del feature
   * @returns {Promise<Object>} Feature creado
   */
  createFeature: async (payload) => {
    const { data } = await api.post('/features', payload);
    return data;
  },

  /**
   * Actualiza un feature asociado a un plan
   * @param {number} planId - ID del plan
   * @param {number} featureId - ID del feature
   * @param {boolean} activo - Estado del feature
   * @returns {Promise<{mensaje: string, activo: boolean}>}
   */
  updatePlanFeature: async (planId, featureId, activo) => {
    const { data } = await api.put(
      `/features/planes/${planId}/features/${featureId}`,
      { activo }
    );
    return data;
  },

  /**
   * Actualiza un feature asociado a un rubro
   * @param {number} rubroId - ID del rubro
   * @param {number} featureId - ID del feature
   * @param {boolean} activo - Estado del feature
   * @returns {Promise<{mensaje: string, activo: boolean}>}
   */
  updateRubroFeature: async (rubroId, featureId, activo) => {
    const { data } = await api.put(
      `/features/rubros/${rubroId}/features/${featureId}`,
      { activo }
    );
    return data;
  },

  /**
   * Crea o actualiza un override de feature para una empresa específica
   * @param {number} empresaId - ID de la empresa
   * @param {number} featureId - ID del feature
   * @param {boolean} activo - Estado del override
   * @param {string} [motivo] - Motivo del override
   * @returns {Promise<{mensaje: string, activo: boolean}>}
   */
  updateEmpresaOverride: async (empresaId, featureId, activo, motivo = null) => {
    const { data } = await api.put(
      `/features/empresas/${empresaId}/features/${featureId}`,
      { activo, motivo }
    );
    return data;
  },

  /**
   * Obtiene los features efectivos para una empresa específica
   * Incluye resolución de: plan + rubro + overrides
   * @param {number} empresaId - ID de la empresa
   * @returns {Promise<{
   *   empresa: Object,
   *   features: Array<{
   *     feature_id: number,
   *     feature_code: string,
   *     nombre: string,
   *     activo: boolean,
   *     source: string
   *   }>
   * }>}
   */
  getEffectiveFeatures: async (empresaId) => {
    const { data } = await api.get(`/features/empresas/${empresaId}/effective`);
    return data;
  },
};

export default featuresApi;
