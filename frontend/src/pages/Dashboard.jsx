// pages/Dashboard.jsx — Rediseñado
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../api/axios';

const fmt = (n) => {
  if (!n && n !== 0) return '—';
  return new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
};

const fmtInt = (n) => new Intl.NumberFormat('es-PE').format(n || 0);

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [series, setSeries] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { usuario } = useAuth();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [r, v, g, t, a] = await Promise.all([
        api.get('/dashboard/resumen'),
        api.get('/dashboard/ventas-mensuales'),
        api.get('/dashboard/gastos-mensuales'),
        api.get('/dashboard/top-productos'),
        api.get('/alertas').catch(() => ({ data: [] })),
      ]);

      setResumen(r.data);

      const vMap = {};
      v.data.forEach(d => {
        const k = new Date(d.mes).toLocaleDateString('es-PE', { month: 'short' });
        vMap[k] = { mes: k, ventas: parseFloat(d.total || 0), gastos: 0 };
      });
      g.data.forEach(d => {
        const k = new Date(d.mes).toLocaleDateString('es-PE', { month: 'short' });
        if (vMap[k]) vMap[k].gastos = parseFloat(d.total || 0);
        else vMap[k] = { mes: k, ventas: 0, gastos: parseFloat(d.total || 0) };
      });
      setSeries(Object.values(vMap).slice(-6));
      setTopProductos((t.data || []).slice(0, 5));
      setAlertas((a.data || []).filter(x => !x.leido).slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const utilidad = (resumen?.ventas_mes || 0) - (resumen?.gastos_mes || 0);
  const margen = resumen?.ventas_mes > 0
    ? ((utilidad / resumen.ventas_mes) * 100).toFixed(1)
    : 0;

  const kpis = [
    {
      label: 'Ventas del mes',
      value: `S/ ${fmt(resumen?.ventas_mes)}`,
      delta: resumen?.crecimiento_ventas,
      up: (resumen?.crecimiento_ventas || 0) >= 0,
      color: 'var(--navy-700)',
      accent: 'var(--navy-500)',
      icon: <KpiIconVentas />,
    },
    {
      label: 'Gastos del mes',
      value: `S/ ${fmt(resumen?.gastos_mes)}`,
      delta: null,
      color: 'var(--coral-500)',
      accent: '#E97060',
      icon: <KpiIconGastos />,
    },
    {
      label: 'Utilidad neta',
      value: `S/ ${fmt(utilidad)}`,
      delta: parseFloat(margen),
      up: utilidad >= 0,
      deltaLabel: `${margen}% margen`,
      color: utilidad >= 0 ? 'var(--sage-600)' : 'var(--coral-500)',
      accent: utilidad >= 0 ? 'var(--sage-400)' : '#E97060',
      icon: <KpiIconUtilidad />,
    },
    {
      label: 'Productos activos',
      value: fmtInt(resumen?.total_productos),
      sub: `${fmtInt(resumen?.stock_bajo)} con stock bajo`,
      subDanger: (resumen?.stock_bajo || 0) > 0,
      color: 'var(--amber-600)',
      accent: 'var(--amber-400)',
      icon: <KpiIconProductos />,
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-heading">
            {greeting()},{' '}
            <span style={{ color: 'var(--navy-600)' }}>
              {firstName(usuario)}
            </span>
          </h1>
          <p className="page-desc">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button className="btn btn-accent" onClick={load}>
          <RefreshIcon /> Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {kpis.map(kpi => (
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Ventas vs Gastos */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>
                Ventas vs Gastos
              </div>
              <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
                Últimos 6 meses
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--navy-500)', display: 'inline-block' }} />
                Ventas
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#E97060', display: 'inline-block' }} />
                Gastos
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={series} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gventa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--navy-500)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--navy-500)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ggasto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E97060" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#E97060" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `S/${v > 999 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 13 }}
                formatter={v => [`S/ ${fmt(v)}`]}
              />
              <Area type="monotone" dataKey="ventas" stroke="var(--navy-500)" strokeWidth={2} fill="url(#gventa)" name="Ventas" />
              <Area type="monotone" dataKey="gastos" stroke="#E97060" strokeWidth={2} fill="url(#ggasto)" name="Gastos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Productos */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, letterSpacing: '-0.2px' }}>Top productos</div>
          <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 16 }}>Por ingreso acumulado</div>

          {topProductos.length === 0 ? (
            <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              Sin ventas registradas
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topProductos.map((p, i) => {
                const maxVal = parseFloat(topProductos[0]?.total_ingresos || 1);
                const pct = ((parseFloat(p.total_ingresos) / maxVal) * 100).toFixed(0);
                const COLORS = ['var(--navy-600)', 'var(--navy-400)', 'var(--navy-300)', 'var(--amber-500)', 'var(--amber-400)'];
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                      <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                        {p.Producto?.nombre}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--navy-600)', flexShrink: 0 }}>
                        S/ {fmt(p.total_ingresos)}
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'hsl(var(--muted))', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: COLORS[i], borderRadius: 3, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Alertas */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Alertas recientes</div>
            {alertas.length > 0 && (
              <span className="badge badge-danger">{alertas.length} sin leer</span>
            )}
          </div>

          {alertas.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '24px 0', gap: 8,
            }}>
              <CheckCircleIcon />
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--sage-600)' }}>Todo en orden</div>
              <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>No hay alertas pendientes</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alertas.map(a => <AlertRow key={a.id} alerta={a} />)}
            </div>
          )}
        </div>

        {/* Margen Visual */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Salud financiera del mes</div>
          <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 20 }}>
            Ratio gastos / ventas
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Ventas', value: resumen?.ventas_mes || 0, color: 'var(--navy-500)', max: resumen?.ventas_mes || 1 },
              { label: 'Gastos', value: resumen?.gastos_mes || 0, color: '#E97060', max: resumen?.ventas_mes || 1 },
              { label: 'Utilidad', value: Math.max(0, utilidad), color: 'var(--sage-500)', max: resumen?.ventas_mes || 1 },
            ].map(item => {
              const pct = Math.min(100, ((item.value / item.max) * 100)).toFixed(1);
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'hsl(var(--muted-foreground))' }}>{item.label}</span>
                    <span style={{ fontWeight: 600 }}>S/ {fmt(item.value)}</span>
                  </div>
                  <div style={{ height: 8, background: 'hsl(var(--muted))', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: 4, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20, padding: '12px 16px', background: 'hsl(var(--muted))', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 2 }}>Margen neto</div>
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.5px', color: utilidad >= 0 ? 'var(--sage-600)' : 'var(--coral-500)' }}>
              {margen}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ——— Sub-components ——— */

function StatCard({ label, value, delta, up, sub, subDanger, deltaLabel, color, accent, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-accent" style={{ background: accent }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="stat-card-icon" style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)` }}>
          <span style={{ color, width: 20, height: 20 }}>{icon}</span>
        </div>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      {delta !== null && delta !== undefined && (
        <span className={`stat-trend ${up ? 'up' : 'down'}`}>
          {up ? '↑' : '↓'} {deltaLabel || `${Math.abs(delta).toFixed(1)}%`}
        </span>
      )}
      {sub && (
        <div style={{ fontSize: 12, marginTop: 6, color: subDanger ? 'var(--coral-500)' : 'hsl(var(--muted-foreground))' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

const ALERT_TYPES = {
  stock_bajo:   { bg: 'var(--coral-50)',  color: 'var(--coral-500)', label: 'Stock bajo' },
  ventas_bajas: { bg: 'var(--amber-50)',  color: 'var(--amber-700)', label: 'Ventas bajas' },
  default:      { bg: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', label: 'Alerta' },
};

function AlertRow({ alerta }) {
  const cfg = ALERT_TYPES[alerta.tipo] || ALERT_TYPES.default;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '10px 12px', borderRadius: 8,
      background: cfg.bg,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, marginTop: 5, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
          {cfg.label}
        </div>
        <div style={{ fontSize: 13, color: 'hsl(var(--foreground))', lineHeight: 1.5 }}>{alerta.mensaje}</div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 110, borderRadius: 12 }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="skeleton" style={{ height: 280, borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 280, borderRadius: 12 }} />
      </div>
    </div>
  );
}

/* ——— Icons ——— */
function KpiIconVentas() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14l4-5 3 3 4-5 3 4"/>
    </svg>
  );
}
function KpiIconGastos() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="16" height="12" rx="2"/>
      <path d="M14 5V4a2 2 0 00-2-2H8a2 2 0 00-2 2v1"/>
      <path d="M10 11v2M10 9v.5"/>
    </svg>
  );
}
function KpiIconUtilidad() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8"/>
      <path d="M10 6v2.5M10 11.5V14"/>
      <path d="M8 8.5c0-1 .9-2 2-2s2 .9 2 2-1 1.5-2 1.5-2 .5-2 1.5.9 2 2 2 2-.9 2-2"/>
    </svg>
  );
}
function KpiIconProductos() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5.5l7-3.5 7 3.5v9l-7 3.5-7-3.5v-9z"/>
      <path d="M10 2v13M3 5.5l7 3.5 7-3.5"/>
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 7A5.5 5.5 0 0112 4M12.5 7A5.5 5.5 0 012 10"/>
      <path d="M10.5 3.5L12 4.5V3M1.5 11.5v-1.5L3 11"/>
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--sage-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="13"/>
      <path d="M10 16l4 4 8-8"/>
    </svg>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function firstName(usuario) {
  if (!usuario?.nombre) return '';
  return usuario.nombre.split(' ')[0];
}