import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessControl } from '../hooks/useAccessControl';
import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, Package, Tag, Warehouse, DollarSign, CreditCard, Users, Truck, FileText, Bell, Brain, FileBox, Shield, LogOut, ChevronLeft, ChevronRight 
} from 'lucide-react';

const Sidebar = ({ collapsed = false }) => {
  const { usuario, logout } = useAuth();
  const { hasFeature, role } = useAccessControl();
  const [alertasSinLeer, setAlertasSinLeer] = useState(0);
  const intervalRef = useRef(null);

  const cargarAlertas = async () => {
    try {
      const { data } = await api.get('/alertas/sin-leer');
      setAlertasSinLeer(data.sin_leer || 0);
    } catch {}
  };

  useEffect(() => {
    cargarAlertas();
    intervalRef.current = setInterval(cargarAlertas, 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const esAdminGlobal = ['super_admin', 'soporte'].includes(role);

  const menu = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/productos', icon: Package, label: 'Productos' },
    { path: '/categorias', icon: Tag, label: 'Categorías' },
    { path: '/inventario', icon: Warehouse, label: 'Inventario' },
    { path: '/ventas', icon: DollarSign, label: 'Ventas' },
    { path: '/gastos', icon: CreditCard, label: 'Gastos' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/proveedores', icon: Truck, label: 'Proveedores' },
    { path: '/reportes', icon: FileText, label: 'Reportes' },
    { path: '/alertas', icon: Bell, badge: alertasSinLeer, label: 'Alertas' },
    { path: '/predicciones', icon: Brain, visible: hasFeature('predicciones'), label: 'Predicciones' },
    { path: '/facturacion', icon: FileBox, visible: hasFeature('facturacion_electronica'), label: 'Facturación' },
    { path: '/admin', icon: Shield, visible: esAdminGlobal, label: 'Super Admin' },
  ].filter(item => item.visible !== false);

  return (
    <aside className={cn(
      "flex h-screen flex-col bg-card border-r shadow-sm transition-all duration-300",
      collapsed ? 'w-20' : 'w-64'
    )}>
      {/* Brand */}
      <div className="flex flex-col items-center gap-2 p-6 border-b border-border/50">
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-saas-indigo bg-clip-text text-transparent">
          {collapsed ? 'SP' : 'SaPyme'}
        </div>
        {!collapsed && (
          <span className="text-xs text-muted-foreground text-center">
            {usuario?.nombre}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-sm' 
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', collapsed ? '' : 'mr-3')} />
                {!collapsed && (
                  <span className="flex-1">{item.label}</span>
                )}
                {item.badge > 0 && (
                  <span className={cn(
                    'ml-auto rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground',
                    collapsed && 'absolute -right-1 -top-1 scale-75'
                  )}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border/50">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
