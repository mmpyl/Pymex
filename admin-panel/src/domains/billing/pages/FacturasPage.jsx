import React from 'react';
import { useFacturas } from '../hooks/useBilling';
import { DataTable, Badge, Button, PageHeader } from '../../../components';

/**
 * Página de Gestión de Facturas
 */
const FacturasPage = () => {
  const { facturas, loading, error, stats, refresh } = useFacturas();

  const columns = [
    { key: 'numero', label: 'Número', sortable: true },
    { key: 'cliente', label: 'Cliente', sortable: true },
    { key: 'fecha', label: 'Fecha', sortable: true },
    { key: 'vencimiento', label: 'Vencimiento', sortable: true },
    { 
      key: 'estado', 
      label: 'Estado', 
      sortable: true,
      render: (value) => {
        const variants = {
          pendiente: 'warning',
          pagada: 'success',
          vencida: 'error',
          cancelada: 'default'
        };
        return <Badge variant={variants[value] || 'default'}>{value}</Badge>;
      }
    },
    { 
      key: 'total', 
      label: 'Total', 
      sortable: true,
      render: (value) => `$${value?.toFixed(2) || '0.00'}`
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Ver</Button>
          <Button variant="outline" size="sm">PDF</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facturas"
        subtitle="Gestión de facturas y cobros"
        actions={[
          <Button key="new">Nueva Factura</Button>
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Facturas</p>
          <p className="text-2xl font-bold">{stats?.total || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
          <p className="text-2xl font-bold text-orange-600">{stats?.pendientes || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pagadas</p>
          <p className="text-2xl font-bold text-green-600">{stats?.pagadas || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Vencidas</p>
          <p className="text-2xl font-bold text-red-600">{stats?.vencidas || 0}</p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={facturas}
        loading={loading}
        error={error}
        onRefresh={refresh}
      />
    </div>
  );
};

export default FacturasPage;
