import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const FeaturesPage = () => {
  const [rubros, setRubros] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Cargar datos de rubros y features
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/rubros/features');
      setRubros(response.data);
      
      // Extraer lista única de features
      if (response.data.length > 0) {
        const allFeatures = response.data[0]?.features || [];
        setFeatures(allFeatures);
      }
    } catch (error) {
      showNotification('Error al cargar datos', 'error');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Mostrar notificación
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Toggle feature para un rubro
  const toggleFeature = async (rubroId, featureId, currentStatus) => {
    try {
      setSaving(true);
      await apiClient.put(`/admin/rubros/${rubroId}/features/${featureId}`, {
        activo: !currentStatus
      });
      showNotification('Feature actualizado correctamente');
      await loadData(); // Recargar datos
    } catch (error) {
      showNotification('Error al actualizar feature', 'error');
      console.error('Error updating feature:', error);
    } finally {
      setSaving(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Features por Rubro</h1>
        <p className="text-gray-600 mt-1">
          Habilita o deshabilita características según el rubro de negocio
        </p>
      </div>

      {/* Notificación */}
      {notification && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Tabla de Features por Rubro */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                  Feature
                </th>
                {rubros.map((rubro) => (
                  <th
                    key={rubro.id}
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {rubro.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {features.map((feature) => (
                <tr key={feature.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{feature.nombre}</div>
                        <div className="text-sm text-gray-500">{feature.codigo}</div>
                        {feature.descripcion && (
                          <div className="text-xs text-gray-400 mt-1">{feature.descripcion}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  {rubros.map((rubro) => {
                    const rubroFeature = rubro.features?.find(
                      (rf) => rf.id === feature.id
                    );
                    const isActive = rubroFeature?.activo ?? false;

                    return (
                      <td key={`${rubro.id}-${feature.id}`} className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => toggleFeature(rubro.id, feature.id, isActive)}
                          disabled={saving}
                          className={`relative inline-flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-green-100 hover:bg-green-200'
                              : 'bg-gray-100 hover:bg-gray-200'
                          } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div
                            className={`w-10 h-6 rounded-full transition-colors ${
                              isActive ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                                isActive ? 'translate-x-5' : 'translate-x-1'
                              }`}
                              style={{ marginTop: '4px' }}
                            />
                          </div>
                          <span
                            className={`text-xs mt-1 ${
                              isActive ? 'text-green-700' : 'text-gray-500'
                            }`}
                          >
                            {isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span>Feature habilitado para este rubro</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
          <span>Feature no habilitado para este rubro</span>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
