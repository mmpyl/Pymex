import { NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar';

const menu = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/empresas', label: 'Empresas' },
  { to: '/admin/suscripciones', label: 'Suscripciones' },
  { to: '/admin/pagos', label: 'Pagos' },
  { to: '/admin/planes', label: 'Planes' },
  { to: '/admin/features', label: 'Features' },
  { to: '/admin/auditoria', label: 'Auditoría' }
];

const AdminLayout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh', background: '#0b1020', color: '#e5e7eb' }}>
    <aside style={{ width: 280, padding: 20, borderRight: '1px solid rgba(148,163,184,0.2)' }}>
      <h2 style={{ marginTop: 0 }}>Super Admin</h2>
      <nav style={{ display: 'grid', gap: 10 }}>
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              padding: '10px 12px',
              borderRadius: 8,
              textDecoration: 'none',
              color: '#e5e7eb',
              background: isActive ? 'rgba(59,130,246,0.25)' : 'transparent'
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
    <main style={{ flex: 1 }}>
      <Navbar />
      <div style={{ padding: 24 }}>{children}</div>
    </main>
  </div>
);

export default AdminLayout;
