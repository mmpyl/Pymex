import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessControl } from '../hooks/useAccessControl';
import { useState, useEffect } from 'react';
import api from '../api/axios';

const NAV_SECTIONS = [
  {
    title: 'Principal',
    items: [
      { path: '/dashboard',   icon: IconDashboard,  label: 'Dashboard' },
    ]
  },
  {
    title: 'Operaciones',
    items: [
      { path: '/ventas',      icon: IconVentas,     label: 'Ventas' },
      { path: '/productos',   icon: IconProductos,  label: 'Productos' },
      { path: '/categorias',  icon: IconCategorias, label: 'Categorías' },
      { path: '/inventario',  icon: IconInventario, label: 'Inventario' },
      { path: '/clientes',    icon: IconClientes,   label: 'Clientes' },
      { path: '/proveedores', icon: IconProveedores,label: 'Proveedores' },
    ]
  },
  {
    title: 'Finanzas',
    items: [
      { path: '/gastos',      icon: IconGastos,     label: 'Gastos' },
      { path: '/reportes',    icon: IconReportes,   label: 'Reportes' },
      { path: '/facturacion', icon: IconFactura,    label: 'Facturación', feature: 'facturacion_electronica' },
    ]
  },
  {
    title: 'Inteligencia',
    items: [
      { path: '/predicciones',icon: IconML,         label: 'Predicciones', feature: 'predicciones' },
      { path: '/alertas',     icon: IconAlertas,    label: 'Alertas', badge: true },
    ]
  }
];

const ADMIN_ITEM = { path: '/admin', icon: IconAdmin, label: 'Super Admin', role: 'super_admin' };

export default function Sidebar({ collapsed, onToggle }) {
  const { usuario, logout } = useAuth();
  const { hasFeature, role } = useAccessControl();
  const [alertCount, setAlertCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/alertas/sin-leer').then(r => setAlertCount(r.data.sin_leer || 0)).catch(() => {});
    const id = setInterval(() => {
      api.get('/alertas/sin-leer').then(r => setAlertCount(r.data.sin_leer || 0)).catch(() => {});
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const initials = usuario?.nombre
    ? usuario.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const isAdmin = ['super_admin', 'soporte'].includes(role);

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">SP</div>
        <span className="sidebar-brand-name">SaPyme</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map(section => {
          const visibleItems = section.items.filter(item => {
            if (item.feature && !hasFeature(item.feature)) return false;
            if (item.role && item.role !== role) return false;
            return true;
          });
          if (!visibleItems.length) return null;

          return (
            <div key={section.title}>
              <div className="sidebar-section-title">{section.title}</div>
              {visibleItems.map(item => {
                const Icon = item.icon;
                const count = item.badge ? alertCount : 0;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {count > 0 && <span className="nav-badge">{count > 99 ? '99+' : count}</span>}
                  </NavLink>
                );
              })}
            </div>
          );
        })}

        {isAdmin && (
          <div>
            <div className="sidebar-section-title">Sistema</div>
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              title={collapsed ? 'Super Admin' : undefined}
            >
              <IconAdmin className="nav-icon" />
              <span className="nav-label">Super Admin</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Footer / User */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={() => navigate('/perfil')}>
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{usuario?.nombre}</div>
            <div className="user-role">{usuario?.Empresa?.nombre || 'Mi empresa'}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="nav-item"
          style={{ width: '100%', marginTop: 4, border: 'none', cursor: 'pointer', textAlign: 'left' }}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <IconLogout className="nav-icon" />
          <span className="nav-label">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

/* ——— Inline SVG Icons (18×18) ——— */
function IconDashboard({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="6" height="6" rx="1.5"/>
      <rect x="10" y="2" width="6" height="6" rx="1.5"/>
      <rect x="2" y="10" width="6" height="6" rx="1.5"/>
      <rect x="10" y="10" width="6" height="6" rx="1.5"/>
    </svg>
  );
}
function IconVentas({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h12M3 9h8M3 14h5"/>
      <circle cx="14" cy="13" r="2.5"/>
      <path d="M14 10.5v2.5M14 13h2"/>
    </svg>
  );
}
function IconProductos({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5l7-3 7 3v8l-7 3-7-3V5z"/>
      <path d="M9 2v13M2 5l7 3 7-3"/>
    </svg>
  );
}
function IconCategorias({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2h5v5H2zM11 2h5v5h-5zM2 11h5v5H2z"/>
      <circle cx="13.5" cy="13.5" r="2.5"/>
    </svg>
  );
}
function IconInventario({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="14" height="11" rx="1.5"/>
      <path d="M6 4V3a1 1 0 011-1h4a1 1 0 011 1v1"/>
      <path d="M6 9h6M9 7v4"/>
    </svg>
  );
}
function IconClientes({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="6" r="3"/>
      <path d="M2 16c0-3.3 3.1-6 7-6s7 2.7 7 6"/>
    </svg>
  );
}
function IconProveedores({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="14" height="8" rx="1.5"/>
      <path d="M5 7V5a4 4 0 018 0v2"/>
      <path d="M9 11v2"/>
    </svg>
  );
}
function IconGastos({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="7"/>
      <path d="M9 5.5V7m0 4v1.5"/>
      <path d="M7 8.5c0-.8.9-1.5 2-1.5s2 .7 2 1.5S10 10 9 10s-2 .7-2 1.5S7.9 13 9 13s2-.7 2-1.5"/>
    </svg>
  );
}
function IconReportes({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2H5a1.5 1.5 0 00-1.5 1.5v11A1.5 1.5 0 005 16h8a1.5 1.5 0 001.5-1.5V6L11 2z"/>
      <path d="M11 2v4h4"/>
      <path d="M6 10h2M6 13h6M6 7h1"/>
    </svg>
  );
}
function IconFactura({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="1.5" width="13" height="15" rx="1.5"/>
      <path d="M5.5 5.5h7M5.5 8.5h7M5.5 11.5h4"/>
    </svg>
  );
}
function IconML({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="4" cy="14" r="1.5"/>
      <circle cx="9" cy="9" r="1.5"/>
      <circle cx="14" cy="5" r="1.5"/>
      <path d="M5.3 12.8l2.5-2.5M10.2 7.8l2.6-1.7"/>
    </svg>
  );
}
function IconAlertas({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2a7 7 0 017 7c0 2.4-.7 4-2 5H4C2.7 13 2 11.4 2 9a7 7 0 017-7z"/>
      <path d="M7 14a2 2 0 004 0"/>
    </svg>
  );
}
function IconAdmin({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1l2 4h4l-3 3 1 4-4-2.5L5 12l1-4L3 5h4L9 1z"/>
    </svg>
  );
}
function IconLogout({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3H4a1.5 1.5 0 00-1.5 1.5v9A1.5 1.5 0 004 15h3"/>
      <path d="M12 12l3-3-3-3M15 9H7"/>
    </svg>
  );
}