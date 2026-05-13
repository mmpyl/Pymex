import { useState, useEffect, useCallback } from 'react';
import { plansApi } from '../api/plansApi';
import { usePlansStore } from '../store/plansStore';

/**
 * Hook personalizado para gestión de Planes
 */
export const usePlanes = () => {
  const { 
    planes, setPlanes, addPlan, updatePlan, removePlan,
    loadingPlanes, setLoadingPlanes,
    selectedPlan, setSelectedPlan,
  } = usePlansStore();

  const [error, setError] = useState(null);

  const fetchPlanes = useCallback(async (params = {}) => {
    setLoadingPlanes(true);
    setError(null);
    try {
      const data = await plansApi.planes.list(params);
      setPlanes(data);
      return data;
    } catch (err) {
      setError(err.message || 'Error al cargar los planes');
      throw err;
    } finally {
      setLoadingPlanes(false);
    }
  }, [setLoadingPlanes, setPlanes]);

  const getPlanById = useCallback(async (id) => {
    try {
      const data = await plansApi.planes.getById(id);
      setSelectedPlan(data);
      return data;
    } catch (err) {
      setError(err.message || 'Error al cargar el plan');
      throw err;
    }
  }, [setSelectedPlan]);

  const createPlan = useCallback(async (planData) => {
    try {
      const newPlan = await plansApi.planes.create(planData);
      addPlan(newPlan);
      return newPlan;
    } catch (err) {
      setError(err.message || 'Error al crear el plan');
      throw err;
    }
  }, [addPlan]);

  const updatePlanById = useCallback(async (id, planData) => {
    try {
      const updated = await plansApi.planes.update(id, planData);
      updatePlan(updated);
      return updated;
    } catch (err) {
      setError(err.message || 'Error al actualizar el plan');
      throw err;
    }
  }, [updatePlan]);

  const deletePlan = useCallback(async (id) => {
    try {
      await plansApi.planes.delete(id);
      removePlan(id);
      return true;
    } catch (err) {
      setError(err.message || 'Error al eliminar el plan');
      throw err;
    }
  }, [removePlan]);

  const togglePlanActive = useCallback(async (id) => {
    try {
      const updated = await plansApi.planes.toggleActive(id);
      updatePlan(updated);
      return updated;
    } catch (err) {
      setError(err.message || 'Error al cambiar estado del plan');
      throw err;
    }
  }, [updatePlan]);

  return {
    planes,
    selectedPlan,
    loading: loadingPlanes,
    error,
    fetchPlanes,
    getPlanById,
    createPlan,
    updatePlan: updatePlanById,
    deletePlan,
    togglePlanActive,
  };
};

/**
 * Hook personalizado para gestión de Features
 */
export const useFeatures = () => {
  const { 
    features, setFeatures, addFeature, updateFeature, removeFeature,
    featureCategories, setFeatureCategories,
    loadingFeatures, setLoadingFeatures,
  } = usePlansStore();

  const [error, setError] = useState(null);

  const fetchFeatures = useCallback(async (params = {}) => {
    setLoadingFeatures(true);
    setError(null);
    try {
      const data = await plansApi.features.list(params);
      setFeatures(data);
      return data;
    } catch (err) {
      setError(err.message || 'Error al cargar los features');
      throw err;
    } finally {
      setLoadingFeatures(false);
    }
  }, [setLoadingFeatures, setFeatures]);

  const fetchFeatureCategories = useCallback(async () => {
    try {
      // Extraer categorías únicas de los features
      const allFeatures = await plansApi.features.list();
      const categories = [...new Set(allFeatures.map(f => f.category).filter(Boolean))];
      setFeatureCategories(categories);
      return categories;
    } catch (err) {
      setError(err.message || 'Error al cargar las categorías');
      throw err;
    }
  }, [setFeatureCategories]);

  const getFeatureById = useCallback(async (id) => {
    try {
      return await plansApi.features.getById(id);
    } catch (err) {
      setError(err.message || 'Error al cargar el feature');
      throw err;
    }
  }, []);

  const createFeature = useCallback(async (featureData) => {
    try {
      const newFeature = await plansApi.features.create(featureData);
      addFeature(newFeature);
      return newFeature;
    } catch (err) {
      setError(err.message || 'Error al crear el feature');
      throw err;
    }
  }, [addFeature]);

  const updateFeatureById = useCallback(async (id, featureData) => {
    try {
      const updated = await plansApi.features.update(id, featureData);
      updateFeature(updated);
      return updated;
    } catch (err) {
      setError(err.message || 'Error al actualizar el feature');
      throw err;
    }
  }, [updateFeature]);

  const deleteFeature = useCallback(async (id) => {
    try {
      await plansApi.features.delete(id);
      removeFeature(id);
      return true;
    } catch (err) {
      setError(err.message || 'Error al eliminar el feature');
      throw err;
    }
  }, [removeFeature]);

  const toggleFeatureActive = useCallback(async (id) => {
    try {
      const updated = await plansApi.features.toggleActive(id);
      updateFeature(updated);
      return updated;
    } catch (err) {
      setError(err.message || 'Error al cambiar estado del feature');
      throw err;
    }
  }, [updateFeature]);

  return {
    features,
    featureCategories,
    loading: loadingFeatures,
    error,
    fetchFeatures,
    fetchFeatureCategories,
    getFeatureById,
    createFeature,
    updateFeature: updateFeatureById,
    deleteFeature,
    toggleFeatureActive,
  };
};

