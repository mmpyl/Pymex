import React from 'react';
import { usePagos } from '../hooks/useBilling';
import { DataTable, Badge, Button, PageHeader } from '../../../components';

/**
 * Página de Gestión de Pagos
 */
const PagosPage = () => {
  const { pagos, loading, error, metodosPago, refresh } = usePagos();

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'factura', label: 'Factura', sortable: true },
    { key: 'cliente', label: 'Cliente', sortable: true },
    { key: 'fecha', label: 'Fecha', sortable: true },
    { 
      key: 'metodo', 
      label: 'Método', 
      sortable: true,
      render: (value) => <Badge variant="info">{value}</Badge>
    },
    { 
      key: 'estado', 
      label: 'Estado', 
      sortable: true,
      render: (value) => {
        const variants = {
          pendiente: 'warning',
          completado: 'success',
          fallido: 'error',
          revertido: 'default'
        };
        return <Badge variant={variants[value] || 'default'}>{value}</Badge>;
      }
    },
    { 
      key: 'monto', 
      label: 'Monto', 
      sortable: true,
      render: (value) => `$${value?.toFixed(2) || '0.00'}`
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Ver</Button>
          {row.estado === 'pendiente' && (
            <Button variant="primary" size="sm">Procesar</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagos"
        subtitle="Gestión de pagos y métodos de cobro"
        actions={[
          <Button key="new">Registrar Pago</Button>
        ]}
      />

      {/* Métodos de Pago */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Métodos de Pago Disponibles</h3>
        <div className="flex gap-4 flex-wrap">
          {metodosPago?.map((metodo) => (
            <Badge key={metodo.id} variant="info">
              {metodo.nombre}
            </Badge>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={pagos}
        loading={loading}
        error={error}
        onRefresh={refresh}
      />
    </div>
  );
};

export default PagosPage;
