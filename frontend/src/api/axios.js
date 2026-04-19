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

    // Contador de reintentos
    config.__retryCount = config.__retryCount || 0;

    // Manejo especial para rate limit (429)
    if (error.response?.status === 429) {
      const delayPromise = handleRateLimit(error);
      if (delayPromise && config.__retryCount < MAX_RETRIES) {
        await delayPromise;
        config.__retryCount++;
        return api(config);
      }
      
      // Si excedió reintentos o no hay retry-after, mostrar error amigable
      const message = 'Demasiadas solicitudes. Por favor espera unos momentos antes de intentar nuevamente.';
      error.userMessage = message;
      return Promise.reject(error);
    }

  if (!config.headers['x-request-id']) {
    config.headers['x-request-id'] = crypto.randomUUID();
  }

    // Lógica de reintento exponencial
    if (config.__retryCount < MAX_RETRIES) {
      const delay = calculateRetryDelay(config.__retryCount);
      config.__retryCount++;
      
      // Mostrar indicador de reintento (opcional)
      console.log(`Reintentando solicitud (${config.__retryCount}/${MAX_RETRIES}) en ${Math.round(delay)}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(config);
    }

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const wasAdmin = Boolean(localStorage.getItem('admin_token'));
      
      // Limpiar tokens
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_usuario');

      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        window.location.href = wasAdmin ? '/admin/login' : '/login';
      }
      
      error.userMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
    }

    // Manejo de errores 403 - Acceso denegado
    if (error.response?.status === 403) {
      error.userMessage = 'No tienes permisos para realizar esta acción.';
    }

    // Manejo de errores 500-503 - Error del servidor
    if (error.response?.status >= 500 && error.response?.status < 600) {
      error.userMessage = 'Error temporal del servidor. Por favor intenta nuevamente.';
    }

    // Manejo de timeout
    if (error.code === 'ECONNABORTED') {
      error.userMessage = 'La solicitud tardó demasiado. Por favor verifica tu conexión e intenta nuevamente.';
    }

    return Promise.reject(error);
  }
);

export default api;
