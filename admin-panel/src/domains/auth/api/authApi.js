/**
 * API Service para el dominio AUTH
 * Maneja todas las llamadas HTTP relacionadas con autenticación y autorización
 */
import api from '../../../api/axios';

export const authApi = {
  // Autenticación de Empresa
  loginEmpresa: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  registerEmpresa: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  logoutEmpresa: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Autenticación de Admin
  loginAdmin: async (credentials) => {
    const response = await api.post('/auth/admin/login', credentials);
    return response.data;
  },

  logoutAdmin: async () => {
    const response = await api.post('/auth/admin/logout');
    return response.data;
  },

  getAdminProfile: async () => {
    const response = await api.get('/auth/admin/profile');
    return response.data;
  },

  // RBAC - Roles y Permisos
  getRoles: async () => {
    const response = await api.get('/rbac/roles');
    return response.data;
  },

  createRole: async (roleData) => {
    const response = await api.post('/rbac/roles', roleData);
    return response.data;
  },

  updateRole: async (roleId, roleData) => {
    const response = await api.put(`/rbac/roles/${roleId}`, roleData);
    return response.data;
  },

  deleteRole: async (roleId) => {
    const response = await api.delete(`/rbac/roles/${roleId}`);
    return response.data;
  },

  getPermissions: async () => {
    const response = await api.get('/rbac/permissions');
    return response.data;
  },

  assignRoleToUser: async (userId, roleId) => {
    const response = await api.post('/rbac/users/assign-role', { userId, roleId });
    return response.data;
  },

  removeRoleFromUser: async (userId, roleId) => {
    const response = await api.delete(`/rbac/users/remove-role`, { data: { userId, roleId } });
    return response.data;
  },

  getUserPermissions: async (userId) => {
    const response = await api.get(`/rbac/users/${userId}/permissions`);
    return response.data;
  }
};

export default authApi;
