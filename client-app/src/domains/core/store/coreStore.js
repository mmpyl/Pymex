import { create } from 'zustand';
import { coreApi } from '../api/coreApi';

/**
 * Store para el dominio CORE (admin-panel)
 * Maneja productos, clientes, ventas, inventario y configuración de empresa
 */
export const useCoreStore = create((set, get) => ({
  // ==================== PRODUCTOS ====================
  productos: {
    items: [],
    loading: false,
    error: null,
    total: 0,

    fetch: async (params = {}) => {
      set((state) => ({ productos: { ...state.productos, loading: true, error: null } }));
      try {
        const data = await coreApi.productos.list(params);
        set((state) => ({
          productos: {
            ...state.productos,
            items: data.items || data,
            total: data.total || data.length,
            loading: false
          }
        }));
        return data;
      } catch (error) {
        set((state) => ({
          productos: { ...state.productos, error: error.message, loading: false }
        }));
        throw error;
      }
    },

    getById: async (id) => {
      try {
        return await coreApi.productos.getById(id);
      } catch (error) {
        throw error;
      }
    },

    create: async (productoData) => {
      try {
        const nuevoProducto = await coreApi.productos.create(productoData);
        set((state) => ({
          productos: {
            ...state.productos,
            items: [nuevoProducto, ...state.productos.items]
          }
        }));
        return nuevoProducto;
      } catch (error) {
        throw error;
      }
    },

    update: async (id, productoData) => {
      try {
        const productoActualizado = await coreApi.productos.update(id, productoData);
        set((state) => ({
          productos: {
            ...state.productos,
            items: state.productos.items.map((p) =>
              p.id === id ? productoActualizado : p
            )
          }
        }));
        return productoActualizado;
      } catch (error) {
        throw error;
      }
    },

    delete: async (id) => {
      try {
        await coreApi.productos.delete(id);
        set((state) => ({
          productos: {
            ...state.productos,
            items: state.productos.items.filter((p) => p.id !== id)
          }
        }));
      } catch (error) {
        throw error;
      }
    },

    search: async (query) => {
      try {
        return await coreApi.productos.search(query);
      } catch (error) {
        throw error;
      }
    },

    getCategorias: async () => {
      try {
        return await coreApi.productos.getCategorias();
      } catch (error) {
        throw error;
      }
    },

    clearError: () =>
      set((state) => ({ productos: { ...state.productos, error: null } }))
  },

  // ==================== CLIENTES ====================
  clientes: {
    items: [],
    loading: false,
    error: null,
    total: 0,

    fetch: async (params = {}) => {
      set((state) => ({ clientes: { ...state.clientes, loading: true, error: null } }));
      try {
        const data = await coreApi.clientes.list(params);
        set((state) => ({
          clientes: {
            ...state.clientes,
            items: data.items || data,
            total: data.total || data.length,
            loading: false
          }
        }));
        return data;
      } catch (error) {
        set((state) => ({
          clientes: { ...state.clientes, error: error.message, loading: false }
        }));
        throw error;
      }
    },

    create: async (clienteData) => {
      try {
        const nuevoCliente = await coreApi.clientes.create(clienteData);
        set((state) => ({
          clientes: {
            ...state.clientes,
            items: [nuevoCliente, ...state.clientes.items]
          }
        }));
        return nuevoCliente;
      } catch (error) {
        throw error;
      }
    },

    update: async (id, clienteData) => {
      try {
        const clienteActualizado = await coreApi.clientes.update(id, clienteData);
        set((state) => ({
          clientes: {
            ...state.clientes,
            items: state.clientes.items.map((c) =>
              c.id === id ? clienteActualizado : c
            )
          }
        }));
        return clienteActualizado;
      } catch (error) {
        throw error;
      }
    },

    delete: async (id) => {
      try {
        await coreApi.clientes.delete(id);
        set((state) => ({
          clientes: {
            ...state.clientes,
            items: state.clientes.items.filter((c) => c.id !== id)
          }
        }));
      } catch (error) {
        throw error;
      }
    },

    search: async (query) => {
      try {
        return await coreApi.clientes.search(query);
      } catch (error) {
        throw error;
      }
    }
  },

  // ==================== VENTAS ====================
  ventas: {
    items: [],
    loading: false,
    error: null,
    stats: null,

    fetch: async (params = {}) => {
      set((state) => ({ ventas: { ...state.ventas, loading: true, error: null } }));
      try {
        const data = await coreApi.ventas.list(params);
        set((state) => ({
          ventas: {
            ...state.ventas,
            items: data.items || data,
            loading: false
          }
        }));
        return data;
      } catch (error) {
        set((state) => ({
          ventas: { ...state.ventas, error: error.message, loading: false }
        }));
        throw error;
      }
    },

    getStats: async (params = {}) => {
      try {
        const stats = await coreApi.ventas.getStats(params);
        set({ ventas: { ...get().ventas, stats } });
        return stats;
      } catch (error) {
        throw error;
      }
    },

    getDashboardMetrics: async () => {
      try {
        const metrics = await coreApi.ventas.getDashboardMetrics();
        set({ ventas: { ...get().ventas, stats: metrics } });
        return metrics;
      } catch (error) {
        throw error;
      }
    },

    create: async (ventaData) => {
      try {
        const nuevaVenta = await coreApi.ventas.create(ventaData);
        set((state) => ({
          ventas: {
            ...state.ventas,
            items: [nuevaVenta, ...state.ventas.items]
          }
        }));
        return nuevaVenta;
      } catch (error) {
        throw error;
      }
    },

    cancel: async (id, reason) => {
      try {
        await coreApi.ventas.cancel(id, reason);
        set((state) => ({
          ventas: {
            ...state.ventas,
            items: state.ventas.items.map((v) =>
              v.id === id ? { ...v, estado: 'cancelada' } : v
            )
          }
        }));
      } catch (error) {
        throw error;
      }
    }
  },

  // ==================== INVENTARIO ====================
  inventario: {
    movimientos: [],
    alertas: [],
    loading: false,

    getMovimientos: async (params = {}) => {
      set({ inventario: { ...get().inventario, loading: true } });
      try {
        const data = await coreApi.inventario.getMovimientos(params);
        set({
          inventario: { ...get().inventario, movimientos: data, loading: false }
        });
        return data;
      } catch (error) {
        set({ inventario: { ...get().inventario, loading: false } });
        throw error;
      }
    },

    getAlertas: async () => {
      try {
        const alertas = await coreApi.inventario.getAlertasStock();
        set({ inventario: { ...get().inventario, alertas } });
        return alertas;
      } catch (error) {
        throw error;
      }
    },

    ajustarStock: async (ajusteData) => {
      try {
        return await coreApi.inventario.ajustarStock(ajusteData);
      } catch (error) {
        throw error;
      }
    }
  },

  // ==================== EMPRESA ====================
  empresa: {
    profile: null,
    settings: null,
    loading: false,

    loadProfile: async () => {
      set({ empresa: { ...get().empresa, loading: true } });
      try {
        const profile = await coreApi.empresa.getProfile();
        set({ empresa: { ...get().empresa, profile, loading: false } });
        return profile;
      } catch (error) {
        set({ empresa: { ...get().empresa, loading: false } });
        throw error;
      }
    },

    updateProfile: async (empresaData) => {
      try {
        const profile = await coreApi.empresa.updateProfile(empresaData);
        set({ empresa: { ...get().empresa, profile } });
        return profile;
      } catch (error) {
        throw error;
      }
    },

    loadSettings: async () => {
      try {
        const settings = await coreApi.empresa.getSettings();
        set({ empresa: { ...get().empresa, settings } });
        return settings;
      } catch (error) {
        throw error;
      }
    },

    updateSettings: async (settingsData) => {
      try {
        const settings = await coreApi.empresa.updateSettings(settingsData);
        set({ empresa: { ...get().empresa, settings } });
        return settings;
      } catch (error) {
        throw error;
      }
    }
  },

  // Reset del store
  reset: () =>
    set({
      productos: { items: [], loading: false, error: null, total: 0 },
      clientes: { items: [], loading: false, error: null, total: 0 },
      ventas: { items: [], loading: false, error: null, stats: null },
      inventario: { movimientos: [], alertas: [], loading: false },
      empresa: { profile: null, settings: null, loading: false }
    })
}));

export default useCoreStore;
