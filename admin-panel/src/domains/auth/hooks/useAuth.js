import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Hook para manejar la autenticación de administradores
 */
export const useAdminAuth = () => {
  const {
    admin,
    adminToken,
    isAdminAuthenticated,
    isLoading,
    error,
    loginAdmin,
    logoutAdmin,
    loadAdminProfile,
    clearError
  } = useAuthStore();

  // Cargar perfil al montar si hay token pero no hay datos
  useEffect(() => {
    if (adminToken && !admin && !isLoading) {
      loadAdminProfile().catch(() => {});
    }
  }, [adminToken, admin, isLoading, loadAdminProfile]);

  return {
    admin,
    adminToken,
    isAuthenticated: isAdminAuthenticated,
    isLoading,
    error,
    login: loginAdmin,
    logout: logoutAdmin,
    loadProfile: loadAdminProfile,
    clearError
  };
};

/**
 * Hook para manejar la autenticación de empresas
 */
export const useEmpresaAuth = () => {
  const {
    empresa,
    empresaToken,
    isEmpresaAuthenticated,
    isLoading,
    error,
    loginEmpresa,
    logoutEmpresa,
    loadEmpresaProfile,
    registerEmpresa,
    refreshToken,
    clearError
  } = useAuthStore();

  // Cargar perfil al montar si hay token pero no hay datos
  useEffect(() => {
    if (empresaToken && !empresa && !isLoading) {
      loadEmpresaProfile().catch(() => {});
    }
  }, [empresaToken, empresa, isLoading, loadEmpresaProfile]);

  return {
    empresa,
    empresaToken,
    isAuthenticated: isEmpresaAuthenticated,
    isLoading,
    error,
    login: loginEmpresa,
    logout: logoutEmpresa,
    register: registerEmpresa,
    loadProfile: loadEmpresaProfile,
    refreshToken,
    clearError
  };
};

/**
 * Hook para manejar RBAC (Roles y Permisos)
 */
export const useRBAC = () => {
  const {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getPermissions,
    assignRoleToUser,
    removeRoleFromUser,
    getUserPermissions
  } = useAuthStore();

  return {
    roles: {
      list: getRoles,
      create: createRole,
      update: updateRole,
      delete: deleteRole
    },
    permissions: {
      list: getPermissions
    },
    userRoles: {
      assign: assignRoleToUser,
      remove: removeRoleFromUser,
      getPermissions: getUserPermissions
    }
  };
};

/**
 * Hook para verificar permisos específicos
 */
export const useHasPermission = (permissionName) => {
  const { empresa, getUserPermissions } = useRBAC();
  
  const checkPermission = async (userId) => {
    if (!userId || !empresa?.id) return false;
    
    try {
      const permissions = await getUserPermissions(empresa.id);
      return permissions.some(p => p.nombre === permissionName);
    } catch {
      return false;
    }
  };

  return { checkPermission };
};

export default { useAdminAuth, useEmpresaAuth, useRBAC, useHasPermission };
