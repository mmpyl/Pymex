import { create } from 'zustand';
import { mlApi } from '../api/mlApi';

/**
 * Store para el dominio ML (Machine Learning)
 * Maneja predicciones, modelos, datos de entrenamiento y analíticas
 */
export const useMLStore = create((set, get) => ({
  // ==================== PREDICCIONES ====================
  predicciones: {
    loading: false,
    error: null,
    resultados: null,

    demanda: async (params) => {
      set({ predicciones: { ...get().predicciones, loading: true, error: null } });
      try {
        const resultados = await mlApi.predicciones.demanda(params);
        set({ predicciones: { ...get().predicciones, resultados, loading: false } });
        return resultados;
      } catch (error) {
        set({ predicciones: { ...get().predicciones, error: error.message, loading: false } });
        throw error;
      }
    },

    ventas: async (params) => {
      set({ predicciones: { ...get().predicciones, loading: true, error: null } });
      try {
        const resultados = await mlApi.predicciones.ventas(params);
        set({ predicciones: { ...get().predicciones, resultados, loading: false } });
        return resultados;
      } catch (error) {
        set({ predicciones: { ...get().predicciones, error: error.message, loading: false } });
        throw error;
      }
    },

    inventario: async (params) => {
      set({ predicciones: { ...get().predicciones, loading: true, error: null } });
      try {
        const resultados = await mlApi.predicciones.inventario(params);
        set({ predicciones: { ...get().predicciones, resultados, loading: false } });
        return resultados;
      } catch (error) {
        set({ predicciones: { ...get().predicciones, error: error.message, loading: false } });
        throw error;
      }
    },

    churn: async (clienteId) => {
      set({ predicciones: { ...get().predicciones, loading: true, error: null } });
      try {
        const resultado = await mlApi.predicciones.churn(clienteId);
        set({ predicciones: { ...get().predicciones, resultados: resultado, loading: false } });
        return resultado;
      } catch (error) {
        set({ predicciones: { ...get().predicciones, error: error.message, loading: false } });
        throw error;
      }
    },

    recomendaciones: async (usuarioId, params) => {
      set({ predicciones: { ...get().predicciones, loading: true, error: null } });
      try {
        const resultados = await mlApi.predicciones.recomendaciones(usuarioId, params);
        set({ predicciones: { ...get().predicciones, resultados, loading: false } });
        return resultados;
      } catch (error) {
        set({ predicciones: { ...get().predicciones, error: error.message, loading: false } });
        throw error;
      }
    },

    clearResultados: () =>
      set({ predicciones: { ...get().predicciones, resultados: null } })
  },

  // ==================== MODELOS ====================
  modelos: {
    items: [],
    loading: false,
    error: null,
    seleccionado: null,

    fetch: async () => {
      set({ modelos: { ...get().modelos, loading: true, error: null } });
      try {
        const data = await mlApi.modelos.list();
        set({ modelos: { ...get().modelos, items: data, loading: false } });
        return data;
      } catch (error) {
        set({ modelos: { ...get().modelos, error: error.message, loading: false } });
        throw error;
      }
    },

    entrenar: async (modeloData) => {
      set({ modelos: { ...get().modelos, loading: true } });
      try {
        const resultado = await mlApi.modelos.entrenar(modeloData);
        set({ modelos: { ...get().modelos, loading: false } });
        return resultado;
      } catch (error) {
        set({ modelos: { ...get().modelos, loading: false } });
        throw error;
      }
    },

    evaluar: async (modeloId, testData) => {
      try {
        return await mlApi.modelos.evaluar(modeloId, testData);
      } catch (error) {
        throw error;
      }
    },

    desplegar: async (modeloId) => {
      try {
        return await mlApi.modelos.desplegar(modeloId);
      } catch (error) {
        throw error;
      }
    },

    desactivar: async (modeloId) => {
      try {
        return await mlApi.modelos.desactivar(modeloId);
      } catch (error) {
        throw error;
      }
    },

    getMetrics: async (modeloId, params) => {
      try {
        return await mlApi.modelos.getMetrics(modeloId, params);
      } catch (error) {
        throw error;
      }
    },

    seleccionar: (modelo) =>
      set({ modelos: { ...get().modelos, seleccionado: modelo } })
  },

  // ==================== DATOS DE ENTRENAMIENTO ====================
  datosEntrenamiento: {
    items: [],
    loading: false,
    error: null,

    upload: async (file, metadata) => {
      set({ datosEntrenamiento: { ...get().datosEntrenamiento, loading: true } });
      try {
        const resultado = await mlApi.datosEntrenamiento.upload(file, metadata);
        set({ datosEntrenamiento: { ...get().datosEntrenamiento, loading: false } });
        return resultado;
      } catch (error) {
        set({ datosEntrenamiento: { ...get().datosEntrenamiento, loading: false } });
        throw error;
      }
    },

    fetch: async (params) => {
      set({ datosEntrenamiento: { ...get().datosEntrenamiento, loading: true, error: null } });
      try {
        const data = await mlApi.datosEntrenamiento.list(params);
        set({ datosEntrenamiento: { ...get().datosEntrenamiento, items: data, loading: false } });
        return data;
      } catch (error) {
        set({ datosEntrenamiento: { ...get().datosEntrenamiento, error: error.message, loading: false } });
        throw error;
      }
    },

    delete: async (id) => {
      try {
        await mlApi.datosEntrenamiento.delete(id);
        set({
          datosEntrenamiento: {
            ...get().datosEntrenamiento,
            items: get().datosEntrenamiento.items.filter((d) => d.id !== id)
          }
        });
      } catch (error) {
        throw error;
      }
    },

    preprocess: async (datasetId, config) => {
      try {
        return await mlApi.datosEntrenamiento.preprocess(datasetId, config);
      } catch (error) {
        throw error;
      }
    }
  },

  // ==================== ANALITICAS ====================
  analiticas: {
    dashboard: null,
    performance: null,
    historial: null,
    loading: false,

    loadDashboard: async () => {
      set({ analiticas: { ...get().analiticas, loading: true } });
      try {
        const dashboard = await mlApi.analiticas.getDashboardML();
        set({ analiticas: { ...get().analiticas, dashboard, loading: false } });
        return dashboard;
      } catch (error) {
        set({ analiticas: { ...get().analiticas, loading: false } });
        throw error;
      }
    },

    loadPerformance: async (params) => {
      set({ analiticas: { ...get().analiticas, loading: true } });
      try {
        const performance = await mlApi.analiticas.getModelPerformance(params);
        set({ analiticas: { ...get().analiticas, performance, loading: false } });
        return performance;
      } catch (error) {
        set({ analiticas: { ...get().analiticas, loading: false } });
        throw error;
      }
    },

    loadHistorial: async (params) => {
      set({ analiticas: { ...get().analiticas, loading: true } });
      try {
        const historial = await mlApi.analiticas.getPredictionHistory(params);
        set({ analiticas: { ...get().analiticas, historial, loading: false } });
        return historial;
      } catch (error) {
        set({ analiticas: { ...get().analiticas, loading: false } });
        throw error;
      }
    },

    exportReport: async (params) => {
      try {
        return await mlApi.analiticas.exportReport(params);
      } catch (error) {
        throw error;
      }
    }
  },

  // ==================== CONFIGURACION ====================
  configuracion: {
    data: null,
    loading: false,

    load: async () => {
      set({ configuracion: { ...get().configuracion, loading: true } });
      try {
        const data = await mlApi.configuracion.get();
        set({ configuracion: { ...get().configuracion, data, loading: false } });
        return data;
      } catch (error) {
        set({ configuracion: { ...get().configuracion, loading: false } });
        throw error;
      }
    },

    update: async (configData) => {
      try {
        const data = await mlApi.configuracion.update(configData);
        set({ configuracion: { ...get().configuracion, data } });
        return data;
      } catch (error) {
        throw error;
      }
    },

    reset: async () => {
      try {
        const data = await mlApi.configuracion.reset();
        set({ configuracion: { ...get().configuracion, data } });
        return data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Reset del store
  reset: () =>
    set({
      predicciones: { loading: false, error: null, resultados: null },
      modelos: { items: [], loading: false, error: null, seleccionado: null },
      datosEntrenamiento: { items: [], loading: false, error: null },
      analiticas: { dashboard: null, performance: null, historial: null, loading: false },
      configuracion: { data: null, loading: false }
    })
}));

export default useMLStore;
