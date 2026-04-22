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
  <div className="flex min-h-screen bg-slate-900 text-slate-200">
    <aside className="w-[280px] p-5 border-r border-slate-600/20">
      <h2 className="mt-0 mb-6">Super Admin</h2>
      <nav className="grid gap-2">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `px-3 py-2.5 rounded-lg no-underline text-slate-200 transition-colors duration-200 ${
                isActive ? 'bg-blue-500/25' : 'bg-transparent hover:bg-slate-800'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
    <main className="flex-1 overflow-auto">
      <div className="p-6">{children}</div>
    </main>
  </div>
);

export default AdminLayout;
