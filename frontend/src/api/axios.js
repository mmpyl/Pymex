import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const url = config.url || '';
  const isAdminReq = url.startsWith('/admin') || url.startsWith('/payments');

  const token = isAdminReq
    ? localStorage.getItem('admin_token')
    : localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!config.headers['x-request-id']) {
    config.headers['x-request-id'] = crypto.randomUUID();
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const wasAdmin = Boolean(localStorage.getItem('admin_token'));

      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_usuario');

      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        window.location.href = wasAdmin ? '/admin/login' : '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
