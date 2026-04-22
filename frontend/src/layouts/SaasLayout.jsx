import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/topbar';
import TrialBanner from '../components/TrialBanner';

export default function SaasLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Auto-collapse on mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setCollapsed(e.matches);
    mq.addEventListener('change', handler);
    handler(mq);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="app-content">
        <Topbar
          onToggleSidebar={() => setCollapsed(c => !c)}
          pathname={location.pathname}
        />
        <TrialBanner />
        <main className="page-body fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}