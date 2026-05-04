import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    empresa_id: '',
    rol_id: '',
    estado: 'activo'
  });

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/super-admin/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error loading usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadEmpresas = async () => {
    try {
      const response = await apiClient.get('/super-admin/empresas');
      setEmpresas(response.data);
    } catch (error) {
      console.error('Error loading empresas:', error);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await apiClient.get('/super-admin/roles-admin');
      setRoles(response.data);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  useEffect(() => {
    loadUsuarios();
    loadEmpresas();
    loadRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingUsuario) {
        await apiClient.put(`/super-admin/usuarios/${editingUsuario.id}`, formData);
        toast.success('Usuario actualizado correctamente');
      } else {
        await apiClient.post('/super-admin/usuarios', formData);
        toast.success('Usuario creado correctamente');
      }
      setShowModal(false);
      setEditingUsuario(null);
      setFormData({ nombre: '', email: '', password: '', empresa_id: '', rol_id: '', estado: 'activo' });
      loadUsuarios();
    } catch (error) {
      console.error('Error saving usuario:', error);
      toast.error(error.response?.data?.error || 'Error al guardar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      empresa_id: usuario.empresa_id,
      rol_id: usuario.rol_id,
      estado: usuario.estado
    });
    setShowModal(true);
  };

  const handleUpdateEstado = async (usuarioId, nuevoEstado) => {
    try {
      await apiClient.patch(`/super-admin/usuarios/${usuarioId}/estado`, { estado: nuevoEstado });
      toast.success(`Estado actualizado a ${nuevoEstado}`);
      loadUsuarios();
    } catch (error) {
      console.error('Error updating estado:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const handleDelete = async (usuarioId) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;
    try {
      await apiClient.delete(`/super-admin/usuarios/${usuarioId}`);
      toast.success('Usuario eliminado correctamente');
      loadUsuarios();
    } catch (error) {
      console.error('Error deleting usuario:', error);
      toast.error('Error al eliminar usuario');
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-gray-100 text-gray-800';
      case 'suspendido': return 'bg-red-100 text-red-800';
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra los usuarios administradores de las empresas</p>
        </div>
        <button
          onClick={() => {
            setEditingUsuario(null);
            setFormData({ nombre: '', email: '', password: '', empresa_id: '', rol_id: '', estado: 'activo' });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nuevo Usuario
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usuario.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.Empresa?.nombre || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.Rol?.nombre || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(usuario.estado)}`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(usuario)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </button>
                    <select
                      value={usuario.estado}
                      onChange={(e) => handleUpdateEstado(usuario.id, e.target.value)}
                      className="text-sm border-gray-300 rounded-md mr-3"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="suspendido">Suspendido</option>
                    </select>
                    <button
                      onClick={() => handleDelete(usuario.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {editingUsuario ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                  </label>
                  <input
                    type="password"
                    required={!editingUsuario}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Empresa</label>
                  <select
                    value={formData.empresa_id}
                    onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar empresa</option>
                    {empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <select
                    value={formData.rol_id}
                    onChange={(e) => setFormData({ ...formData, rol_id: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                    ))}
                  </select>
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
                    <option value="suspendido">Suspendido</option>
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
                  {saving ? 'Guardando...' : (editingUsuario ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPage;
