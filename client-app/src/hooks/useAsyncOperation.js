import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para manejar operaciones asíncronas con loading, error y éxito
 * @param {Function} onSuccess - Callback opcional cuando la operación tiene éxito
 * @param {Function} onError - Callback opcional cuando la operación falla
 * @param {Object} options - Configuración adicional
 */
export const useAsyncOperation = (onSuccess, onError, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const {
    showToast = true,
    successMessage,
    errorMessage,
    clearDataOnStart = false,
  } = options;

  const execute = useCallback(async (asyncFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    if (clearDataOnStart) {
      setData(null);
    }

    try {
      const result = await asyncFunction(...args);
      setData(result);
      
      if (showToast && successMessage) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.userMessage || err.response?.data?.error || errorMessage || 'Ocurrió un error inesperado';
      setError(errorMsg);
      
      if (showToast) {
        toast.error(errorMsg);
      }
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError, showToast, successMessage, errorMessage, clearDataOnStart]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { loading, error, data, execute, reset };
};

export default useAsyncOperation;
