import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

const MetricasPage = () => {
  const [metricas, setMetricas] = useState({
    total_empresas: 0,
    empresas_activas: 0,
    mrr: 0,
    churn: 0,
    plan_mas_usado: null,
    nuevas_empresas_mes: 0
  });
  const [loading, setLoading] = useState(true);
  const [historialMRR, setHistorialMRR] = useState([]);

  const loadMetricas = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/super-admin/dashboard');
      setMetricas(response.data);
    } catch (error) {
      console.error('Error loading metricas:', error);
      toast.error('Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetricas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Métricas y KPIs</h1>
        <p className="text-gray-600 mt-1">Indicadores clave de rendimiento de la plataforma</p>
      </div>

      {/* Métricas Principales */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm font-medium opacity-80">Total Empresas</p>
          <p className="text-4xl font-bold mt-2">{metricas.total_empresas}</p>
          <p className="text-xs mt-2 opacity-70">Empresas registradas</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm font-medium opacity-80">Empresas Activas</p>
          <p className="text-4xl font-bold mt-2">{metricas.empresas_activas}</p>
          <p className="text-xs mt-2 opacity-70">
            {metricas.total_empresas > 0 
              ? `${((metricas.empresas_activas / metricas.total_empresas) * 100).toFixed(1)}% del total`
              : '0%'
            }
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm font-medium opacity-80">MRR (Ingreso Recurrente Mensual)</p>
          <p className="text-4xl font-bold mt-2">S/ {metricas.mrr.toFixed(2)}</p>
          <p className="text-xs mt-2 opacity-70">Ingresos mensuales recurrentes</p>
        </div>

        <div className={`rounded-xl shadow-lg p-6 text-white ${metricas.churn > 5 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-teal-500 to-teal-600'}`}>
          <p className="text-sm font-medium opacity-80">Churn Rate</p>
          <p className="text-4xl font-bold mt-2">{metricas.churn}%</p>
          <p className="text-xs mt-2 opacity-70">Tasa de cancelación</p>
        </div>
      </div>

      {/* Métricas Secundarias */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan más Popular</h3>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metricas.plan_mas_usado || 'No disponible'}</p>
              <p className="text-sm text-gray-500">Plan con más suscripciones activas</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crecimiento Mensual</h3>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">+{metricas.nuevas_empresas_mes}</p>
              <p className="text-sm text-gray-500">Nuevas empresas este mes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis Adicional */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Métricas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Ticket Promedio</p>
            <p className="text-xl font-bold text-gray-900">
              {metricas.empresas_activas > 0 
                ? `S/ ${(metricas.mrr / metricas.empresas_activas).toFixed(2)}`
                : 'S/ 0.00'
              }
            </p>
            <p className="text-xs text-gray-400">por empresa/mes</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Proyección Anual</p>
            <p className="text-xl font-bold text-gray-900">S/ {(metricas.mrr * 12).toFixed(2)}</p>
            <p className="text-xs text-gray-400">basado en MRR actual</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Empresas Inactivas</p>
            <p className="text-xl font-bold text-gray-900">{metricas.total_empresas - metricas.empresas_activas}</p>
            <p className="text-xs text-gray-400">suspendidas o eliminadas</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Ratio Activación</p>
            <p className="text-xl font-bold text-gray-900">
              {metricas.total_empresas > 0 
                ? `${((metricas.empresas_activas / metricas.total_empresas) * 100).toFixed(1)}%`
                : '0%'
              }
            </p>
            <p className="text-xs text-gray-400">empresas activas/total</p>
          </div>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Insights</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          {metricas.churn > 5 && (
            <li>• El churn rate está por encima del 5%. Considera revisar la retención de clientes.</li>
          )}
          {metricas.empresas_activas > 0 && metricas.mrr / metricas.empresas_activas < 50 && (
            <li>• El ticket promedio es bajo. Evalúa estrategias de upselling.</li>
          )}
          {metricas.nuevas_empresas_mes > 0 && (
            <li>• ¡Buen crecimiento este mes! {metricas.nuevas_empresas_mes} nuevas empresas se unieron.</li>
          )}
          {metricas.churn === 0 && metricas.empresas_activas > 0 && (
            <li>• Excelente retención de clientes. ¡Churn rate en 0%!</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MetricasPage;
