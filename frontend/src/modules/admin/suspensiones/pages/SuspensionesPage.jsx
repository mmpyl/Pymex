import { useState } from 'react';
import toast from 'react-hot-toast';
import { suspensionesApi } from '../api/suspensionesApi';

/**
 * Página de gestión de suspensiones automáticas de empresas morosas
 * 
 * Permite ejecutar manualmente el proceso de suspensión de empresas que han excedido
 * su período de gracia sin pagar la suscripción.
 */
const SuspensionesPage = () => {
  const [ejecutando, setEjecutando] = useState(false);
  const [ultimoResultado, setUltimoResultado] = useState(null);

  /**
   * Ejecuta el proceso de suspensión automática
   */
  const handleEjecutarSuspension = async () => {
    if (!window.confirm(
      '¿Está seguro que desea ejecutar la suspensión automática de empresas morosas?\n\n' +
      'Esta acción suspenderá todas las empresas cuyas suscripciones hayan vencido ' +
      'hace más días que el período de gracia configurado.'
    )) {
      return;
    }

    try {
      setEjecutando(true);
      const resultado = await suspensionesApi.ejecutar();
      
      setUltimoResultado(resultado);
      
      toast.success(
        `Suspensión ejecutada: ${resultado.total_suspendidas} empresa(s) suspendida(s)`,
        { duration: 5000 }
      );
    } catch (error) {
      console.error('Error al ejecutar suspensión:', error);
      toast.error(
        error.response?.data?.error || 'Error al ejecutar la suspensión. Verifique los logs.'
      );
    } finally {
      setEjecutando(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestión de Suspensiones Automáticas
        </h1>
        <p className="text-gray-600 mt-2">
          Ejecute manualmente el proceso de suspensión de empresas morosas que han excedido 
          su período de gracia. Este proceso verifica las suscripciones vencidas y actualiza 
          el estado de las empresas a "suspendido".
        </p>
      </div>

      {/* Panel de ejecución */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ejecutar Suspensión Automática
        </h2>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Advertencia importante
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Esta acción es irreversible una vez ejecutada</li>
                    <li>Las empresas suspendidas perderán acceso al sistema</li>
                    <li>El período de gracia está configurado en el backend (variable BILLING_GRACE_DAYS)</li>
                    <li>Se recomienda ejecutar este proceso durante horas de bajo tráfico</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleEjecutarSuspension}
            disabled={ejecutando}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors ${
              ejecutando
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {ejecutando ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ejecutando...
              </span>
            ) : (
              'Ejecutar Suspensión Automática'
            )}
          </button>
        </div>
      </div>

      {/* Resultados de la última ejecución */}
      {ultimoResultado && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Última Ejecución
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm font-medium text-green-800">Empresas Suspendidas</div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {ultimoResultado.total_suspendidas}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm font-medium text-blue-800">Días de Gracia</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {ultimoResultado.grace_days}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 md:col-span-2">
              <div className="text-sm font-medium text-purple-800">Fecha de Ejecución</div>
              <div className="text-lg font-semibold text-purple-600 mt-2">
                {new Date(ultimoResultado.fecha_ejecucion).toLocaleString('es-ES', {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Mensaje del Sistema</div>
            <div className="text-gray-600">{ultimoResultado.mensaje}</div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          ¿Cómo funciona el proceso de suspensión?
        </h3>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>El sistema identifica todas las suscripciones con estado "activa" o "trial"</li>
          <li>Verifica cuáles tienen fecha_fin anterior a hoy menos el período de gracia</li>
          <li>Actualiza el estado de la suscripción a "suspendida"</li>
          <li>Actualiza el estado de la empresa asociada a "suspendido"</li>
          <li>La empresa pierde acceso inmediato al sistema</li>
        </ol>
      </div>
    </div>
  );
};

export default SuspensionesPage;
