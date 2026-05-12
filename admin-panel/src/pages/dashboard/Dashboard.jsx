import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';

// Datos mock para demostración
const mockStats = {
  companies: { value: 128, change: 12.5, trend: 'up' },
  users: { value: 1456, change: 8.2, trend: 'up' },
  revenue: { value: 45280, change: -2.4, trend: 'down' },
  subscriptions: { value: 89, change: 15.3, trend: 'up' },
};

const mockRecentActivity = [
  { id: 1, type: 'company', action: 'Nueva empresa registrada', entity: 'TechCorp S.A.', time: 'Hace 5 min', status: 'success' },
  { id: 2, type: 'user', action: 'Usuario activado', entity: 'juan.perez@empresa.com', time: 'Hace 12 min', status: 'success' },
  { id: 3, type: 'payment', action: 'Pago recibido', entity: 'Invoice #INV-2024-001', time: 'Hace 1 hora', status: 'success' },
  { id: 4, type: 'subscription', action: 'Suscripción cancelada', entity: 'Plan Enterprise', time: 'Hace 2 horas', status: 'warning' },
  { id: 5, type: 'company', action: 'Empresa verificada', entity: 'StartupXYZ Ltd.', time: 'Hace 3 horas', status: 'success' },
];

const mockQuickActions = [
  { label: 'Nueva Empresa', icon: Building2, href: '/admin/companies/new', color: 'blue' },
  { label: 'Nuevo Usuario', icon: Users, href: '/admin/users/new', color: 'green' },
  { label: 'Crear Factura', icon: CreditCard, href: '/admin/billing/invoices/new', color: 'purple' },
  { label: 'Ver Reportes', icon: BarChart3, href: '/admin/reports', color: 'orange' },
];

const mockSystemHealth = [
  { name: 'Backend API', status: 'operational', latency: '45ms' },
  { name: 'Base de Datos', status: 'operational', latency: '12ms' },
  { name: 'ML Service', status: 'operational', latency: '89ms' },
  { name: 'Email Service', status: 'degraded', latency: '234ms' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(mockStats);
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity);
  const [systemHealth, setSystemHealth] = useState(mockSystemHealth);

  // Simular actualización de datos en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // En producción, aquí harías llamadas reales al API
      console.log('Actualizando dashboard...');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'company': return Building2;
      case 'user': return Users;
      case 'payment': return DollarSign;
      case 'subscription': return CreditCard;
      default: return Activity;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completado</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pendiente</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Error</Badge>;
      default: return <Badge variant="outline">Info</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Bienvenido al panel de administración</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Clock className="w-4 h-4 mr-2" />
            Últimos 30 días
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Exportar reporte
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Empresas"
          value={stats.companies.value}
          change={stats.companies.change}
          trend={stats.companies.trend}
          icon={Building2}
          description="Total de empresas registradas"
        />
        <StatCard
          title="Usuarios"
          value={stats.users.value}
          change={stats.users.change}
          trend={stats.users.trend}
          icon={Users}
          description="Usuarios activos en el sistema"
        />
        <StatCard
          title="Ingresos"
          value={`$${stats.revenue.value.toLocaleString()}`}
          change={stats.revenue.change}
          trend={stats.revenue.trend}
          icon={DollarSign}
          description="Ingresos del mes actual"
          prefix="$"
        />
        <StatCard
          title="Suscripciones"
          value={stats.subscriptions.value}
          change={stats.subscriptions.change}
          trend={stats.subscriptions.trend}
          icon={CreditCard}
          description="Suscripciones activas"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Activity - Left Column */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimas acciones realizadas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500 truncate">{activity.entity}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {getStatusBadge(activity.status)}
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="ghost" className="w-full text-sm" asChild>
                <Link to="/admin/activity">Ver toda la actividad</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & System Health - Right Column */}
        <div className="space-y-6 lg:col-span-3">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-purple-600" />
                Acciones Rápidas
              </CardTitle>
              <CardDescription>
                Accesos directos a las funciones más usadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {mockQuickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-gray-50"
                      asChild
                    >
                      <Link to={action.href}>
                        <div className={`w-10 h-10 rounded-full bg-${action.color}-100 flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 text-${action.color}-600`} />
                        </div>
                        <span className="text-xs font-medium">{action.label}</span>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Estado del Sistema
              </CardTitle>
              <CardDescription>
                Monitoreo de servicios en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemHealth.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`} />
                      <span className="text-sm font-medium text-gray-700">{service.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{service.latency}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Última actualización</span>
                  <span className="text-xs text-gray-400">Hace 2 minutos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
