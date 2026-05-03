import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();

const normalizeBaseUrl = () => {
  if (!rawApiUrl) return '/api';

  try {
    const apiUrl = new URL(rawApiUrl, window.location.origin);
    const appUrl = new URL(window.location.origin);

    const isSameOriginAsFrontend = apiUrl.origin === appUrl.origin;
    const isLocalFrontendAlias = ['localhost', '127.0.0.1'].includes(apiUrl.hostname)
      && ['localhost', '127.0.0.1'].includes(appUrl.hostname)
      && apiUrl.port === appUrl.port;
    const hasApiPath = apiUrl.pathname.startsWith('/api');

    if ((isSameOriginAsFrontend || isLocalFrontendAlias) && !hasApiPath) {
      console.warn('[API] VITE_API_URL apunta al frontend. Usando /api para evitar 405.');
      return '/api';
    }

    return rawApiUrl;
  } catch {
    return rawApiUrl;
  }
};

const apiClient = axios.create({
  baseURL: normalizeBaseUrl(),
  timeout: 15000,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  config.headers['x-request-id'] = crypto.randomUUID();

  const adminToken = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
  const empresaToken = localStorage.getItem('empresa_token') || sessionStorage.getItem('empresa_token');
  const token = adminToken || empresaToken;

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/empresa/login') {
      window.location.href = '/empresa/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
