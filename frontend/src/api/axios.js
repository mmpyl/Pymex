import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 500;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000
});

const calculateRetryDelay = (retryCount) => {
  return BASE_RETRY_DELAY_MS * 2 ** retryCount;
};

const getRetryAfterDelay = (error) => {
  const retryAfter = error.response?.headers?.['retry-after'];
  if (!retryAfter) return null;

  const retryAfterSeconds = Number(retryAfter);
  if (Number.isNaN(retryAfterSeconds)) return null;

  return retryAfterSeconds * 1000;
};

api.interceptors.request.use((config) => {
  if (!config.headers['x-request-id']) {
    config.headers['x-request-id'] = crypto.randomUUID();
  }

  config.__retryCount = config.__retryCount || 0;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};

    if (error.response?.status === 429) {
      if (config.__retryCount < MAX_RETRIES) {
        const retryAfterDelay = getRetryAfterDelay(error);
        const backoffDelay = calculateRetryDelay(config.__retryCount);
        const delay = retryAfterDelay ?? backoffDelay;

        config.__retryCount += 1;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }

      error.userMessage = 'Demasiadas solicitudes. Espera un momento e inténtalo nuevamente.';
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAdminArea = currentPath.startsWith('/admin') || currentPath.startsWith('/staff');

      if (!currentPath.includes('/login')) {
        window.location.href = isAdminArea ? '/staff/login' : '/empresa/login';
      }

      error.userMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
    }

    if (error.response?.status === 403) {
      error.userMessage = 'No tienes permisos para realizar esta acción.';
    }

    if (error.response?.status >= 500 && error.response?.status < 600) {
      error.userMessage = 'Error temporal del servidor. Por favor intenta nuevamente.';
    }

    if (error.code === 'ECONNABORTED') {
      error.userMessage = 'La solicitud tardó demasiado. Verifica tu conexión e intenta nuevamente.';
    }

    return Promise.reject(error);
  }
);

export default api;
