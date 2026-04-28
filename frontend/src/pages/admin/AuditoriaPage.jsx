import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

const AuditoriaPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ tipo: '', limite: 200 });
  const [auditHealth, setAuditHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  
  const loadAuditHealth = async () => {
    try {
      setHealthLoading(true);
      const response = await apiClient.get('/admin/audit/health');
      setAuditHealth(response.data);
    } catch (error) {
      console.error('Error loading audit health:', error);
    } finally {
      setHealthLoading(false);
    }
  };
  
  const handleResetAudit = async () => {
    if (!window.confirm('¿Está seguro de que desea resetear todos los logs de auditoría? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      const response = await apiClient.get('/admin/audit/health?action=reset');
      toast.success(response.data.message || 'Logs reseteados correctamente');
      loadAuditHealth();
      loadLogs();
    } catch (error) {
      console.error('Error resetting audit logs:', error);
      toast.error(error.response?.data?.error || 'Error al resetear logs');
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.limite) params.append('limit', filter.limite);
      const response = await apiClient.get(`/super-admin/auditoria?${params}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Error al cargar logs de auditoría');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    loadAuditHealth();
  }, []);

  const getTipoColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'login': return 'bg-purple-100 text-purple-800';
      case 'logout': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Auditoría del Sistema</h1>
        <p className="text-gray-600 mt-1">Logs y trazas de actividad del sistema</p>
      </div>

      {/* Health Status Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Estado de Salud del Audit Log</h2>
          {healthLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : null}
        </div>
        
        {auditHealth && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{auditHealth.total_logs?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Últimas 24h</p>
                <p className="text-2xl font-bold text-blue-600">{auditHealth.logs_24h?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Últimos 7 días</p>
                <p className="text-2xl font-bold text-indigo-600">{auditHealth.logs_7d?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Estado</p>
                <div className="flex items-center mt-1">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    auditHealth.health_status === 'healthy' ? 'bg-green-500' :
                    auditHealth.health_status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></span>
                  <span className={`text-lg font-semibold ${
                    auditHealth.health_status === 'healthy' ? 'text-green-600' :
                    auditHealth.health_status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {auditHealth.health_status === 'healthy' ? 'Saludable' :
                     auditHealth.health_status === 'warning' ? 'Advertencia' : 'Crítico'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{auditHealth.health_message}</p>
              <button
                onClick={handleResetAudit}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Resetear Logs
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mt-2">Última actualización: {new Date(auditHealth.last_updated).toLocaleString()}</p>
          </>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Evento</label>
            <select
              value={filter.tipo}
              onChange={(e) => setFilter({ ...filter, tipo: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="create">Creación</option>
              <option value="update">Actualización</option>
              <option value="delete">Eliminación</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Límite</label>
            <select
              value={filter.limite}
              onChange={(e) => setFilter({ ...filter, limite: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadLogs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Logs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.fecha).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipoColor(log.tipo_operacion)}`}>
                      {log.tipo_operacion || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.entidad_afectada || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.Usuario?.nombre || log.usuario_email || 'Sistema'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.Empresa?.nombre || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                    {log.descripcion || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ip_origen || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Logs</p>
          <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Creaciones</p>
          <p className="text-2xl font-bold text-green-600">
            {logs.filter(l => l.tipo_operacion === 'create').length}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Actualizaciones</p>
          <p className="text-2xl font-bold text-blue-600">
            {logs.filter(l => l.tipo_operacion === 'update').length}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Eliminaciones</p>
          <p className="text-2xl font-bold text-red-600">
            {logs.filter(l => l.tipo_operacion === 'delete').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditoriaPage;
