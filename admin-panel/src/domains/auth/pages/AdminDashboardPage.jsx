import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAuth';

/**
 * Página de Dashboard para Administradores
 */
const AdminDashboardPage = () => {
  const { admin } = useAdminAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Bienvenido, {admin?.nombre || 'Administrador'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Panel de administración del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats cards will be added here */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Empresas Activas
          </h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Usuarios Totales
          </h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Ingresos del Mes
          </h3>
          <p className="text-3xl font-bold text-purple-600">$0</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Suscripciones Activas
          </h3>
          <p className="text-3xl font-bold text-orange-600">0</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
