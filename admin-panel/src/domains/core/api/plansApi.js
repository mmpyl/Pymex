/**
 * API Service para gestión de Planes, Features, Rubros y Overrides
 * Maneja todas las llamadas HTTP relacionadas con la configuración de planes
 */
import api from '../../../api/axios';

export const plansApi = {
  // ==================== PLANES ====================
  planes: {
    list: async (params = {}) => {
      const response = await api.get('/billing/planes', { params });
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/billing/planes/${id}`);
      return response.data;
    },

    create: async (planData) => {
      const response = await api.post('/billing/planes', planData);
      return response.data;
    },

    update: async (id, planData) => {
      const response = await api.put(`/billing/planes/${id}`, planData);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/billing/planes/${id}`);
      return response.data;
    },

    toggleActive: async (id) => {
      const response = await api.patch(`/billing/planes/${id}/toggle`);
      return response.data;
    }
  },

  // ==================== FEATURES ====================
  features: {
    list: async (params = {}) => {
      const response = await api.get('/billing/features', { params });
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/billing/features/${id}`);
      return response.data;
    },

    create: async (featureData) => {
      const response = await api.post('/billing/features', featureData);
      return response.data;
    },

    update: async (id, featureData) => {
      const response = await api.put(`/billing/features/${id}`, featureData);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/billing/features/${id}`);
      return response.data;
    },

    toggleActive: async (id) => {
      const response = await api.patch(`/billing/features/${id}/toggle`);
      return response.data;
    },

    getByCategory: async (category) => {
      const response = await api.get(`/billing/features/category/${category}`);
      return response.data;
    }
  },

  // ==================== RUBROS (CATEGORÍAS DE EMPRESAS) ====================
  rubros: {
    list: async (params = {}) => {
      const response = await api.get('/core/rubros', { params });
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/core/rubros/${id}`);
      return response.data;
    },

    create: async (rubroData) => {
      const response = await api.post('/core/rubros', rubroData);
      return response.data;
    },

    update: async (id, rubroData) => {
      const response = await api.put(`/core/rubros/${id}`, rubroData);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/core/rubros/${id}`);
      return response.data;
    },

    toggleActive: async (id) => {
      const response = await api.patch(`/core/rubros/${id}/toggle`);
      return response.data;
    },

    getWithPlans: async () => {
      const response = await api.get('/core/rubros/with-plans');
      return response.data;
    }
  },

  // ==================== PLAN-RUBRO ASSIGNMENTS ====================
  planRubro: {
    list: async (params = {}) => {
      const response = await api.get('/billing/plan-rubro', { params });
      return response.data;
    },

    assign: async (data) => {
      const response = await api.post('/billing/plan-rubro/assign', data);
      return response.data;
    },

    remove: async (planId, rubroId) => {
      const response = await api.delete(`/billing/plan-rubro/${planId}/${rubroId}`);
      return response.data;
    },

    updateLimits: async (assignmentId, limitsData) => {
      const response = await api.put(`/billing/plan-rubro/${assignmentId}/limits`, limitsData);
      return response.data;
    }
  },

  // ==================== OVERRIDES POR EMPRESA ====================
  overrides: {
    list: async (params = {}) => {
      const response = await api.get('/billing/overrides', { params });
      return response.data;
    },

    getByCompany: async (companyId) => {
      const response = await api.get(`/billing/overrides/company/${companyId}`);
      return response.data;
    },

    create: async (overrideData) => {
      const response = await api.post('/billing/overrides', overrideData);
      return response.data;
    },

    update: async (id, overrideData) => {
      const response = await api.put(`/billing/overrides/${id}`, overrideData);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/billing/overrides/${id}`);
      return response.data;
    },

    toggleActive: async (id) => {
      const response = await api.patch(`/billing/overrides/${id}/toggle`);
      return response.data;
    }
  },

  // ==================== COMPANY PLANS ====================
  companyPlans: {
    getEffectivePlan: async (companyId) => {
      const response = await api.get(`/billing/company/${companyId}/effective-plan`);
      return response.data;
    },

    getAvailablePlans: async (companyId) => {
      const response = await api.get(`/billing/company/${companyId}/available-plans`);
      return response.data;
    },

    assignPlan: async (companyId, planData) => {
      const response = await api.post(`/billing/company/${companyId}/assign-plan`, planData);
      return response.data;
    }
  }
};

export default plansApi;
