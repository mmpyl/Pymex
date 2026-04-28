import api from '../../../../api/axios';

/**
 * API para gestión de suspensiones de empresas morosas
 */
export const suspensionesApi = {
  /**
   * Ejecuta el proceso automático de suspensión de empresas morosas
   * @returns {Promise<{mensaje: string, total_suspendidas: number, grace_days: number, fecha_ejecucion: string}>}
   */
  ejecutar: async () => {
    const { data } = await api.post('/suspensiones/ejecutar');
    return data;
  },
};

export default suspensionesApi;
