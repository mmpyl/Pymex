/**
 * API Service para el dominio CORE
 * Maneja todas las llamadas HTTP relacionadas con entidades del negocio
 */
import api from '../../../api/axios';

export const coreApi = {
  // ==================== PRODUCTOS ====================
  productos: {
    list: async (params = {}) => {
      const response = await api.get('/productos', { params });
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/productos/${id}`);
      return response.data;
    },

    create: async (productoData) => {
      const response = await api.post('/productos', productoData);
      return response.data;
    },

    update: async (id, productoData) => {
      const response = await api.put(`/productos/${id}`, productoData);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/productos/${id}`);
      return response.data;
    },

    search: async (query) => {
      const response = await api.get('/productos/search', { params: { q: query } });
      return response.data;
    },

    updateStock: async (id, stockData) => {
      const response = await api.patch(`/productos/${id}/stock`, stockData);
      return response.data;
    },

    // Categorías
    getCategorias: async () => {
      const response = await api.get('/productos/categorias');
      return response.data;
    },

    createCategoria: async (categoriaData) => {
      const response = await api.post('/productos/categorias', categoriaData);
      return response.data;
    },

    deleteCategoria: async (id) => {
      const response = await api.delete(`/productos/categorias/${id}`);
      return response.data;
    }
  },

  // ==================== CLIENTES ====================
  clientes: {
    list: async (params = {}) => {
      const response = await api.get('/clientes', { params });
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/clientes/${id}`);
      return response.data;
    },

    create: async (clienteData) => {
      const response = await api.post('/clientes', clienteData);
      return response.data;
    },

    update: async (id, clienteData) => {
      const response = await api.put(`/clientes/${id}`, clienteData);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/clientes/${id}`);
      return response.data;
    },

    search: async (query) => {
      const response = await api.get('/clientes/search', { params: { q: query } });
      return response.data;
    }
  },

  // ==================== VENTAS ====================
  ventas: {
    list: async (params = {}) => {
      const response = await api.get('/ventas', { params });
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/ventas/${id}`);
      return response.data;
    },

    create: async (ventaData) => {
      const response = await api.post('/ventas', ventaData);
      return response.data;
    },

    cancel: async (id, reason) => {
      const response = await api.post(`/ventas/${id}/cancelar`, { reason });
      return response.data;
    },

    getStats: async (params = {}) => {
      const response = await api.get('/ventas/stats', { params });
      return response.data;
    },

    getDashboardMetrics: async () => {
      const response = await api.get('/ventas/dashboard');
      return response.data;
    }
  },

  // ==================== EMPRESA ====================
  empresa: {
    getProfile: async () => {
      const response = await api.get('/empresa/profile');
      return response.data;
    },

    updateProfile: async (empresaData) => {
      const response = await api.put('/empresa/profile', empresaData);
      return response.data;
    },

    getSettings: async () => {
      const response = await api.get('/empresa/settings');
      return response.data;
    },

    updateSettings: async (settingsData) => {
      const response = await api.put('/empresa/settings', settingsData);
      return response.data;
    }
  },

  // ==================== INVENTARIO ====================
  inventario: {
    getMovimientos: async (params = {}) => {
      const response = await api.get('/inventario/movimientos', { params });
      return response.data;
    },

    createMovimiento: async (movimientoData) => {
      const response = await api.post('/inventario/movimientos', movimientoData);
      return response.data;
    },

    getAlertasStock: async () => {
      const response = await api.get('/inventario/alertas');
      return response.data;
    },

    ajustarStock: async (ajusteData) => {
      const response = await api.post('/inventario/ajustar', ajusteData);
      return response.data;
    }
  }
};

export default coreApi;
