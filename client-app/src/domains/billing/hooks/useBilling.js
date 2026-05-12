import { useEffect } from 'react';
import { useBillingStore } from '../store/billingStore';

/**
 * Hook para manejar facturas
 */
export const useFacturas = (initialParams = {}) => {
  const { facturas, fetch, getStats } = useBillingStore();

  useEffect(() => {
    fetch(initialParams);
  }, []);

  return {
    facturas: facturas.items,
    loading: facturas.loading,
    error: facturas.error,
    stats: facturas.stats,
    refresh: () => fetch(initialParams),
    loadStats: getStats
  };
};

/**
 * Hook para manejar pagos
 */
export const usePagos = (initialParams = {}) => {
  const { pagos, fetch, loadMetodosPago } = useBillingStore();

  useEffect(() => {
    fetch(initialParams);
  }, []);

  return {
    pagos: pagos.items,
    loading: pagos.loading,
    error: pagos.error,
    metodosPago: pagos.metodosPago,
    refresh: () => fetch(initialParams),
    loadMetodosPago
  };
};

/**
 * Hook para manejar suscripciones
 */
export const useSuscripciones = (initialParams = {}) => {
  const { suscripciones, fetch, loadPlanes } = useBillingStore();

  useEffect(() => {
    fetch(initialParams);
  }, []);

  return {
    suscripciones: suscripciones.items,
    loading: suscripciones.loading,
    error: suscripciones.error,
    planes: suscripciones.planes,
    refresh: () => fetch(initialParams),
    loadPlanes
  };
};

/**
 * Hook para manejar reportes de billing
 */
export const useReportesBilling = () => {
  const { reportes, getIngresos, getMorosidad, getFlujoCaja } = useBillingStore();

  return {
    ingresos: reportes.ingresos,
    morosidad: reportes.morosidad,
    flujoCaja: reportes.flujoCaja,
    loading: reportes.loading,
    loadIngresos: getIngresos,
    loadMorosidad: getMorosidad,
    loadFlujoCaja: getFlujoCaja
  };
};

export default {
  useFacturas,
  usePagos,
  useSuscripciones,
  useReportesBilling
};
