/**
 * Dashboard Feature Module
 * Exporta todos los componentes y servicios del módulo Dashboard
 */

// Domain exports
export { ResumenDashboard, SerieFinanciera, ProductoPopular, Alerta, KPIDashboard } from './domain/entities.js';
export { DashboardRepository } from './domain/repository.js';

// Infrastructure exports
export { DashboardAPIRepository, dashboardRepository } from './infrastructure/repository.js';

// Application exports
export { DashboardService, dashboardService } from './application/service.js';

// Presentation exports
export { default as DashboardComponent } from './presentation/Dashboard.jsx';
