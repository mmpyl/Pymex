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
    <header className="topbar">
      {/* Hamburger */}
      <button
        onClick={onToggleSidebar}
        className="topbar-icon-btn"
        aria-label="Alternar menú"
      >
        <HamburgerIcon />
      </button>

      {/* Page info */}
      <div className="topbar-breadcrumb">
        <div className="page-title">{meta.title}</div>
        {meta.desc && <div className="page-subtitle">{meta.desc}</div>}
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="topbar-icon-btn"
          aria-label="Cambiar tema"
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Alerts */}
        <button
          onClick={() => navigate('/alertas')}
          className="topbar-icon-btn"
          aria-label="Alertas"
        >
          <BellIcon />
          <span className="notif-dot" />
        </button>

        {/* Version badge */}
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          padding: '4px 8px',
          background: 'var(--amber-50)',
          color: 'var(--amber-700)',
          border: '1px solid var(--amber-200)',
          borderRadius: 6,
          letterSpacing: '0.04em',
        }}>
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