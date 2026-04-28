import { useState, useCallback } from 'react';
import { featuresApi } from '../api/featuresApi';

/**
 * Hook personalizado para gestión avanzada de Features
 * 
 * Proporciona métodos para:
 * - Obtener catálogo completo
 * - Gestionar features por plan
 * - Gestionar features por rubro
 * - Gestionar overrides por empresa
 * - Ver features efectivos de una empresa
 * 
 * @returns {{
 *   loading: boolean,
 *   error: Error | null,
 *   catalogo: {features: Array, planes: Array, rubros: Array} | null,
 *   effectiveFeatures: Object | null,
 *   loadCatalogo: () => Promise<void>,
 *   createFeature: (payload) => Promise<Object>,
 *   updatePlanFeature: (planId, featureId, activo) => Promise<Object>,
 *   updateRubroFeature: (rubroId, featureId, activo) => Promise<Object>,
 *   updateEmpresaOverride: (empresaId, featureId, activo, motivo) => Promise<Object>,
 *   loadEffectiveFeatures: (empresaId) => Promise<void>,
 *   clearEffectiveFeatures: () => void
 * }}
 */
export const useFeatures = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [catalogo, setCatalogo] = useState(null);
  const [effectiveFeatures, setEffectiveFeatures] = useState(null);

  /**
   * Carga el catálogo completo de features, planes y rubros
   */
  const loadCatalogo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await featuresApi.getCatalogo();
      setCatalogo(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea un nuevo feature
   */
  const createFeature = useCallback(async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const feature = await featuresApi.createFeature(payload);
      // Recargar catálogo para incluir el nuevo feature
      await loadCatalogo();
      return feature;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCatalogo]);

  /**
   * Actualiza un feature asociado a un plan
   */
  const updatePlanFeature = useCallback(async (planId, featureId, activo) => {
    try {
      setLoading(true);
      setError(null);
      const result = await featuresApi.updatePlanFeature(planId, featureId, activo);
      // Recargar catálogo para reflejar cambios
      await loadCatalogo();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCatalogo]);

  /**
   * Actualiza un feature asociado a un rubro
   */
  const updateRubroFeature = useCallback(async (rubroId, featureId, activo) => {
    try {
      setLoading(true);
      setError(null);
      const result = await featuresApi.updateRubroFeature(rubroId, featureId, activo);
      // Recargar catálogo para reflejar cambios
      await loadCatalogo();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCatalogo]);

  /**
   * Crea o actualiza un override de feature para una empresa
   */
  const updateEmpresaOverride = useCallback(async (empresaId, featureId, activo, motivo = null) => {
    try {
      setLoading(true);
      setError(null);
      const result = await featuresApi.updateEmpresaOverride(empresaId, featureId, activo, motivo);
      // Si hay features efectivos cargados para esta empresa, recargarlos
      if (effectiveFeatures?.empresa?.id === empresaId) {
        await loadEffectiveFeatures(empresaId);
      }
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [effectiveFeatures, loadEffectiveFeatures]);

  /**
   * Carga los features efectivos para una empresa específica
   */
  const loadEffectiveFeatures = useCallback(async (empresaId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await featuresApi.getEffectiveFeatures(empresaId);
      setEffectiveFeatures(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpia los features efectivos cargados
   */
  const clearEffectiveFeatures = useCallback(() => {
    setEffectiveFeatures(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    catalogo,
    effectiveFeatures,
    loadCatalogo,
    createFeature,
    updatePlanFeature,
    updateRubroFeature,
    updateEmpresaOverride,
    loadEffectiveFeatures,
    clearEffectiveFeatures,
  };
};

export default useFeatures;
