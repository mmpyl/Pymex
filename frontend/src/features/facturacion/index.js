/**
 * Facturacion Feature Module
 * Exporta todos los componentes y servicios del módulo Facturacion
 */

// Domain exports
export { Comprobante, ResumenFacturacion } from './domain/entities.js';
export { FacturacionRepository } from './domain/repository.js';

// Infrastructure exports
export { FacturacionAPIRepository, facturacionRepository } from './infrastructure/repository.js';

// Application exports
export { FacturacionService, facturacionService } from './application/service.js';

// Presentation exports
export { default as FacturacionComponent } from './presentation/Facturacion.jsx';
