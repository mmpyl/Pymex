import { useEffect } from 'react';
import { useMLStore } from '../store/mlStore';

/**
 * Hook para manejar predicciones ML
 */
export const usePredicciones = () => {
  const { predicciones } = useMLStore();

  return {
    resultados: predicciones.resultados,
    loading: predicciones.loading,
    error: predicciones.error,
    predecirDemanda: predicciones.demanda,
    predecirVentas: predicciones.ventas,
    predecirInventario: predicciones.inventario,
    predecirChurn: predicciones.churn,
    obtenerRecomendaciones: predicciones.recomendaciones,
    clearResultados: predicciones.clearResultados
  };
};

/**
 * Hook para manejar modelos ML
 */
export const useModelosML = () => {
  const { modelos } = useMLStore();

  return {
    modelos: modelos.items,
    seleccionado: modelos.seleccionado,
    loading: modelos.loading,
    error: modelos.error,
    refresh: modelos.fetch,
    entrenar: modelos.entrenar,
    evaluar: modelos.evaluar,
    desplegar: modelos.desplegar,
    desactivar: modelos.desactivar,
    getMetrics: modelos.getMetrics,
    seleccionar: modelos.seleccionar
  };
};

/**
 * Hook para manejar datos de entrenamiento
 */
export const useDatosEntrenamiento = () => {
  const { datosEntrenamiento } = useMLStore();

  return {
    datos: datosEntrenamiento.items,
    loading: datosEntrenamiento.loading,
    error: datosEntrenamiento.error,
    upload: datosEntrenamiento.upload,
    refresh: datosEntrenamiento.fetch,
    delete: datosEntrenamiento.delete,
    preprocess: datosEntrenamiento.preprocess
  };
};

/**
 * Hook para manejar analíticas ML
 */
export const useAnaliticasML = () => {
  const { analiticas } = useMLStore();

  return {
    dashboard: analiticas.dashboard,
    performance: analiticas.performance,
    historial: analiticas.historial,
    loading: analiticas.loading,
    loadDashboard: analiticas.loadDashboard,
    loadPerformance: analiticas.loadPerformance,
    loadHistorial: analiticas.loadHistorial,
    exportReport: analiticas.exportReport
  };
};

/**
 * Hook para manejar configuración ML
 */
export const useConfigML = () => {
  const { configuracion } = useMLStore();

  return {
    config: configuracion.data,
    loading: configuracion.loading,
    load: configuracion.load,
    update: configuracion.update,
    reset: configuracion.reset
  };
};

export default {
  usePredicciones,
  useModelosML,
  useDatosEntrenamiento,
  useAnaliticasML,
  useConfigML
};
