import React from 'react';
import { useSuscripciones } from '../hooks/useBilling';
import { DataTable, Badge, Button, PageHeader } from '../../../components';

/**
 * Página de Gestión de Suscripciones
 */
const SuscripcionesPage = () => {
  const { suscripciones, loading, error, planes, refresh } = useSuscripciones();

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'empresa', label: 'Empresa', sortable: true },
    { 
      key: 'plan', 
      label: 'Plan', 
      sortable: true,
      render: (value) => <Badge variant="primary">{value?.nombre || value}</Badge>
    },
    { key: 'fechaInicio', label: 'Fecha Inicio', sortable: true },
    { key: 'fechaFin', label: 'Fecha Fin', sortable: true },
    { 
      key: 'estado', 
      label: 'Estado', 
      sortable: true,
      render: (value) => {
        const variants = {
          activa: 'success',
          inactiva: 'default',
          cancelada: 'error',
          pendiente: 'warning'
        };
        return <Badge variant={variants[value] || 'default'}>{value}</Badge>;
      }
    },
    { 
      key: 'monto', 
      label: 'Monto Mensual', 
      sortable: true,
      render: (value) => `$${value?.toFixed(2) || '0.00'}`
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Ver</Button>
          {row.estado === 'activa' ? (
            <Button variant="error" size="sm">Cancelar</Button>
          ) : (
            <Button variant="success" size="sm">Reactivar</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suscripciones"
        subtitle="Gestión de planes y suscripciones"
        actions={[
          <Button key="new">Nueva Suscripción</Button>
        ]}
      />

      {/* Planes Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {planes?.map((plan) => (
          <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {plan.nombre}
            </h3>
            <p className="text-3xl font-bold text-blue-600 mb-4">
              ${plan.precio?.toFixed(2) || '0.00'}/mes
            </p>
            <ul className="space-y-2 mb-4">
              {plan.caracteristicas?.map((caract, idx) => (
                <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span className="text-green-500">✓</span> {caract}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full">Seleccionar</Button>
          </div>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={suscripciones}
        loading={loading}
        error={error}
        onRefresh={refresh}
      />
    </div>
  );
};

export default SuscripcionesPage;
