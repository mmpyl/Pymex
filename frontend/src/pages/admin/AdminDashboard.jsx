import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, loading }) => (
  <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
    <p className="m-0 text-xs text-slate-400">{label}</p>
    {loading ? (
      <div className="mt-2 h-8 w-24 animate-pulse rounded bg-slate-700" />
    ) : (
      <h3 className="mt-2 text-2xl font-semibold text-white">{value}</h3>
    )}
  </div>
);

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    total_empresas: 0,
    empresas_activas: 0,
    mrr: 0,
    churn: 0,
    plan_mas_usado: null,
    nuevas_empresas_mes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/super-admin/dashboard');
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        toast.error('Error al cargar métricas del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div>
      <h1 className="mt-0 text-3xl font-bold tracking-tight text-white">Dashboard Super Admin</h1>
      <p className="mb-5 text-slate-400">Métricas globales del SaaS</p>
      
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard label="Total empresas" value={metrics.total_empresas} loading={loading} />
        <StatCard label="Empresas activas" value={metrics.empresas_activas} loading={loading} />
        <StatCard label="MRR" value={`S/ ${metrics.mrr.toFixed(2)}`} loading={loading} />
        <StatCard label="Churn" value={`${metrics.churn}%`} loading={loading} />
      </div>

      {/* Información adicional */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Plan más usado</h3>
          {loading ? (
            <div className="h-6 w-32 animate-pulse rounded bg-slate-700" />
          ) : (
            <p className="text-slate-300">{metrics.plan_mas_usado || 'No disponible'}</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Nuevas empresas este mes</h3>
          {loading ? (
            <div className="h-6 w-32 animate-pulse rounded bg-slate-700" />
          ) : (
            <p className="text-slate-300">{metrics.nuevas_empresas_mes}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
