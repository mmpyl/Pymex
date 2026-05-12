import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '../api/authApi';

/**
 * Store de autenticación para admin-panel
 * Maneja el estado de sesión de administradores y empresas
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado de Admin
      admin: null,
      adminToken: null,
      isAdminAuthenticated: false,

      // Estado de Empresa
      empresa: null,
      empresaToken: null,
      isEmpresaAuthenticated: false,

      // Estado general
      isLoading: false,
      error: null,

      // Acciones de Admin
      loginAdmin: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.loginAdmin(credentials);
          localStorage.setItem('admin_token', data.token);
          set({
            admin: data.admin,
            adminToken: data.token,
            isAdminAuthenticated: true,
            isLoading: false
          });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logoutAdmin: async () => {
        try {
          await authApi.logoutAdmin();
        } catch (error) {
          console.error('Error al cerrar sesión de admin:', error);
        } finally {
          localStorage.removeItem('admin_token');
          sessionStorage.removeItem('admin_token');
          set({
            admin: null,
            adminToken: null,
            isAdminAuthenticated: false
          });
        }
      },

      loadAdminProfile: async () => {
        set({ isLoading: true });
        try {
          const data = await authApi.getAdminProfile();
          set({ admin: data, isAdminAuthenticated: true, isLoading: false });
          return data;
        } catch (error) {
          set({ isAdminAuthenticated: false, isLoading: false });
          throw error;
        }
      },

      // Acciones de Empresa
      loginEmpresa: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.loginEmpresa(credentials);
          localStorage.setItem('empresa_token', data.token);
          set({
            empresa: data.usuario,
            empresaToken: data.token,
            isEmpresaAuthenticated: true,
            isLoading: false
          });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      registerEmpresa: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authApi.registerEmpresa(data);
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logoutEmpresa: async () => {
        try {
          await authApi.logoutEmpresa();
        } catch (error) {
          console.error('Error al cerrar sesión de empresa:', error);
        } finally {
          localStorage.removeItem('empresa_token');
          sessionStorage.removeItem('empresa_token');
          set({
            empresa: null,
            empresaToken: null,
            isEmpresaAuthenticated: false
          });
        }
      },

      loadEmpresaProfile: async () => {
        set({ isLoading: true });
        try {
          const data = await authApi.getProfile();
          set({ empresa: data, isEmpresaAuthenticated: true, isLoading: false });
          return data;
        } catch (error) {
          set({ isEmpresaAuthenticated: false, isLoading: false });
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const data = await authApi.refreshToken();
          if (get().isAdminAuthenticated) {
            localStorage.setItem('admin_token', data.token);
            set({ adminToken: data.token });
          } else if (get().isEmpresaAuthenticated) {
            localStorage.setItem('empresa_token', data.token);
            set({ empresaToken: data.token });
          }
          return data;
        } catch (error) {
          get().logoutAdmin();
          get().logoutEmpresa();
          throw error;
        }
      },

      // Acciones RBAC
      getRoles: async () => {
        return await authApi.getRoles();
      },

      createRole: async (roleData) => {
        return await authApi.createRole(roleData);
      },

      updateRole: async (roleId, roleData) => {
        return await authApi.updateRole(roleId, roleData);
      },

      deleteRole: async (roleId) => {
        return await authApi.deleteRole(roleId);
      },

      getPermissions: async () => {
        return await authApi.getPermissions();
      },

      assignRoleToUser: async (userId, roleId) => {
        return await authApi.assignRoleToUser(userId, roleId);
      },

      removeRoleFromUser: async (userId, roleId) => {
        return await authApi.removeRoleFromUser(userId, roleId);
      },

      getUserPermissions: async (userId) => {
        return await authApi.getUserPermissions(userId);
      },

      // Utilidades
      clearError: () => set({ error: null }),

      // Reset completo del estado
      reset: () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('empresa_token');
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('empresa_token');
        set({
          admin: null,
          adminToken: null,
          isAdminAuthenticated: false,
          empresa: null,
          empresaToken: null,
          isEmpresaAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        admin: state.admin,
        adminToken: state.adminToken,
        isAdminAuthenticated: state.isAdminAuthenticated,
        empresa: state.empresa,
        empresaToken: state.empresaToken,
        isEmpresaAuthenticated: state.isEmpresaAuthenticated
      })
    }
  )
);

export default useAuthStore;
