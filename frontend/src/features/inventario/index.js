/**
 * Inventario Feature Module
 * Exporta todos los componentes y servicios del módulo Inventario
 */

// Domain exports
export { ProductoInventario, MovimientoInventario, ResumenInventario } from './domain/entities.js';
export { InventarioRepository } from './domain/repository.js';

// Infrastructure exports
export { InventarioAPIRepository, inventarioRepository } from './infrastructure/repository.js';

// Application exports
export { InventarioService, inventarioService } from './application/service.js';

// Presentation exports
export { default as InventarioComponent } from './presentation/Inventario.jsx';
