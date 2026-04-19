

import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});

// Agregar token automáticamente en cada request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Si el token expira, redirigir al login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// frontend/src/api/axios.js
// FIX: interceptor de respuesta maneja TOKEN_EXPIRED intentando un refresh
// automático antes de redirigir al login. Evita desloguear usuarios con
// tokens caducados que tienen un refresh token válido.

// frontend/src/api/axios.js — versión consolidada (sin conflictos de merge)
// FIX: elimina el código de refresh incompleto (isRefreshing/failedQueue)
//      que nunca se completó porque el endpoint /auth/refresh no existe.
// FIX: el interceptor de request detecta rutas admin para usar admin_token.
// FIX: el 401 limpia AMBOS tokens (empresa + admin) antes de redirigir.
// FIX: usa VITE_API_URL (no URL hardcodeada).


import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true,
  timeout:         15000
});

// ─── Request: añadir token correcto según ruta ────────────────────────────────
api.interceptors.request.use((config) => {
  const url        = config.url || '';
  const isAdminReq = url.startsWith('/admin') || url.startsWith('/payments');

  const token = isAdminReq
    ? localStorage.getItem('admin_token')
    : localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Propagar request-id para trazabilidad
  if (!config.headers['x-request-id']) {
    config.headers['x-request-id'] = crypto.randomUUID();
  }

  return config;
});

// ─── Response: manejar 401/403 ────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar sesión y redirigir al login correspondiente
      const wasAdmin = Boolean(localStorage.getItem('admin_token'));

      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_usuario');

      // Evitar loop de redirección si ya estamos en login
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        window.location.href = wasAdmin ? '/admin/login' : '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

