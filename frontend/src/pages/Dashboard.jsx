import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
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
      v.data.forEach((d) => {
        const k = new Date(d.mes).toLocaleDateString('es-PE', { month: 'short' });
        vMap[k] = { mes: k, ventas: parseFloat(d.total || 0), gastos: 0 };
      });
      g.data.forEach((d) => {
        const k = new Date(d.mes).toLocaleDateString('es-PE', { month: 'short' });
        if (vMap[k]) vMap[k].gastos = parseFloat(d.total || 0);
        else vMap[k] = { mes: k, ventas: 0, gastos: parseFloat(d.total || 0) };
      });

      setSeries(Object.values(vMap).slice(-6));
      setTopProductos((t.data || []).slice(0, 5));
      setAlertas((a.data || []).filter((x) => !x.leido).slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const utilidad = (resumen?.ventas_mes || 0) - (resumen?.gastos_mes || 0);
  const margen = resumen?.ventas_mes > 0 ? ((utilidad / resumen.ventas_mes) * 100).toFixed(1) : 0;

  const kpis = [
    { label: 'Ventas del mes', value: `S/ ${fmt(resumen?.ventas_mes)}`, sub: resumen?.crecimiento_ventas != null ? `${resumen.crecimiento_ventas.toFixed(1)}% vs mes pasado` : 'Sin variación', color: 'text-indigo-700' },
    { label: 'Gastos del mes', value: `S/ ${fmt(resumen?.gastos_mes)}`, sub: 'Control de egresos', color: 'text-rose-600' },
    { label: 'Utilidad neta', value: `S/ ${fmt(utilidad)}`, sub: `${margen}% margen`, color: utilidad >= 0 ? 'text-emerald-600' : 'text-rose-600' },
    { label: 'Productos activos', value: fmtInt(resumen?.total_productos), sub: `${fmtInt(resumen?.stock_bajo)} con stock bajo`, color: 'text-amber-600' },
  ];

  const serieFinanciera = [
    { label: 'Ventas', value: resumen?.ventas_mes || 0, color: 'bg-indigo-500' },
    { label: 'Gastos', value: resumen?.gastos_mes || 0, color: 'bg-rose-500' },
    { label: 'Utilidad', value: utilidad, color: utilidad >= 0 ? 'bg-emerald-500' : 'bg-rose-700' },
  ];
  const maxRef = Math.max(...serieFinanciera.map((i) => Math.abs(i.value)), 1);

  return (
    <div className="mx-auto max-w-[1280px] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting()}, <span className="text-indigo-600">{firstName(usuario)}</span>
          </h1>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" onClick={load}>
          <RefreshIcon /> Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">{kpi.label}</p>
            <p className={`mt-1 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="mt-2 text-xs text-slate-500">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Ventas vs Gastos</h3>
              <p className="text-xs text-slate-500">Últimos meses</p>
            </div>
            <div className="flex gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />Ventas</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-rose-400" />Gastos</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="ventasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(v) => `S/ ${fmt(v)}`} />
                <Area type="monotone" dataKey="ventas" stroke="#4f46e5" fill="url(#ventasGrad)" strokeWidth={2} />
                <Bar dataKey="gastos" fill="#fb7185" radius={[4, 4, 0, 0]} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Top productos</h3>
          <p className="mb-4 text-xs text-slate-500">Por ingreso acumulado</p>
          {topProductos.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Sin datos de productos aún.</p>
          ) : (
            <div className="space-y-3">
              {topProductos.map((p, i) => {
                const pct = topProductos[0]?.total_ingresos ? (Number(p.total_ingresos) / Number(topProductos[0].total_ingresos)) * 100 : 0;
                const colors = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];
                return (
                  <div key={p.producto_id || p.nombre || i}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="max-w-[65%] truncate font-medium text-slate-700">{p.nombre}</span>
                      <span className="font-semibold text-indigo-700">S/ {fmt(p.total_ingresos)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded bg-slate-100">
                      <div className="h-full rounded" style={{ width: `${pct}%`, background: colors[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Alertas recientes</h3>
            <button className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Ver todas</button>
          </div>
          {alertas.length === 0 ? (
            <div className="rounded-lg bg-emerald-50 p-4 text-emerald-700">
              <p className="font-semibold">Todo en orden</p>
              <p className="text-sm">No hay alertas pendientes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alertas.map((a) => <AlertItem key={a.id} alerta={a} />)}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Salud financiera del mes</h3>
          <p className="mb-4 text-xs text-slate-500">Comparativo de indicadores clave</p>
          <div className="space-y-4">
            {serieFinanciera.map((item) => {
              const pct = (Math.abs(item.value) / maxRef) * 100;
              return (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="font-semibold">S/ {fmt(item.value)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded bg-slate-100">
                    <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Margen neto</p>
            <p className={`text-2xl font-semibold ${utilidad >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{margen}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ alerta }) {
  const type = alerta.tipo;
  const cfg = type === 'stock_bajo'
    ? { color: 'bg-red-500', badge: 'text-red-700 bg-red-100', label: 'Stock bajo' }
    : type === 'ventas_bajas'
      ? { color: 'bg-amber-500', badge: 'text-amber-700 bg-amber-100', label: 'Ventas bajas' }
      : type === 'gastos_altos'
        ? { color: 'bg-violet-500', badge: 'text-violet-700 bg-violet-100', label: 'Gastos altos' }
        : { color: 'bg-slate-500', badge: 'text-slate-700 bg-slate-100', label: 'Alerta' };

  return (
    <div className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
      <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${cfg.color}`} />
      <div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${cfg.badge}`}>{cfg.label}</span>
        <p className="mt-1 text-sm text-slate-700">{alerta.mensaje}</p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1280px] space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[110px] rounded-xl bg-slate-200/70" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="h-[280px] rounded-xl bg-slate-200/70 xl:col-span-2" />
        <div className="h-[280px] rounded-xl bg-slate-200/70" />
      </div>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: 6, verticalAlign: '-2px' }}>
      <path d="M12 7a5 5 0 10-1.46 3.54" />
      <path d="M12 3v4h-4" />
    </svg>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function firstName(user) {
  if (!user?.nombre) return 'usuario';
  return user.nombre.split(' ')[0];
}
