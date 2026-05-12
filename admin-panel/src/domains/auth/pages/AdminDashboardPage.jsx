import React from 'react';
import { StatCard } from '../../components';

/**
 * Página de Dashboard para Administradores
 * Muestra métricas clave y resumen del sistema
 */
const AdminDashboardPage = () => {
  const stats = [
    {
      title: 'Empresas Activas',
      value: '24',
      trend: { value: '+12%', up: true },
      icon: '🏢',
      accentColor: 'var(--navy-500)'
    },
    {
      title: 'Usuarios Totales',
      value: '1,284',
      trend: { value: '+8.2%', up: true },
      icon: '👥',
      accentColor: 'var(--sage-500)'
    },
    {
      title: 'Ingresos del Mes',
      value: '$12,450',
      trend: { value: '+15.3%', up: true },
      icon: '💰',
      accentColor: 'var(--amber-500)'
    },
    {
      title: 'Suscripciones Activas',
      value: '18',
      trend: { value: '-2.1%', up: false },
      icon: '🔄',
      accentColor: 'var(--rose-500)'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'Nueva empresa registrada', entity: 'Tech Solutions SRL', time: 'Hace 5 min', type: 'success' },
    { id: 2, action: 'Pago recibido', entity: 'Consultora ABC', time: 'Hace 15 min', type: 'info' },
    { id: 3, action: 'Suscripción renovada', entity: 'Digital Marketing SA', time: 'Hace 1 hora', type: 'success' },
    { id: 4, action: 'Ticket de soporte creado', entity: 'Startup XYZ', time: 'Hace 2 horas', type: 'warning' },
    { id: 5, action: 'Usuario eliminado', entity: 'Test User', time: 'Hace 3 horas', type: 'danger' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
            accentColor={stat.accentColor}
          />
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'info' ? 'bg-blue-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.entity}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
          <div className="space-y-2">
            <button className="btn btn-primary w-full justify-start gap-3">
              <span>➕</span> Nueva Empresa
            </button>
            <button className="btn btn-secondary w-full justify-start gap-3">
              <span>👤</span> Crear Usuario
            </button>
            <button className="btn btn-secondary w-full justify-start gap-3">
              <span>📦</span> Nuevo Plan
            </button>
            <button className="btn btn-secondary w-full justify-start gap-3">
              <span>📊</span> Ver Reportes
            </button>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Estado del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">✅</span>
              <span className="font-medium">Backend API</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-400">Operativo - 99.9% uptime</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">✅</span>
              <span className="font-medium">Base de Datos</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-400">Conectado - 245ms latency</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">✅</span>
              <span className="font-medium">ML Service</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-400">Disponible - Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
