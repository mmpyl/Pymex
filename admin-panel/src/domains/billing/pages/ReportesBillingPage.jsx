import React, { useState } from 'react';
import { useReportesBilling } from '../hooks/useBilling';
import { Card, Button, Select } from '../../../components';

/**
 * Página de Reportes de Billing
 */
const ReportesBillingPage = () => {
  const { ingresos, morosidad, flujoCaja, loading, loadIngresos, loadMorosidad, loadFlujoCaja } = useReportesBilling();
  const [periodo, setPeriodo] = useState('mes');

  const handleLoadReporte = async (tipo) => {
    switch (tipo) {
      case 'ingresos':
        await loadIngresos({ periodo });
        break;
      case 'morosidad':
        await loadMorosidad({ periodo });
        break;
      case 'flujoCaja':
        await loadFlujoCaja({ periodo });
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes de Billing</h1>
          <p className="text-gray-600 dark:text-gray-400">Análisis financiero y métricas clave</p>
        </div>
        <Select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          options={[
            { value: 'semana', label: 'Última Semana' },
            { value: 'mes', label: 'Último Mes' },
            { value: 'trimestre', label: 'Último Trimestre' },
            { value: 'anio', label: 'Último Año' }
          ]}
        />
      </div>

      {/* Reporte de Ingresos */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ingresos</h2>
          <Button variant="outline" size="sm" onClick={() => handleLoadReporte('ingresos')}>
            Actualizar
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Ingresos</p>
              <p className="text-2xl font-bold text-green-600">
                ${ingresos?.total?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos Recurrentes</p>
              <p className="text-2xl font-bold text-blue-600">
                ${ingresos?.recurrentes?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Crecimiento</p>
              <p className="text-2xl font-bold text-purple-600">
                {ingresos?.crecimiento?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Reporte de Morosidad */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Morosidad</h2>
          <Button variant="outline" size="sm" onClick={() => handleLoadReporte('morosidad')}>
            Actualizar
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Moroso</p>
              <p className="text-2xl font-bold text-red-600">
                ${morosidad?.total?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">% Morosidad</p>
              <p className="text-2xl font-bold text-orange-600">
                {morosidad?.porcentaje?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Facturas Vencidas</p>
              <p className="text-2xl font-bold text-yellow-600">
                {morosidad?.facturasVencidas || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Días Promedio</p>
              <p className="text-2xl font-bold text-gray-600">
                {morosidad?.diasPromedio || 0}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Reporte de Flujo de Caja */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Flujo de Caja</h2>
          <Button variant="outline" size="sm" onClick={() => handleLoadReporte('flujoCaja')}>
            Actualizar
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Entradas</p>
              <p className="text-2xl font-bold text-green-600">
                ${flujoCaja?.entradas?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Salidas</p>
              <p className="text-2xl font-bold text-red-600">
                ${flujoCaja?.salidas?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Balance Neto</p>
              <p className={`text-2xl font-bold ${(flujoCaja?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${flujoCaja?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReportesBillingPage;
