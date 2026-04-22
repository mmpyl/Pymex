import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';

const PAGE_META = {
  '/dashboard':    { title: 'Dashboard',            desc: 'Vista general de tu negocio' },
  '/ventas':       { title: 'Ventas',               desc: 'Registro y seguimiento de ventas' },
  '/productos':    { title: 'Productos',             desc: 'Catálogo y precios' },
  '/categorias':   { title: 'Categorías',            desc: 'Organiza tus productos' },
  '/inventario':   { title: 'Inventario',            desc: 'Control de stock' },
  '/clientes':     { title: 'Clientes',              desc: 'Base de clientes' },
  '/proveedores':  { title: 'Proveedores',           desc: 'Gestión de proveedores' },
  '/gastos':       { title: 'Gastos',                desc: 'Control de egresos' },
  '/reportes':     { title: 'Reportes',              desc: 'Exporta tus datos' },
  '/facturacion':  { title: 'Facturación SUNAT',     desc: 'Emisión electrónica CPE' },
  '/predicciones': { title: 'Predicciones ML',       desc: 'Inteligencia para tu negocio' },
  '/alertas':      { title: 'Alertas',               desc: 'Notificaciones del sistema' },
  '/admin':        { title: 'Super Admin',           desc: 'Panel de administración' },
};

export default function Topbar({ onToggleSidebar, pathname }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useUIStore();
  const meta = PAGE_META[pathname] || { title: 'SaPyme', desc: '' };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 gap-4">
      {/* Hamburger */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
        aria-label="Alternar menú"
      >
        <HamburgerIcon />
      </button>

      {/* Page info */}
      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold text-gray-900 dark:text-white">{meta.title}</div>
        {meta.desc && <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{meta.desc}</div>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          aria-label="Cambiar tema"
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Alerts */}
        <button
          onClick={() => navigate('/alertas')}
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          aria-label="Alertas"
        >
          <BellIcon />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
        </button>

        {/* Version badge */}
        <span className="text-[11px] font-bold px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700 rounded-md tracking-wide">
          BETA
        </span>
      </div>
    </header>
  );
}

function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M2 4h12M2 8h12M2 12h8"/>
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3.5"/>
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M13 3l-1 1M4 12l-1 1"/>
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 9A6 6 0 016 2a7 7 0 107 7z"/>
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5a4.5 4.5 0 014.5 4.5c0 2-.6 3.3-1.7 4H3.2C2.1 9.3 1.5 8 1.5 6A4.5 4.5 0 018 1.5z"/>
      <path d="M6.2 13a2 2 0 003.6 0"/>
    </svg>
  );
}