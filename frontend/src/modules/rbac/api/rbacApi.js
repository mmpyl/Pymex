import api from '../../../api/axios';

// ═══════════════════════════════════════════════════════════════════════════════
// API DE ROLES
// ═══════════════════════════════════════════════════════════════════════════════

export const rolesApi = {
  list: async () => {
    const { data } = await api.get('/rbac/roles');
    return data;
  },
  
  updatePermisos: async (rolId, permisos) => {
    const { data } = await api.put(`/rbac/roles/${rolId}/permisos`, { permisos });
    return data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// API DE PERMISOS
// ═══════════════════════════════════════════════════════════════════════════════

export const permisosApi = {
  list: async () => {
    const { data } = await api.get('/rbac/permisos');
    return data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// API DE USUARIOS
// ═══════════════════════════════════════════════════════════════════════════════

export const usuariosApi = {
  list: async () => {
    const { data } = await api.get('/rbac/usuarios');
    return data;
  },
  
  create: async (payload) => {
    const { data } = await api.post('/rbac/usuarios', payload);
    return data;
  },
  
  updateRol: async (usuarioId, rol_id) => {
    const { data } = await api.put(`/rbac/usuarios/${usuarioId}/rol`, { rol_id });
    return data;
  },
};
