import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  config.headers['x-request-id'] = crypto.randomUUID();
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
