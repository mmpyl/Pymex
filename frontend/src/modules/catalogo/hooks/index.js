import { categoriasApi, clientesApi, productosApi, proveedoresApi } from '../api/catalogoApi';
import { useCatalogoCrud } from './useCatalogoCrud';

export const useClientes = () => useCatalogoCrud({
  api: clientesApi,
  errorMessages: {
    load: 'Error al cargar clientes',
    save: 'Error al guardar cliente',
    remove: 'Error al eliminar cliente',
  },
  successMessages: {
    create: 'Cliente creado',
    update: 'Cliente actualizado',
    remove: 'Cliente eliminado',
  },
});

export const useProveedores = () => useCatalogoCrud({
  api: proveedoresApi,
  errorMessages: {
    load: 'Error al cargar proveedores',
    save: 'Error al guardar proveedor',
    remove: 'Error al eliminar proveedor',
  },
  successMessages: {
    create: 'Proveedor creado',
    update: 'Proveedor actualizado',
    remove: 'Proveedor eliminado',
  },
});

export const useCategorias = () => useCatalogoCrud({
  api: categoriasApi,
  errorMessages: {
    load: 'Error al cargar categorías',
    save: 'Error al guardar categoría',
    remove: 'Error al eliminar categoría',
  },
  successMessages: {
    create: 'Categoría creada',
    update: 'Categoría actualizada',
    remove: 'Categoría eliminada',
  },
});

export const useProductos = () => useCatalogoCrud({
  api: productosApi,
  errorMessages: {
    load: 'Error al cargar productos',
    save: 'Error al guardar producto',
    remove: 'Error al eliminar producto',
  },
  successMessages: {
    create: 'Producto creado',
    update: 'Producto actualizado',
    remove: 'Producto eliminado',
  },
});
