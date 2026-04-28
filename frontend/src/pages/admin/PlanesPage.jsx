import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

const PlanesPage = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    precio_mensual: 0,
    max_usuarios: 5,
    max_productos: 200,
    max_ventas_mes: 999999,
    estado: 'activo'
  });

  const loadPlanes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/super-admin/planes');
      setPlanes(response.data);
    } catch (error) {
      console.error('Error loading planes:', error);
      toast.error('Error al cargar planes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingPlan) {
        await apiClient.put(`/super-admin/planes/${editingPlan.id}`, formData);
        toast.success('Plan actualizado correctamente');
      } else {
        await apiClient.post('/super-admin/planes', formData);
        toast.success('Plan creado correctamente');
      }
      setShowModal(false);
      setEditingPlan(null);
      setFormData({
        nombre: '',
        codigo: '',
        descripcion: '',
        precio_mensual: 0,
        max_usuarios: 5,
        max_productos: 200,
        max_ventas_mes: 999999,
        estado: 'activo'
      });
      loadPlanes();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error(error.response?.data?.error || 'Error al guardar plan');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      nombre: plan.nombre,
      codigo: plan.codigo,
      descripcion: plan.descripcion || '',
      precio_mensual: plan.precio_mensual || 0,
      max_usuarios: plan.limites?.max_usuarios || 5,
      max_productos: plan.limites?.max_productos || 200,
      max_ventas_mes: plan.limites?.max_ventas_mes || 999999,
      estado: plan.estado
    });
    setShowModal(true);
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-gray-100 text-gray-800';
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Planes</h1>
          <p className="text-gray-600 mt-1">Configura los planes y suscripciones disponibles</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setFormData({
              nombre: '',
              codigo: '',
              descripcion: '',
              precio_mensual: 0,
              max_usuarios: 5,
              max_productos: 200,
              max_ventas_mes: 999999,
              estado: 'activo'
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nuevo Plan
        </button>
      </div>

      {/* Grid de Planes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {planes.map((plan) => (
          <div key={plan.id} className="bg-white shadow rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{plan.nombre}</h3>
                <p className="text-sm text-gray-500">{plan.codigo}</p>
              </div>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(plan.estado)}`}>
                {plan.estado}
              </span>
            </div>
            
            <div className="mb-4">
              <p className="text-3xl font-bold text-blue-600">S/ {plan.precio_mensual}</p>
              <p className="text-sm text-gray-500">/mes</p>
            </div>

            {plan.descripcion && (
              <p className="text-sm text-gray-600 mb-4">{plan.descripcion}</p>
            )}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Usuarios máx:</span>
                <span className="font-medium">{plan.limites?.max_usuarios || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Productos máx:</span>
                <span className="font-medium">{plan.limites?.max_productos || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ventas/mes:</span>
                <span className="font-medium">{plan.limites?.max_ventas_mes || '-'}</span>
              </div>
            </div>

            <button
              onClick={() => handleEdit(plan)}
              className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Editar Plan
            </button>
          </div>
        ))}
      </div>

      {/* Modal Formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold mb-4">
              {editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Código</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    rows="3"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio Mensual (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_mensual}
                    onChange={(e) => setFormData({ ...formData, precio_mensual: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Usuarios</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_usuarios}
                      onChange={(e) => setFormData({ ...formData, max_usuarios: parseInt(e.target.value) || 1 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Productos</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_productos}
                      onChange={(e) => setFormData({ ...formData, max_productos: parseInt(e.target.value) || 1 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Ventas/mes</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_ventas_mes}
                      onChange={(e) => setFormData({ ...formData, max_ventas_mes: parseInt(e.target.value) || 1 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : (editingPlan ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanesPage;
