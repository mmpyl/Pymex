/**
 * Dashboard Presentation Components
 * Componentes React para la visualización del Dashboard
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { dashboardService } from '../application/service.js';
import { Alerta } from '../domain/entities.js';

// Componente principal del Dashboard
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [kpis, setKpis] = useState([]);
  const [serieFinanciera, setSerieFinanciera] = useState([]);
  const [loading, setLoading] = useState(true);
  const { usuario } = useAuth();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const result = await dashboardService.loadDashboardData();
      setData(result);
      setKpis(dashboardService.calculateKPIs(result.resumen));
      setSerieFinanciera(dashboardService.calculateSerieFinanciera(result.resumen));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">{kpi.label}</p>
            <p className={`mt-1 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="mt-2 text-xs text-slate-500">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm xl:col-span-2">
          <VentasGastosChart series={data.series} />
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <TopProductos productos={data.topProductos} />
        </div>
      </div>

      {/* Alerts & Financial Health */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AlertasRecientes alertas={data.alertas} />
        <SaludFinanciera serie={serieFinanciera} resumen={data.resumen} />
      </div>
    </div>
  );
}

// Sub-componente: Gráfico de Ventas vs Gastos
function VentasGastosChart({ series }) {
  const fmt = (n) => {
    if (!n && n !== 0) return '—';
    return new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };

  return (
    <>
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
    </>
  );
}

// Sub-componente: Top Productos
function TopProductos({ productos }) {
  const fmt = (n) => {
    if (!n && n !== 0) return '—';
    return new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };

  if (productos.length === 0) {
    return (
      <>
        <h3 className="text-sm font-semibold text-slate-800">Top productos</h3>
        <p className="mb-4 text-xs text-slate-500">Por ingreso acumulado</p>
        <p className="py-6 text-center text-sm text-slate-400">Sin datos de productos aún.</p>
      </>
    );
  }

  const colors = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <>
      <h3 className="text-sm font-semibold text-slate-800">Top productos</h3>
      <p className="mb-4 text-xs text-slate-500">Por ingreso acumulado</p>
      <div className="space-y-3">
        {productos.map((p, i) => {
          const pct = productos[0]?.total_ingresos ? (Number(p.total_ingresos) / Number(productos[0].total_ingresos)) * 100 : 0;
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
    </>
  );
}

// Sub-componente: Alertas Recientes
function AlertasRecientes({ alertas }) {
  return (
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
  );
}

// Sub-componente: Item de Alerta individual
function AlertItem({ alerta }) {
  const cfg = Alerta.getTipoConfig(alerta.tipo);

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

// Sub-componente: Salud Financiera
function SaludFinanciera({ serie, resumen }) {
  const fmt = (n) => {
    if (!n && n !== 0) return '—';
    return new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };

  const utilidad = (resumen?.ventas_mes || 0) - (resumen?.gastos_mes || 0);
  const margen = resumen?.ventas_mes > 0 ? ((utilidad / resumen.ventas_mes) * 100).toFixed(1) : 0;
  const maxRef = Math.max(...serie.map((i) => Math.abs(i.value)), 1);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Salud financiera del mes</h3>
      <p className="mb-4 text-xs text-slate-500">Comparativo de indicadores clave</p>
      <div className="space-y-4">
        {serie.map((item) => {
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
  );
}

// Skeleton Loader
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

// Iconos y utilidades
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