/**
 * Hook personalizado para gestión de Rubros
 */
export const useRubros = () => {
  const { 
    rubros, setRubros, addRubro, updateRubro, removeRubro,
    loadingRubros, setLoadingRubros,
  } = usePlansStore();

  const [error, setError] = useState(null);

  const fetchRubros = useCallback(async (params = {}) => {
    setLoadingRubros(true);
    setError(null);
    try {
      const data = await plansApi.rubros.list(params);
      setRubros(data);
      return data;
    } catch (err) {
      setError(err.message || 'Error al cargar los rubros');
      throw err;
    } finally {
      setLoadingRubros(false);
    }
  }, [setLoadingRubros, setRubros]);

  const getRubroById = useCallback(async (id) => {
    try {
      return await plansApi.rubros.getById(id);
    } catch (err) {
      setError(err.message || 'Error al cargar el rubro');
      throw err;
    }
  }, []);

  const createRubro = useCallback(async (rubroData) => {
    try {
      const newRubro = await plansApi.rubros.create(rubroData);
      addRubro(newRubro);
      return newRubro;
    } catch (err) {
      setError(err.message || 'Error al crear el rubro');
      throw err;
    }
  }, [addRubro]);

  const updateRubroById = useCallback(async (id, rubroData) => {
    try {
      const updated = await plansApi.rubros.update(id, rubroData);
      updateRubro(updated);
      return updated;
    } catch (err) {
      setError(err.message || 'Error al actualizar el rubro');
      throw err;
    }
  }, [updateRubro]);

  const deleteRubro = useCallback(async (id) => {
    try {
      await plansApi.rubros.delete(id);
      removeRubro(id);
      return true;
    } catch (err) {
      setError(err.message || 'Error al eliminar el rubro');
      throw err;
    }
  }, [removeRubro]);

  const toggleRubroActive = useCallback(async (id) => {
    try {
      const updated = await plansApi.rubros.toggleActive(id);
      updateRubro(updated);
      return updated;
    } catch (err) {
      setError(err.message || 'Error al cambiar estado del rubro');
      throw err;
    }
  }, [updateRubro]);

  return {
    rubros,
    loading: loadingRubros,
    error,
    fetchRubros,
    getRubroById,
    createRubro,
    updateRubro: updateRubroById,
    deleteRubro,
    toggleRubroActive,
  };
};

/**
 * Hook personalizado para gestión de Overrides por Empresa
 */
export const useOverrides = () => {
  const { 
    overrides, setOverrides, addOverride, updateOverride, removeOverride,
    loadingOverrides, setLoadingOverrides,
  } = usePlansStore();

  const [error, setError] = useState(null);

  const fetchOverrides = useCallback(async (params = {}) => {
    setLoadingOverrides(true);
    setError(null);
    try {
      const data = await plansApi.overrides.list(params);
      setOverrides(data);
      return data;
    } catch (err) {
      setError(err.message || 'Error al cargar los overrides');
      throw err;
    } finally {
      setLoadingOverrides(false);
    }
  }, [setLoadingOverrides, setOverrides]);

  const getOverridesByCompany = useCallback(async (companyId) => {
    try {
      return await plansApi.overrides.getByCompany(companyId);
    } catch (err) {
      setError(err.message || 'Error al cargar los overrides de la empresa');
      throw err;
    }
  }, []);

  const createOverride = useCallback(async (overrideData) => {
    try {
      const newOverride = await plansApi.overrides.create(overrideData);
      addOverride(newOverride);
      return newOverride;
    } catch (err) {
      setError(err.message || 'Error al crear el override');
      throw err;
    }
  }, [addOverride]);

  const updateOverrideById = useCallback(async (id, overrideData) => {
    try {
      const updated = await plansApi.overrides.update(id, overrideData);
      updateOverride(updated);
      return updated;
    } catch (err) {
      setError(err.message || 'Error al actualizar el override');
      throw err;
    }
  }, [updateOverride]);

  const deleteOverride = useCallback(async (id) => {
    try {
      await plansApi.overrides.delete(id);
      removeOverride(id);
      return true;
    } catch (err) {
      setError(err.message || 'Error al eliminar el override');
      throw err;
    }
  }, [removeOverride]);

  const toggleOverrideActive = useCallback(async (id) => {
    try {
      const updated = await plansApi.overrides.toggleActive(id);
      updateOverride(updated);
      return updated;
    } catch (err) {
      setError(err.message || 'Error al cambiar estado del override');
      throw err;
    }
  }, [updateOverride]);

  return {
    overrides,
    loading: loadingOverrides,
    error,
    fetchOverrides,
    getOverridesByCompany,
    createOverride,
    updateOverride: updateOverrideById,
    deleteOverride,
    toggleOverrideActive,
  };
};

