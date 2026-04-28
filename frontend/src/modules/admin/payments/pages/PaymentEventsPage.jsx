import React, { useState } from 'react';
import { usePaymentEvents } from '../hooks/usePaymentEvents';

/**
 * Página de administración para visualizar eventos de pagos de Stripe
 * 
 * Muestra una tabla con los eventos recibidos desde Stripe,
 * permitiendo filtrar por tipo, proveedor y buscar por event_id.
 */
const PaymentEventsPage = () => {
  const [searchEventId, setSearchEventId] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedProveedor, setSelectedProveedor] = useState('');
  
  const {
    events,
    loading,
    error,
    meta,
    changePage,
    updateFilters,
    clearFilters,
    refresh
  } = usePaymentEvents();

  // Tipos de eventos más comunes para el filtro
  const commonEventTypes = [
    'checkout.session.completed',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'customer.subscription.updated',
    'customer.subscription.deleted'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const filters = {};
    if (searchEventId) filters.event_id = searchEventId;
    if (selectedTipo) filters.tipo = selectedTipo;
    if (selectedProveedor) filters.proveedor = selectedProveedor;
    
    updateFilters(filters);
  };

  const handleClearFilters = () => {
    setSearchEventId('');
    setSelectedTipo('');
    setSelectedProveedor('');
    clearFilters();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (tipo) => {
    const colors = {
      'checkout.session.completed': 'bg-green-100 text-green-800',
      'payment_intent.succeeded': 'bg-blue-100 text-blue-800',
      'payment_intent.payment_failed': 'bg-red-100 text-red-800',
      'customer.subscription.updated': 'bg-yellow-100 text-yellow-800',
      'customer.subscription.deleted': 'bg-gray-100 text-gray-800'
    };
    return colors[tipo] || 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos de Pagos</h1>
          <p className="text-sm text-gray-600 mt-1">
            Visualiza y monitorea los eventos recibidos desde Stripe
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="event_id" className="block text-sm font-medium text-gray-700 mb-1">
              Event ID
            </label>
            <input
              type="text"
              id="event_id"
              value={searchEventId}
              onChange={(e) => setSearchEventId(e.target.value)}
              placeholder="evt_xxxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Evento
            </label>
            <select
              id="tipo"
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos los tipos</option>
              {commonEventTypes.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="proveedor" className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor
            </label>
            <select
              id="proveedor"
              value={selectedProveedor}
              onChange={(e) => setSelectedProveedor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              <option value="stripe">Stripe</option>
              <option value="mock">Mock</option>
            </select>
          </div>

          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Filtrar
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Error al cargar eventos</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Tabla de eventos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="ml-3 text-gray-600">Cargando eventos...</span>
                    </div>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No se encontraron eventos de pagos
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{event.event_id}</div>
                      <div className="text-xs text-gray-500">DB ID: {event.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.tipo)}`}>
                        {event.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 capitalize">{event.proveedor}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{formatDate(event.procesado_en)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => alert(JSON.stringify(event.payload, null, 2))}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Ver Payload
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {meta.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{meta.page}</span> de{' '}
              <span className="font-medium">{meta.totalPages}</span> páginas
              {' '}(<span className="font-medium">{meta.total}</span> eventos)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => changePage(meta.page - 1)}
                disabled={meta.page <= 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Anterior
              </button>
              <button
                onClick={() => changePage(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Los eventos se almacenan para garantizar idempotencia</li>
          <li>• Cada evento representa una notificación recibida desde Stripe</li>
          <li>• El payload completo está disponible haciendo clic en "Ver Payload"</li>
          <li>• Los eventos son procesados automáticamente por el sistema</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentEventsPage;
