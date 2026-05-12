/**
 * API Service para el dominio ML (Machine Learning)
 * Maneja todas las llamadas HTTP relacionadas con predicciones y modelos
 */
import api from '../../../api/axios';

export const mlApi = {
  // ==================== PREDICCIONES ====================
  predicciones: {
    demanda: async (params = {}) => {
      const response = await api.post('/ml/predicciones/demanda', params);
      return response.data;
    },

    ventas: async (params = {}) => {
      const response = await api.post('/ml/predicciones/ventas', params);
      return response.data;
    },

    inventario: async (params = {}) => {
      const response = await api.post('/ml/predicciones/inventario', params);
      return response.data;
    },

    churn: async (clienteId) => {
      const response = await api.post('/ml/predicciones/churn', { clienteId });
      return response.data;
    },

    recomendaciones: async (usuarioId, params = {}) => {
      const response = await api.get(`/ml/recomendaciones/${usuarioId}`, { params });
      return response.data;
    }
  },

  // ==================== MODELOS ====================
  modelos: {
    list: async () => {
      const response = await api.get('/ml/modelos');
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/ml/modelos/${id}`);
      return response.data;
    },

    entrenar: async (modeloData) => {
      const response = await api.post('/ml/modelos/entrenar', modeloData);
      return response.data;
    },

    evaluar: async (modeloId, testData) => {
      const response = await api.post(`/ml/modelos/${modeloId}/evaluar`, testData);
      return response.data;
    },

    desplegar: async (modeloId) => {
      const response = await api.post(`/ml/modelos/${modeloId}/desplegar`);
      return response.data;
    },

    desactivar: async (modeloId) => {
      const response = await api.post(`/ml/modelos/${modeloId}/desactivar`);
      return response.data;
    },

    getMetrics: async (modeloId, params = {}) => {
      const response = await api.get(`/ml/modelos/${modeloId}/metricas`, { params });
      return response.data;
    }
  },

  // ==================== DATOS DE ENTRENAMIENTO ====================
  datosEntrenamiento: {
    upload: async (file, metadata) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));
      
      const response = await api.post('/ml/datos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },

    list: async (params = {}) => {
      const response = await api.get('/ml/datos', { params });
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/ml/datos/${id}`);
      return response.data;
    },

    preprocess: async (datasetId, config) => {
      const response = await api.post(`/ml/datos/${datasetId}/preprocess`, config);
      return response.data;
    }
  },

  // ==================== ANALITICAS ====================
  analiticas: {
    getDashboardML: async () => {
      const response = await api.get('/ml/analytics/dashboard');
      return response.data;
    },

    getModelPerformance: async (params = {}) => {
      const response = await api.get('/ml/analytics/performance', { params });
      return response.data;
    },

    getPredictionHistory: async (params = {}) => {
      const response = await api.get('/ml/analytics/predictions', { params });
      return response.data;
    },

    exportReport: async (params = {}) => {
      const response = await api.get('/ml/analytics/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    }
  },

  // ==================== CONFIGURACION ====================
  configuracion: {
    get: async () => {
      const response = await api.get('/ml/config');
      return response.data;
    },

    update: async (configData) => {
      const response = await api.put('/ml/config', configData);
      return response.data;
    },

    reset: async () => {
      const response = await api.post('/ml/config/reset');
      return response.data;
    }
  }
};

export default mlApi;
