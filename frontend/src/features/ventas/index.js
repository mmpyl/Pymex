/**
 * Ventas Feature Module
 */

// Domain exports
export { Venta, ItemVenta, ClienteVenta, ResumenVentas } from './domain/entities.js';
export { VentasRepository } from './domain/repository.js';

// Infrastructure exports
export { VentasAPIRepository, ventasRepository } from './infrastructure/repository.js';

// Application exports
export { VentasService, ventasService } from './application/service.js';

// Presentation exports
export { default as VentasComponent } from './presentation/Ventas.jsx';
