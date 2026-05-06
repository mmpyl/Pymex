import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menu = [
  { to: '/super-admin', label: 'Dashboard' },
  { to: '/super-admin/empresas', label: 'Empresas' },
  { to: '/super-admin/suscripciones', label: 'Suscripciones' },
  { to: '/super-admin/pagos', label: 'Pagos' },
  { to: '/super-admin/planes', label: 'Planes' },
  { to: '/super-admin/features', label: 'Features' },
  { to: '/super-admin/auditoria', label: 'Auditoría' },
  { to: '/super-admin/metricas', label: 'Métricas' },
  { to: '/super-admin/reportes', label: 'Reportes' },
  { to: '/super-admin/usuarios', label: 'Usuarios' },
  { to: '/super-admin/configuracion', label: 'Configuración' },
  { to: '/super-admin/soporte', label: 'Soporte' }  
];

const AdminLayout = ({ children }) => {
  const { logoutAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/staff/login');
  };

  return (
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
          <button
            onClick={handleLogout}
            className="px-3 py-2.5 rounded-lg no-underline text-slate-200 transition-colors duration-200 bg-transparent hover:bg-red-600/20 text-left mt-4"
          >
            Cerrar sesión
          </button>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
