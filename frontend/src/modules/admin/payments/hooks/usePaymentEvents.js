import { useState, useEffect, useCallback } from 'react';
import paymentApi from '../api/paymentApi';

/**
 * Hook personalizado para gestionar la carga de eventos de pagos
 * 
 * @param {Object} options - Opciones del hook
 * @param {Object} options.filters - Filtros iniciales
 * @param {number} options.pageSize - Tamaño de página por defecto
 * @returns {Object}
 */
export const usePaymentEvents = (options = {}) => {
  const { filters: initialFilters = {}, pageSize: initialPageSize = 20 } = options;
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState(initialFilters);

  /**
   * Carga los eventos de pagos desde el backend
   */
  const loadEvents = useCallback(async (page = 1, customFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const currentFilters = { ...filters, ...customFilters };
      const response = await paymentApi.getPaymentEvents({
        page,
        pageSize: meta.pageSize,
        ...currentFilters
      });
      
      setEvents(response.data || []);
      setMeta(prev => ({
        ...prev,
        page: response.meta?.page || page,
        total: response.meta?.total || 0,
        totalPages: response.meta?.totalPages || 0
      }));
    } catch (err) {
      setError(err.message || 'Error al cargar eventos de pagos');
      console.error('Error loading payment events:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, meta.pageSize]);

  /**
   * Cambia la página actual
   */
  const changePage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      loadEvents(newPage);
    }
  }, [loadEvents, meta.totalPages]);

  /**
   * Actualiza los filtros y recarga los datos
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    loadEvents(1, newFilters);
  }, [loadEvents]);

  /**
   * Limpia todos los filtros
   */
  const clearFilters = useCallback(() => {
    setFilters({});
    loadEvents(1, {});
  }, [loadEvents]);

  /**
   * Recarga los eventos manualmente
   */
  const refresh = useCallback(() => {
    loadEvents(meta.page, filters);
  }, [loadEvents, meta.page, filters]);

  // Carga inicial
  useEffect(() => {
    loadEvents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    events,
    loading,
    error,
    meta,
    filters,
    loadEvents,
    changePage,
    updateFilters,
    clearFilters,
    refresh
  };
};

/**
 * Hook para obtener un evento específico por ID
 * 
 * @param {number|null} eventId - ID del evento a cargar
 * @returns {Object}
 */
export const usePaymentEvent = (eventId) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      return;
    }

    const loadEvent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await paymentApi.getPaymentEventById(eventId);
        setEvent(data);
      } catch (err) {
        setError(err.message || 'Error al cargar evento');
        console.error('Error loading payment event:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  return {
    event,
    loading,
    error,
    refresh: () => {
      if (eventId) {
        setEvent(null);
        return paymentApi.getPaymentEventById(eventId).then(setEvent);
      }
      return Promise.resolve();
    }
  };
};

export default {
  usePaymentEvents,
  usePaymentEvent
};
