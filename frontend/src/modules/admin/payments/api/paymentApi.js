/**
 * API de pagos para el módulo de administración
 * 
 * Proporciona métodos para interactuar con los endpoints
 * de eventos de pagos del backend.
 */

import apiClient from '../../../../services/apiClient';

const BASE_URL = '/api/payments';

/**
 * Obtiene la lista de eventos de pagos con paginación y filtros
 * @param {Object} params - Parámetros de consulta
 * @param {number} params.page - Número de página
 * @param {number} params.pageSize - Tamaño de página
 * @param {string} params.proveedor - Filtrar por proveedor
 * @param {string} params.tipo - Filtrar por tipo de evento
 * @param {string} params.event_id - Filtrar por ID de evento
 * @returns {Promise<Object>}
 */
export const getPaymentEvents = async (params = {}) => {
  const response = await apiClient.get(`${BASE_URL}/events`, { params });
  return response.data;
};

/**
 * Obtiene un evento de pago específico por su ID
 * @param {number} id - ID del evento
 * @returns {Promise<Object>}
 */
export const getPaymentEventById = async (id) => {
  const response = await apiClient.get(`${BASE_URL}/events/${id}`);
  return response.data;
};

/**
 * Obtiene el health check del servicio de webhooks
 * @returns {Promise<Object>}
 */
export const getWebhookHealth = async () => {
  const response = await apiClient.get(`${BASE_URL}/webhook/health`);
  return response.data;
};

export default {
  getPaymentEvents,
  getPaymentEventById,
  getWebhookHealth
};