/**
 * Hook personalizado para gestión de Plan-Rubro Assignments
 */
export const usePlanRubro = () => {
  const { 
    planRubroAssignments, setPlanRubroAssignments, 
    addAssignment, updateAssignment, removeAssignment,
    loadingAssignments, setLoadingAssignments,
  } = usePlansStore();

  const [error, setError] = useState(null);

  const fetchAssignments = useCallback(async (params = {}) => {
    setLoadingAssignments(true);
    setError(null);
    try {
      const data = await plansApi.planRubro.list(params);
      setPlanRubroAssignments(data);
      return data;
    } catch (err) {
      setError(err.message || 'Error al cargar las asignaciones');
      throw err;
    } finally {
      setLoadingAssignments(false);
    }
  }, [setLoadingAssignments, setPlanRubroAssignments]);

  const assignPlanToRubro = useCallback(async (planId, rubroId, limits = {}) => {
    try {
      const assignment = await plansApi.planRubro.assign({ planId, rubroId, limits });
      addAssignment(assignment);
      return assignment;
    } catch (err) {
      setError(err.message || 'Error al asignar plan al rubro');
      throw err;
    }
  }, [addAssignment]);

  const removePlanFromRubro = useCallback(async (planId, rubroId) => {
    try {
      await plansApi.planRubro.remove(planId, rubroId);
      // Encontrar y remover la asignación
      const assignment = planRubroAssignments.find(
        a => a.planId === planId && a.rubroId === rubroId
      );
      if (assignment) {
        removeAssignment(assignment.id);
      }
      return true;
    } catch (err) {
      setError(err.message || 'Error al remover asignación');
      throw err;
    }
  }, [planRubroAssignments, removeAssignment]);

  const updateLimits = useCallback(async (assignmentId, limitsData) => {
    try {
      const updated = await plansApi.planRubro.updateLimits(assignmentId, limitsData);
      updateAssignment(updated);
      return updated;
    } catch (err) {
      setError(err.message || 'Error al actualizar límites');
      throw err;
    }
  }, [updateAssignment]);

  return {
    assignments: planRubroAssignments,
    loading: loadingAssignments,
    error,
    fetchAssignments,
    assignPlanToRubro,
    removePlanFromRubro,
    updateLimits,
  };
};

/**
 * Hook personalizado para obtener el plan efectivo de una empresa
 */
export const useCompanyPlan = () => {
  const { companyEffectivePlans, setCompanyEffectivePlan } = usePlansStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getEffectivePlan = useCallback(async (companyId) => {
    setLoading(true);
    setError(null);
    try {
      const effectivePlan = await plansApi.companyPlans.getEffectivePlan(companyId);
      setCompanyEffectivePlan(companyId, effectivePlan);
      return effectivePlan;
    } catch (err) {
      setError(err.message || 'Error al obtener el plan efectivo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCompanyEffectivePlan]);

  const getAvailablePlans = useCallback(async (companyId) => {
    try {
      return await plansApi.companyPlans.getAvailablePlans(companyId);
    } catch (err) {
      setError(err.message || 'Error al obtener planes disponibles');
      throw err;
    }
  }, []);

  const assignPlanToCompany = useCallback(async (companyId, planData) => {
    try {
      const result = await plansApi.companyPlans.assignPlan(companyId, planData);
      // Refrescar el plan efectivo después de asignar
      await getEffectivePlan(companyId);
      return result;
    } catch (err) {
      setError(err.message || 'Error al asignar plan a la empresa');
      throw err;
    }
  }, [getEffectivePlan]);

  return {
    getEffectivePlan,
    getAvailablePlans,
    assignPlanToCompany,
    loading,
    error,
    effectivePlan: companyEffectivePlans,
  };
};
