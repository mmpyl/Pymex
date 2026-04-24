import api from '../../../api/axios';

const resourceApi = (resource) => ({
  list: async () => {
    const { data } = await api.get(`/${resource}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post(`/${resource}`, payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/${resource}/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/${resource}/${id}`);
    return data;
  },
});

export const clientesApi = resourceApi('clientes');
export const proveedoresApi = resourceApi('proveedores');
export const categoriasApi = resourceApi('categorias');
export const productosApi = resourceApi('productos');
