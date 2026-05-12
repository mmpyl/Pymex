/**
 * API Service para el dominio BILLING
 * Maneja todas las llamadas HTTP relacionadas con facturación y cobros
 */
import api from '../../../api/axios';

export const billingApi = {
  // ==================== FACTURAS ====================
  facturas: {
    list: async (params = {}) => {
      const response = await api.get('/billing/facturas', { params });
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/billing/facturas/${id}`);
      return response.data;
    },

    create: async (facturaData) => {
      const response = await api.post('/billing/facturas', facturaData);
      return response.data;
    },

    update: async (id, facturaData) => {
      const response = await api.put(`/billing/facturas/${id}`, facturaData);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/billing/facturas/${id}`);
      return response.data;
    },

    enviarPorEmail: async (id, emailData) => {
      const response = await api.post(`/billing/facturas/${id}/enviar`, emailData);
      return response.data;
    },

    descargarPDF: async (id) => {
      const response = await api.get(`/billing/facturas/${id}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    },

    getStats: async (params = {}) => {
      const response = await api.get('/billing/facturas/stats', { params });
      return response.data;
    }
  },

  // ==================== PAGOS ====================
  pagos: {
    list: async (params = {}) => {
      const response = await api.get('/billing/pagos', { params });
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/billing/pagos/${id}`);
      return response.data;
    },

    registrar: async (pagoData) => {
      const response = await api.post('/billing/pagos', pagoData);
      return response.data;
    },

    procesar: async (id, pagoData) => {
      const response = await api.post(`/billing/pagos/${id}/procesar`, pagoData);
      return response.data;
    },

    revertir: async (id, reason) => {
      const response = await api.post(`/billing/pagos/${id}/revertir`, { reason });
      return response.data;
    },

    getMetodosPago: async () => {
      const response = await api.get('/billing/pagos/metodos');
      return response.data;
    }
  },

  // ==================== SUSCRIPCIONES ====================
  suscripciones: {
    list: async (params = {}) => {
      const response = await api.get('/billing/suscripciones', { params });
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/billing/suscripciones/${id}`);
      return response.data;
    },

    crear: async (suscripcionData) => {
      const response = await api.post('/billing/suscripciones', suscripcionData);
      return response.data;
    },

    cancelar: async (id, reason) => {
      const response = await api.post(`/billing/suscripciones/${id}/cancelar`, { reason });
      return response.data;
    },

    reactivar: async (id) => {
      const response = await api.post(`/billing/suscripciones/${id}/reactivar`);
      return response.data;
    },

    actualizarPlan: async (id, planData) => {
      const response = await api.put(`/billing/suscripciones/${id}/plan`, planData);
      return response.data;
    },

    getPlanes: async () => {
      const response = await api.get('/billing/suscripciones/planes');
      return response.data;
    }
  },

  // ==================== COBROS RECURRENTES ====================
  cobrosRecurentes: {
    list: async (params = {}) => {
      const response = await api.get('/billing/cobros-recurrentes', { params });
      return response.data;
    },

    create: async (cobroData) => {
      const response = await api.post('/billing/cobros-recurrentes', cobroData);
      return response.data;
    },

    cancel: async (id) => {
      const response = await api.delete(`/billing/cobros-recurrentes/${id}`);
      return response.data;
    }
  },

  // ==================== REPORTES ====================
  reportes: {
    getIngresos: async (params = {}) => {
      const response = await api.get('/billing/reportes/ingresos', { params });
      return response.data;
    },

    getMorosidad: async (params = {}) => {
      const response = await api.get('/billing/reportes/morosidad', { params });
      return response.data;
    },

    getFlujoCaja: async (params = {}) => {
      const response = await api.get('/billing/reportes/flujo-caja', { params });
      return response.data;
    }
  }
};

export default billingApi;
