import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Cliente API robusto con retry logic y manejo de rate limits
 */
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Configuración de reintentos
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo base

/**
 * Calcula el delay exponencial con jitter
 */
const calculateRetryDelay = (retryCount) => {
  const exponentialDelay = Math.pow(2, retryCount) * RETRY_DELAY;
  const jitter = Math.random() * 1000;
  return Math.min(exponentialDelay + jitter, 10000); // Máximo 10 segundos
};

/**
 * Verifica si el error es elegible para reintento
 */
const isRetryableError = (error) => {
  // No reintentar errores de configuración o cancelación
  if (!error.response && error.code !== 'ECONNABORTED') {
    return false;
  }
  
  // No reintentar errores de cliente (4xx) excepto 408, 409, 425, 429
  if (error.response) {
    const status = error.response.status;
    return [408, 409, 425, 429].includes(status);
  }
  
  // Reintentar errores de red o timeout
  return true;
};

/**
 * Maneja errores de rate limit (429)
 */
const handleRateLimit = (error) => {
  const retryAfter = error.response?.headers?.['retry-after'];
  if (retryAfter) {
    const delay = parseInt(retryAfter, 10) * 1000;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
  return null;
};

/**
 * Obtiene el token según el tipo de request
 */
const getToken = (url) => {
  const isAdminReq = url.startsWith('/admin') || url.startsWith('/payments');
  return isAdminReq 
    ? localStorage.getItem('admin_token') 
    : localStorage.getItem('token');
};

/**
 * Interceptor de request - Agrega autenticación y headers
 */
api.interceptors.request.use(
  (config) => {
    const token = getToken(config.url || '');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Agregar request ID para tracing
    if (!config.headers['x-request-id']) {
      config.headers['x-request-id'] = crypto.randomUUID();
    }

    // Prevenir cache en requests GET
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor de response - Maneja reintentos y errores
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Si no hay config, no podemos reintentar
    if (!config) {
      return Promise.reject(error);
    }

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

    // Verificar si es elegible para reintento
    if (!isRetryableError(error)) {
      return Promise.reject(error);
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

    // Manejo de errores 401 - Sesión expirada
    if (error.response?.status === 401) {
      const wasAdmin = Boolean(localStorage.getItem('admin_token'));
      
      // Limpiar tokens
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_usuario');

      // Redirigir al login si no estamos ya allí
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
