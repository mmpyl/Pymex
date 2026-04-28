import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

const SuscripcionesPage = () => {
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planes, setPlanes] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const loadSuscripciones = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/super-admin/suscripciones');
      setSuscripciones(response.data);
    } catch (error) {
      console.error('Error loading suscripciones:', error);
      toast.error('Error al cargar suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const loadPlanes = async () => {
    try {
      const response = await apiClient.get('/super-admin/planes');
      setPlanes(response.data);
    } catch (error) {
      console.error('Error loading planes:', error);
    }
  };

  useEffect(() => {
    loadSuscripciones();
    loadPlanes();
  }, []);

  const handleChangePlan = async (suscripcionId, nuevoPlanId) => {
    try {
      await apiClient.patch(`/super-admin/suscripciones/${suscripcionId}/plan`, { plan_id: nuevoPlanId });
      toast.success('Plan cambiado correctamente');
      loadSuscripciones();
    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error('Error al cambiar plan');
    }
  };

  const handleSuspender = async (suscripcionId) => {
    if (!window.confirm('¿Está seguro de suspender esta suscripción?')) return;
    try {
      await apiClient.patch(`/super-admin/suscripciones/${suscripcionId}/suspender`);
      toast.success('Suscripción suspendida correctamente');
      loadSuscripciones();
    } catch (error) {
      console.error('Error suspending subscription:', error);
      toast.error('Error al suspender suscripción');
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'activa': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'suspendida': return 'bg-yellow-100 text-yellow-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
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
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Suscripciones</h1>
        <p className="text-gray-600 mt-1">Administra las suscripciones activas y planes</p>
      </div>

      {/* Tabla de Suscripciones */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Actual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Fin</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suscripciones.map((suscripcion) => (
                <tr key={suscripcion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{suscripcion.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {suscripcion.Empresa?.nombre || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {suscripcion.Plan?.nombre || 'Sin plan'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(suscripcion.estado)}`}>
                      {suscripcion.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(suscripcion.fecha_inicio).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {suscripcion.fecha_fin ? new Date(suscripcion.fecha_fin).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <select
                      value={suscripcion.plan_id || ''}
                      onChange={(e) => handleChangePlan(suscripcion.id, e.target.value)}
                      className="text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Cambiar plan...</option>
                      {planes.map((plan) => (
                        <option key={plan.id} value={plan.id}>{plan.nombre}</option>
                      ))}
                    </select>
                    {suscripcion.estado !== 'suspendida' && suscripcion.estado !== 'cancelada' && (
                      <button
                        onClick={() => handleSuspender(suscripcion.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Suspender
                      </button>
                    )}
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
          <p className="text-sm text-gray-500">Total Suscripciones</p>
          <p className="text-2xl font-bold text-gray-900">{suscripciones.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Activas</p>
          <p className="text-2xl font-bold text-green-600">
            {suscripciones.filter(s => s.estado === 'activa').length}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">En Trial</p>
          <p className="text-2xl font-bold text-blue-600">
            {suscripciones.filter(s => s.estado === 'trial').length}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Suspendidas</p>
          <p className="text-2xl font-bold text-yellow-600">
            {suscripciones.filter(s => s.estado === 'suspendida').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuscripcionesPage;
