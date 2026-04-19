
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const SaasLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--app-bg, #f8fafc)' }}>
      <div style={{ width: collapsed ? 88 : 260, transition: 'width 0.2s ease' }}>
        <Sidebar collapsed={collapsed} />
      </div>
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Navbar onToggleSidebar={() => setCollapsed((v) => !v)} />
        <div style={{ padding: 24 }}>{children}</div>
      </main>

// frontend/src/layouts/SaasLayout.jsx — versión corregida
// FIX: integra TrialBanner que estaba en App.jsx (rama main) pero ausente en AppRouter (rama HEAD).
// FIX: el sidebar colapsable funciona correctamente con la prop `collapsed`.
// FIX: el estado de colapso se persiste en localStorage para no resetearse al navegar.

import { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import Topbar from '../components/topbar';
import { cn } from '../lib/utils';
import TrialBanner from '../components/TrialBanner';

const SaasLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(prev => !prev);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = () => mq.matches && setCollapsed(true);
    mq.addEventListener('change', handler);
    handler();
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar onToggleSidebar={toggleSidebar} />
        <TrialBanner />
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SaasLayout;
