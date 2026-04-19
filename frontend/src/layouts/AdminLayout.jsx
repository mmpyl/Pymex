import { NavLink } from 'react-router-dom';

const menu = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/empresas', label: 'Empresas' },
  { to: '/admin/suscripciones', label: 'Suscripciones' },
  { to: '/admin/pagos', label: 'Pagos' },
  { to: '/admin/planes', label: 'Planes' },
  { to: '/admin/features', label: 'Features' },
  { to: '/admin/auditoria', label: 'Auditoría' },
  { to: '/admin/metricas', label: 'Métricas' }
];

const AdminLayout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh', background: '#0b1020', color: '#e5e7eb' }}>
    <aside style={{ width: 280, padding: 20, borderRight: '1px solid rgba(148,163,184,0.2)' }}>
      <h2 style={{ marginTop: 0, marginBottom: 24 }}>Super Admin</h2>
      <nav style={{ display: 'grid', gap: 8 }}>
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              padding: '10px 12px',
              borderRadius: 8,
              textDecoration: 'none',
              color: '#e5e7eb',
              background: isActive ? 'rgba(59,130,246,0.25)' : 'transparent',
              transition: 'background 0.2s'
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
    <main style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ padding: 24 }}>{children}</div>
    </main>
  </div>
);

export default AdminLayout;
