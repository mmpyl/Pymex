import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

/**
 * Hook personalizado para consultas de datos con React Query
 * Proporciona caching, reintentos automáticos, deduplicación y más
 */

/**
 * Fetcher genérico para peticiones GET
 */
const fetcher = async (url) => {
  const { data } = await api.get(url);
  return data;
};

/**
 * Hook para obtener datos con caching automático
 * @param {string} key - Clave única para la consulta
 * @param {string} url - Endpoint de la API
 * @param {Object} options - Opciones adicionales de React Query
 */
export const useFetch = (key, url, options = {}) => {
  return useQuery({
    queryKey: [key, url],
    queryFn: () => fetcher(url),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      // No reintentar errores 4xx
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
};

/**
 * Hook para mutaciones (POST, PUT, DELETE)
 * @param {string} key - Clave para invalidar consultas después de la mutación
 * @param {string} method - Método HTTP
 * @param {string} url - Endpoint de la API
 * @param {Object} options - Opciones adicionales
 */
export const useMutate = (key, method, url, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const config = {
        method,
        url,
      };
      
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        config.data = data;
      } else if (data) {
        config.params = data;
      }
      
      const response = await api(config);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidar consultas relacionadas
      if (key) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};

/**
 * Hooks específicos para operaciones comunes
 */
export const useCreate = (key, url, options) => 
  useMutate(key, 'POST', url, options);

export const useUpdate = (key, url, options) => 
  useMutate(key, 'PUT', url, options);

export const useDelete = (key, url, options) => 
  useMutate(key, 'DELETE', url, options);

export default { useFetch, useMutate, useCreate, useUpdate, useDelete };
