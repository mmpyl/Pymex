/**
 * Gastos Feature Module
 * Exporta todos los componentes y servicios del módulo Gastos
 */

// Domain exports
export { Gasto, ResumenGastos } from './domain/entities.js';
export { GastosRepository } from './domain/repository.js';

// Infrastructure exports
export { GastosAPIRepository, gastosRepository } from './infrastructure/repository.js';

// Application exports
export { GastosService, gastosService } from './application/service.js';

// Presentation exports
export { default as GastosComponent } from './presentation/Gastos.jsx';
