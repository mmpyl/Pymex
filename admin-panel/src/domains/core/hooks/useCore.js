import { useEffect, useState } from 'react';
import { useCoreStore } from '../store/coreStore';

/**
 * Hook para manejar productos
 */
export const useProductos = (initialParams = {}) => {
  const { productos, fetch, search, getCategorias } = useCoreStore();
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetch(initialParams);
  }, []);

  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => {});
  }, []);

  return {
    productos: productos.items,
    loading: productos.loading,
    error: productos.error,
    total: productos.total,
    categorias,
    refresh: () => fetch(initialParams),
    searchProductos: search,
    clearError: () => useCoreStore.getState().productos.clearError()
  };
};

/**
 * Hook para manejar clientes
 */
export const useClientes = (initialParams = {}) => {
  const { clientes, fetch, search } = useCoreStore();

  useEffect(() => {
    fetch(initialParams);
  }, []);

  return {
    clientes: clientes.items,
    loading: clientes.loading,
    error: clientes.error,
    total: clientes.total,
    refresh: () => fetch(initialParams),
    searchClientes: search,
    clearError: () => useCoreStore.getState().clientes.clearError()
  };
};

/**
 * Hook para manejar ventas
 */
export const useVentas = (initialParams = {}) => {
  const { ventas, fetch, getStats, getDashboardMetrics } = useCoreStore();

  useEffect(() => {
    fetch(initialParams);
  }, []);

  return {
    ventas: ventas.items,
    loading: ventas.loading,
    error: ventas.error,
    stats: ventas.stats,
    refresh: () => fetch(initialParams),
    loadStats: getStats,
    loadDashboardMetrics: getDashboardMetrics
  };
};

/**
 * Hook para manejar inventario
 */
export const useInventario = () => {
  const { inventario, getMovimientos, getAlertas, ajustarStock } = useCoreStore();

  return {
    movimientos: inventario.movimientos,
    alertas: inventario.alertas,
    loading: inventario.loading,
    refreshMovimientos: getMovimientos,
    refreshAlertas: getAlertas,
    ajustarStock
  };
};

/**
 * Hook para manejar perfil de empresa
 */
export const useEmpresaProfile = () => {
  const { empresa, loadProfile, updateProfile, loadSettings, updateSettings } =
    useCoreStore();

  return {
    profile: empresa.profile,
    settings: empresa.settings,
    loading: empresa.loading,
    refreshProfile: loadProfile,
    updateProfile,
    refreshSettings: loadSettings,
    updateSettings
  };
};

export default {
  useProductos,
  useClientes,
  useVentas,
  useInventario,
  useEmpresaProfile
};
