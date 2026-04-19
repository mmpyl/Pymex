// frontend/src/pages/Dashboard.jsx — versión completa consolidada (sin conflictos de merge)
import { useEffect, useState } from 'react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid,
         Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

const Dashboard = () => {
  const [resumen, setResumen]           = useState(null);
  const [ventasMes, setVentasMes]       = useState([]);
  const [gastosMes, setGastosMes]       = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [cargando, setCargando]         = useState(true);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const [r, v, g, t] = await Promise.all([
        api.get('/dashboard/resumen'),
        api.get('/dashboard/ventas-mensuales'),
        api.get('/dashboard/gastos-mensuales'),
        api.get('/dashboard/top-productos')
      ]);
      setResumen(r.data);
      setVentasMes(v.data.map(d => ({
        mes: new Date(d.mes).toLocaleDateString('es-PE', { month: 'short', year: '2-digit' }),
        ventas: parseFloat(d.total)
      })));

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import api from '../api/axios';

// ─── Tokens de diseño ─────────────────────────────────────────────────────────
const S = {
  container: { padding: '28px 32px', flex: 1, maxWidth: 1280, margin: '0 auto', width: '100%' },
  titulo:    { fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#6b7280', marginBottom: 24 },
  grid2:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 20 },
  grid6:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 },
  card:      { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 },
  label:     { fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' },
  val:       { fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' },
  sub:       { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  sectionH:  { fontSize: 13, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 },
};

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

// ─── Componentes auxiliares ───────────────────────────────────────────────────
const TooltipCustom = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ fontWeight: 600, marginBottom: 5 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: <strong>S/ {Number(p.value).toFixed(2)}</strong>
        </div>
      ))}
    </div>
  );
};

const Delta = ({ val }) => {
  if (val === undefined || val === null) return null;
  const pos = Number(val) >= 0;
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, marginLeft: 6,
      color: pos ? '#10b981' : '#ef4444',
      background: pos ? '#d1fae5' : '#fee2e2',
      borderRadius: 6, padding: '1px 7px'
    }}>
      {pos ? '▲' : '▼'} {Math.abs(val)}%
    </span>
  );
};

