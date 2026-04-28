import { useState, useCallback } from 'react';
import { suspensionesApi } from '../api/suspensionesApi';

/**
 * Hook personalizado para gestionar operaciones de suspensión de empresas
 * 
 * @returns {{
 *   ejecutando: boolean,
 *   ultimoResultado: object | null,
 *   error: Error | null,
 *   ejecutarSuspension: () => Promise<void>,
 *   limpiarResultado: () => void
 * }}
 */
export const useSuspensiones = () => {
  const [ejecutando, setEjecutando] = useState(false);
  const [ultimoResultado, setUltimoResultado] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Ejecuta el proceso de suspensión automática
   */
  const ejecutarSuspension = useCallback(async () => {
    try {
      setEjecutando(true);
      setError(null);
      
      const resultado = await suspensionesApi.ejecutar();
      setUltimoResultado(resultado);
      
      return resultado;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setEjecutando(false);
    }
  }, []);

  /**
   * Limpia el resultado de la última ejecución
   */
  const limpiarResultado = useCallback(() => {
    setUltimoResultado(null);
    setError(null);
  }, []);

  return {
    ejecutando,
    ultimoResultado,
    error,
    ejecutarSuspension,
    limpiarResultado,
  };
};

export default useSuspensiones;
