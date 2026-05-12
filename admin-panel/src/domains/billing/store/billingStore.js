import { create } from 'zustand';
import { billingApi } from '../api/billingApi';

/**
 * Store para el dominio BILLING (admin-panel)
 * Maneja facturas, pagos, suscripciones y reportes financieros
 */
export const useBillingStore = create((set, get) => ({
  // ==================== FACTURAS ====================
  facturas: {
    items: [],
    loading: false,
    error: null,
    stats: null,

    fetch: async (params = {}) => {
      set((state) => ({ facturas: { ...state.facturas, loading: true, error: null } }));
      try {
        const data = await billingApi.facturas.list(params);
        set((state) => ({
          facturas: {
            ...state.facturas,
            items: data.items || data,
            loading: false
          }
        }));
        return data;
      } catch (error) {
        set((state) => ({
          facturas: { ...state.facturas, error: error.message, loading: false }
        }));
        throw error;
      }
    },

    getById: async (id) => {
      try {
        return await billingApi.facturas.getById(id);
      } catch (error) {
        throw error;
      }
    },

    create: async (facturaData) => {
      try {
        const factura = await billingApi.facturas.create(facturaData);
        set((state) => ({
          facturas: {
            ...state.facturas,
            items: [factura, ...state.facturas.items]
          }
        }));
        return factura;
      } catch (error) {
        throw error;
      }
    },

    update: async (id, facturaData) => {
      try {
        const factura = await billingApi.facturas.update(id, facturaData);
        set((state) => ({
          facturas: {
            ...state.facturas,
            items: state.facturas.items.map((f) =>
              f.id === id ? factura : f
            )
          }
        }));
        return factura;
      } catch (error) {
        throw error;
      }
    },

    delete: async (id) => {
      try {
        await billingApi.facturas.delete(id);
        set((state) => ({
          facturas: {
            ...state.facturas,
            items: state.facturas.items.filter((f) => f.id !== id)
          }
        }));
      } catch (error) {
        throw error;
      }
    },

    enviarPorEmail: async (id, emailData) => {
      try {
        return await billingApi.facturas.enviarPorEmail(id, emailData);
      } catch (error) {
        throw error;
      }
    },

    descargarPDF: async (id) => {
      try {
        return await billingApi.facturas.descargarPDF(id);
      } catch (error) {
        throw error;
      }
    },

    getStats: async (params = {}) => {
      try {
        const stats = await billingApi.facturas.getStats(params);
        set({ facturas: { ...get().facturas, stats } });
        return stats;
      } catch (error) {
        throw error;
      }
    }
  },

  // ==================== PAGOS ====================
  pagos: {
    items: [],
    loading: false,
    error: null,
    metodosPago: [],

    fetch: async (params = {}) => {
      set((state) => ({ pagos: { ...state.pagos, loading: true, error: null } }));
      try {
        const data = await billingApi.pagos.list(params);
        set((state) => ({
          pagos: {
            ...state.pagos,
            items: data.items || data,
            loading: false
          }
        }));
        return data;
      } catch (error) {
        set((state) => ({
          pagos: { ...state.pagos, error: error.message, loading: false }
        }));
        throw error;
      }
    },

    registrar: async (pagoData) => {
      try {
        const pago = await billingApi.pagos.registrar(pagoData);
        set((state) => ({
          pagos: {
            ...state.pagos,
            items: [pago, ...state.pagos.items]
          }
        }));
        return pago;
      } catch (error) {
        throw error;
      }
    },

    procesar: async (id, pagoData) => {
      try {
        return await billingApi.pagos.procesar(id, pagoData);
      } catch (error) {
        throw error;
      }
    },

    revertir: async (id, reason) => {
      try {
        return await billingApi.pagos.revertir(id, reason);
      } catch (error) {
        throw error;
      }
    },

    loadMetodosPago: async () => {
      try {
        const metodos = await billingApi.pagos.getMetodosPago();
        set({ pagos: { ...get().pagos, metodosPago: metodos } });
        return metodos;
      } catch (error) {
        throw error;
      }
    }
  },

  // ==================== SUSCRIPCIONES ====================
  suscripciones: {
    items: [],
    loading: false,
    error: null,
    planes: [],

    fetch: async (params = {}) => {
      set((state) => ({ suscripciones: { ...state.suscripciones, loading: true, error: null } }));
      try {
        const data = await billingApi.suscripciones.list(params);
        set((state) => ({
          suscripciones: {
            ...state.suscripciones,
            items: data.items || data,
            loading: false
          }
        }));
        return data;
      } catch (error) {
        set((state) => ({
          suscripciones: { ...state.suscripciones, error: error.message, loading: false }
        }));
        throw error;
      }
    },

    crear: async (suscripcionData) => {
      try {
        const suscripcion = await billingApi.suscripciones.crear(suscripcionData);
        set((state) => ({
          suscripciones: {
            ...state.suscripciones,
            items: [suscripcion, ...state.suscripciones.items]
          }
        }));
        return suscripcion;
      } catch (error) {
        throw error;
      }
    },

    cancelar: async (id, reason) => {
      try {
        return await billingApi.suscripciones.cancelar(id, reason);
      } catch (error) {
        throw error;
      }
    },

    reactivar: async (id) => {
      try {
        return await billingApi.suscripciones.reactivar(id);
      } catch (error) {
        throw error;
      }
    },

    actualizarPlan: async (id, planData) => {
      try {
        return await billingApi.suscripciones.actualizarPlan(id, planData);
      } catch (error) {
        throw error;
      }
    },

    loadPlanes: async () => {
      try {
        const planes = await billingApi.suscripciones.getPlanes();
        set({ suscripciones: { ...get().suscripciones, planes } });
        return planes;
      } catch (error) {
        throw error;
      }
    }
  },

  // ==================== REPORTES ====================
  reportes: {
    ingresos: null,
    morosidad: null,
    flujoCaja: null,
    loading: false,

    getIngresos: async (params = {}) => {
      set({ reportes: { ...get().reportes, loading: true } });
      try {
        const data = await billingApi.reportes.getIngresos(params);
        set({ reportes: { ...get().reportes, ingresos: data, loading: false } });
        return data;
      } catch (error) {
        set({ reportes: { ...get().reportes, loading: false } });
        throw error;
      }
    },

    getMorosidad: async (params = {}) => {
      set({ reportes: { ...get().reportes, loading: true } });
      try {
        const data = await billingApi.reportes.getMorosidad(params);
        set({ reportes: { ...get().reportes, morosidad: data, loading: false } });
        return data;
      } catch (error) {
        set({ reportes: { ...get().reportes, loading: false } });
        throw error;
      }
    },

    getFlujoCaja: async (params = {}) => {
      set({ reportes: { ...get().reportes, loading: true } });
      try {
        const data = await billingApi.reportes.getFlujoCaja(params);
        set({ reportes: { ...get().reportes, flujoCaja: data, loading: false } });
        return data;
      } catch (error) {
        set({ reportes: { ...get().reportes, loading: false } });
        throw error;
      }
    }
  },

  // Reset del store
  reset: () =>
    set({
      facturas: { items: [], loading: false, error: null, stats: null },
      pagos: { items: [], loading: false, error: null, metodosPago: [] },
      suscripciones: { items: [], loading: false, error: null, planes: [] },
      reportes: { ingresos: null, morosidad: null, flujoCaja: null, loading: false }
    })
}));

export default useBillingStore;
