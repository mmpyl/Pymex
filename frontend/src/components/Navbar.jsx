

// frontend/src/components/Navbar.jsx — versión consolidada (sin conflictos de merge)
// FIX: combina el botón de tema dark/light (rama HEAD) con la versión más limpia (rama main)

import { useAuth } from '../context/AuthContext';
import { useUIStore } from '../store/uiStore';

const Navbar = ({ onToggleSidebar }) => {

  const { usuario } = useAuth();
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  const { usuario }    = useAuth();
  const theme          = useUIStore(s => s.theme);
  const toggleTheme    = useUIStore(s => s.toggleTheme);


  return (
    <header style={styles.navbar}>
      <div style={styles.left}>
        {onToggleSidebar && (
          <button onClick={onToggleSidebar} style={styles.iconBtn} aria-label="Toggle sidebar">
            ☰
          </button>
        )}

        <strong>SaPyme SaaS</strong>
      </div>
      <div style={styles.right}>
        <button onClick={toggleTheme} style={styles.themeBtn}>
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
        <span style={styles.badge}>Beta</span>
        <span>{usuario?.nombre || 'Usuario'}</span>

        <strong style={{ color: '#1e1b4b' }}>SaPyme</strong>
      </div>

      <div style={styles.right}>
        <button
          onClick={toggleTheme}
          style={styles.themeBtn}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <span style={styles.badge}>Beta</span>
        <span style={{ color: '#334155', fontSize: 14 }}>
          {usuario?.nombre || 'Usuario'}
        </span>

      </div>
    </header>
  );
};

const styles = {
  navbar: {

    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 20
  },
  left: { display: 'flex', alignItems: 'center', gap: 12 },
  right: { display: 'flex', alignItems: 'center', gap: 10, color: '#334155' },
  iconBtn: {
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    background: '#fff',
    width: 34,
    height: 34,
    cursor: 'pointer'
  },
  themeBtn: {
    border: '1px solid #cbd5e1',
    borderRadius: 999,
    padding: '5px 10px',
    background: '#fff',
    cursor: 'pointer'
  },
  badge: {
    fontSize: 12,
    padding: '2px 8px',
    borderRadius: 999,
    background: '#dbeafe',
    color: '#1e3a8a',
    fontWeight: 700

    display:       'flex',
    justifyContent:'space-between',
    alignItems:    'center',
    padding:       '14px 20px',
    background:    '#ffffff',
    borderBottom:  '1px solid #e2e8f0',
    position:      'sticky',
    top:           0,
    zIndex:        20
  },
  left: {
    display:   'flex',
    alignItems:'center',
    gap:       12
  },
  right: {
    display:   'flex',
    alignItems:'center',
    gap:       10
  },
  iconBtn: {
    border:      '1px solid #cbd5e1',
    borderRadius:8,
    background:  '#fff',
    width:       34,
    height:      34,
    cursor:      'pointer',
    fontSize:    16
  },
  themeBtn: {
    border:      '1px solid #e2e8f0',
    borderRadius:999,
    padding:     '5px 10px',
    background:  '#fff',
    cursor:      'pointer',
    fontSize:    16,
    lineHeight:  1
  },
  badge: {
    fontSize:        12,
    padding:         '2px 8px',
    borderRadius:    999,
    background:      '#dbeafe',
    color:           '#1e3a8a',
    fontWeight:      700

  }
};

export default Navbar;