const KPI = ({ label, value, sub, color = '#6366f1', delta, icon }) => (
  <div style={{ ...S.card, borderTop: `3px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={S.label}>{label}</div>
      {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
      <div style={{ ...S.val, color }}>{value}</div>
      <Delta val={delta} />
    </div>
    {sub && <div style={S.sub}>{sub}</div>}
  </div>
);

const AlertaBadge = ({ alerta }) => {
  const cfg = {
    stock_bajo:   { bg: '#fef2f2', color: '#b91c1c', icon: '📦' },
    ventas_bajas: { bg: '#fffbeb', color: '#92400e', icon: '📉' },
    default:      { bg: '#f3f4f6', color: '#374151', icon: '🔔' },
  }[alerta.tipo] || { bg: '#f3f4f6', color: '#374151', icon: '🔔' };

  return (
    <div style={{ background: cfg.bg, borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{cfg.icon}</span>
      <span style={{ fontSize: 13, color: cfg.color, lineHeight: 1.5 }}>{alerta.mensaje}</span>
    </div>
  );
};

const UtilBar = ({ ventas, gastos }) => {
  const utilidad  = ventas - gastos;
  const margen    = ventas > 0 ? ((utilidad / ventas) * 100).toFixed(1) : 0;
  const gastoPct  = ventas > 0 ? Math.min((gastos / ventas) * 100, 100) : 0;
  const positivo  = utilidad >= 0;
  return (
    <div style={S.card}>
      <div style={S.sectionH}>Margen del mes</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
        <span style={{ color: '#6b7280' }}>Gastos sobre ventas</span>
        <span style={{ fontWeight: 700, color: positivo ? '#10b981' : '#ef4444' }}>Margen: {margen}%</span>
      </div>
      <div style={{ height: 10, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: 10, width: `${gastoPct}%`, background: positivo ? '#6366f1' : '#ef4444', borderRadius: 99, transition: 'width 0.8s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#9ca3af' }}>
        <span>Ventas: S/ {Number(ventas).toFixed(2)}</span>
        <span>Gastos: S/ {Number(gastos).toFixed(2)}</span>
        <span style={{ color: positivo ? '#10b981' : '#ef4444', fontWeight: 600 }}>Utilidad: S/ {Number(utilidad).toFixed(2)}</span>
      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const Dashboard = () => {
  const [resumen,      setResumen]      = useState(null);
  const [ventasMes,    setVentasMes]    = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [alertas,      setAlertas]      = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [fecha,        setFecha]        = useState('');

  useEffect(() => {
    setFecha(new Date().toLocaleDateString('es-PE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }));
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const [r, v, g, t, a] = await Promise.all([
        api.get('/dashboard/resumen'),
        api.get('/dashboard/ventas-mensuales'),
        api.get('/dashboard/gastos-mensuales'),
        api.get('/dashboard/top-productos'),
        api.get('/alertas').catch(() => ({ data: [] })),
      ]);

      setResumen(r.data);

      // Combinar ventas + gastos en un solo dataset
      const vMap = {};
      v.data.forEach(d => {
        const k = new Date(d.mes).toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
        vMap[k] = { mes: k, ventas: parseFloat(d.total), gastos: 0 };
      });
      g.data.forEach(d => {
        const k = new Date(d.mes).toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
        if (vMap[k]) vMap[k].gastos = parseFloat(d.total);
        else vMap[k] = { mes: k, ventas: 0, gastos: parseFloat(d.total) };
      });
      const combined = Object.values(vMap).sort((a, b) => {
        const parse = s => { const [m, y] = s.split(' '); return new Date(`01 ${m} 20${y}`); };
        return parse(a.mes) - parse(b.mes);
      });
      setVentasMes(combined);


      setGastosMes(g.data.map(d => ({
        mes: new Date(d.mes).toLocaleDateString('es-PE', { month: 'short', year: '2-digit' }),
        gastos: parseFloat(d.total)
      })));



      setTopProductos(t.data.map(d => ({

        nombre: d.Producto?.nombre || 'Desconocido',
        ingresos: parseFloat(d.total_ingresos),
      })));
    } catch (error) { console.error(error); }
    finally { setCargando(false); }
  };

  // KPIs: ventas_mes, gastos_mes, utilidad_mes,
  //       total_productos, stock_bajo, crecimiento_ventas
  // Graficas: BarChart ventas, BarChart gastos, BarChart horizontal top productos
};

export default Dashboard;

        nombre:   d.Producto?.nombre || 'Desconocido',
        ingresos: parseFloat(d.total_ingresos),
        vendido:  parseInt(d.total_vendido)
      })));

      setAlertas((a.data || []).filter(x => !x.leido).slice(0, 4));
    } catch (e) {
      console.error('[Dashboard] Error cargando datos:', e.message);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return (
    <div style={{ ...S.container, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <div>Cargando dashboard...</div>
      </div>
    </div>
  );

  const r            = resumen || {};
  const ventasVal    = r.ventas_mes  || 0;
  const gastosVal    = r.gastos_mes  || 0;
  const utilidad     = r.utilidad_mes || 0;
  const ultimoMes    = ventasMes[ventasMes.length - 1];
  const penultimoMes = ventasMes[ventasMes.length - 2];
  const deltaVentas  = penultimoMes?.ventas > 0
    ? (((ultimoMes?.ventas - penultimoMes?.ventas) / penultimoMes.ventas) * 100).toFixed(1)
    : null;

  return (
    <div style={S.container}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={S.titulo}>Dashboard</h1>
        <div style={{ fontSize: 13, color: '#9ca3af', textTransform: 'capitalize' }}>{fecha}</div>
      </div>

      {/* KPIs */}
      <div style={S.grid6}>
        <KPI label="Ventas del mes"    value={`S/ ${Number(ventasVal).toFixed(2)}`}
          color="#6366f1" icon="💰" delta={r.crecimiento_ventas} sub="vs mes anterior" />
        <KPI label="Gastos del mes"    value={`S/ ${Number(gastosVal).toFixed(2)}`}
          color="#ef4444" icon="💸" sub="acumulado del mes" />
        <KPI label="Utilidad neta"     value={`S/ ${Number(utilidad).toFixed(2)}`}
          color={utilidad >= 0 ? '#10b981' : '#ef4444'}
          icon={utilidad >= 0 ? '📈' : '📉'}
          sub={`Margen ${ventasVal > 0 ? ((utilidad / ventasVal) * 100).toFixed(1) : 0}%`} />
        <KPI label="Productos activos" value={r.total_productos || 0}
          color="#f59e0b" icon="📦" sub={`${r.stock_bajo || 0} con stock bajo`} />
        <KPI label="Stock bajo"        value={r.stock_bajo || 0}
          color={r.stock_bajo > 0 ? '#ef4444' : '#10b981'} icon="⚠️" sub="requieren reposición" />
        <KPI label="Crecimiento"       value={`${r.crecimiento_ventas || 0}%`}
          color={r.crecimiento_ventas >= 0 ? '#10b981' : '#ef4444'}
          icon="📊" delta={deltaVentas} sub="último mes registrado" />
      </div>

      {/* Barra utilidad */}
      <div style={{ marginBottom: 20 }}>
        <UtilBar ventas={ventasVal} gastos={gastosVal} />
      </div>

      {/* Charts */}
      <div style={S.grid2}>
        <div style={S.card}>
          <div style={S.sectionH}>Ventas vs Gastos — últimos 12 meses</div>
          {ventasMes.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={ventasMes} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<TooltipCustom />} />
                <Area type="monotone" dataKey="ventas" stroke="#6366f1" strokeWidth={2}
                  fill="url(#gV)" name="Ventas" dot={false} />
                <Area type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2}
                  fill="url(#gG)" name="Gastos" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
              Sin ventas registradas aún
            </div>
          )}
        </div>

        <div style={S.card}>
          <div style={S.sectionH}>Top 5 productos por ingresos</div>
          {topProductos.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topProductos} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="nombre" type="category" width={120} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<TooltipCustom />} />
                <Bar dataKey="ingresos" radius={[0, 6, 6, 0]} name="Ingresos" barSize={18}>
                  {topProductos.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
              Sin ventas registradas aún
            </div>
          )}
        </div>
      </div>

      {/* Alertas recientes */}
      {alertas.length > 0 && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={S.sectionH}>Alertas sin leer</div>
            <a href="/alertas" style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
              Ver todas →
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            {alertas.map(a => <AlertaBadge key={a.id} alerta={a} />)}
          </div>
        </div>
      )}
    </div>
  );

}


};

export default Dashboard;

