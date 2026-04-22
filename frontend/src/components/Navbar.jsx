// frontend/src/components/Navbar.jsx

import { useAuth } from '../context/AuthContext';
import { useUIStore } from '../store/uiStore';

const Navbar = ({ onToggleSidebar }) => {
  const { usuario } = useAuth();
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  return (
    <header className="flex justify-between items-center px-5 py-3.5 bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar} 
            className="w-[34px] h-[34px] flex items-center justify-center border border-gray-300 rounded-lg bg-white cursor-pointer text-base hover:bg-gray-50 transition-colors" 
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        )}
        <strong className="text-gray-800">SaPyme SaaS</strong>
      </div>
      <div className="flex items-center gap-2.5 text-gray-600">
        <button
          onClick={toggleTheme}
          className="border border-gray-200 rounded-full px-2.5 py-1 bg-white cursor-pointer text-base leading-none hover:bg-gray-50 transition-colors"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">Beta</span>
        <span className="text-gray-600 text-sm">
          {usuario?.nombre || 'Usuario'}
        </span>
      </div>
    </header>
  );
};

export default Navbar;
