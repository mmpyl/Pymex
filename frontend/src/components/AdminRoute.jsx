import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/axios';

const AdminRoute = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const validarAdmin = async () => {
      try {
        const { data } = await api.get('/auth/admin/profile');
        if (mounted) setAdmin(data);
      } catch {
        if (mounted) setAdmin(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    validarAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-700">Cargando...</div>;
  if (!admin) return <Navigate to='/staff/login' replace />;

  const rolesPermitidos = ['super_admin', 'admin', 'moderador', 'soporte'];
  if (!rolesPermitidos.includes(admin.rol)) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Acceso restringido</h2>
        <p className="text-gray-600">Tu rol actual no tiene permisos para el panel administrativo.</p>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
