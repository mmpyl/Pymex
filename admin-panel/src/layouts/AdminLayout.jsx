import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const menuSections = [
  {
    title: 'Principal',
    items: [
      { to: '/super-admin', label: 'Dashboard', icon: '📊' },
    ]
  },
  {
    title: 'Gestión',
    items: [
      { to: '/super-admin/empresas', label: 'Empresas', icon: '🏢' },
      { to: '/super-admin/usuarios', label: 'Usuarios', icon: '👥' },
      { to: '/super-admin/planes', label: 'Planes', icon: '📦' },
      { to: '/super-admin/features', label: 'Features', icon: '✨' },
    ]
  },
  {
    title: 'Finanzas',
    items: [
      { to: '/super-admin/suscripciones', label: 'Suscripciones', icon: '🔄' },
      { to: '/super-admin/pagos', label: 'Pagos', icon: '💳' },
      { to: '/super-admin/facturas', label: 'Facturas', icon: '📄' },
      { to: '/super-admin/reportes', label: 'Reportes', icon: '📈' },
    ]
  },
  {
    title: 'Control',
    items: [
      { to: '/super-admin/auditoria', label: 'Auditoría', icon: '🔍' },
      { to: '/super-admin/metricas', label: 'Métricas', icon: '📉' },
      { to: '/super-admin/soporte', label: 'Soporte', icon: '🎧' },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { to: '/super-admin/configuracion', label: 'Configuración', icon: '⚙️' },
    ]
  }
];

const AdminLayout = ({ children }) => {
  const { logoutAdmin, admin } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/staff/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">S</div>
          <span className="sidebar-brand-name">SAPYME Admin</span>
        </div>
        
        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuSections.map((section) => (
            <div key={section.title}>
              <div className="sidebar-section-title">{section.title}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => 
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        
        {/* Footer with User */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={toggleSidebar}>
            <div className="user-avatar">
              {admin?.nombre?.charAt(0) || 'A'}
            </div>
            <div className="user-info">
              <div className="user-name">{admin?.nombre || 'Administrador'}</div>
              <div className="user-role">Super Admin</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="nav-item mt-2"
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Cerrar sesión</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="app-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-breadcrumb">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Panel de control del sistema</p>
          </div>
          <div className="topbar-actions">
            <button className="topbar-icon-btn" title="Buscar">
              🔍
            </button>
            <button className="topbar-icon-btn" title="Notificaciones">
              🔔
              <span className="notif-dot"></span>
            </button>
            <button className="topbar-icon-btn" title="Ayuda">
              ❓
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
