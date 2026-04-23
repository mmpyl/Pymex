/**
 * Límites del Dominio - Domain Boundaries
 * 
 * Este archivo define los límites entre los diferentes dominios del sistema
 * según los principios de Domain-Driven Design (DDD).
 * 
 * DOMINIOS IDENTIFICADOS:
 * 1. AUTH (Autenticación y Autorización)
 * 2. BILLING (Facturación, Pagos, Suscripciones)
 * 3. ML (Machine Learning Orchestration)
 * 4. CORE (Gestión de Empresas, Usuarios, Productos, Ventas, Inventario)
 * 
 * REGLAS DE ACOPLAMIENTO:
 * - Los dominios NO pueden hacer JOINs directos entre sus tablas
 * - La comunicación entre dominios debe ser a través de eventos o APIs definidas
 * - Cada dominio tiene su propia base de datos lógica (mismo schema físico por ahora)
 */

const DOMAIN_BOUNDARIES = {
  /**
   * DOMINIO AUTH
   * Responsabilidades: Autenticación, autorización, gestión de sesiones, RBAC
   * Modelos propios: Usuario, Rol, Permiso, UsuarioAdmin, RevokedToken
   * Dependencies: Ninguna (dominio base)
   */
  AUTH: {
    name: 'auth',
    description: 'Autenticación y Autorización',
    models: [
      'Usuario',
      'Rol',
      'Permiso',
      'RolPermiso',
      'UsuarioAdmin',
      'RevokedToken'
    ],
    allowedDependencies: [], // No depende de otros dominios
    exposedAPIs: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/logout',
      '/api/auth/refresh',
      '/api/rbac/*'
    ],
    events: {
      produced: ['USER_CREATED', 'USER_AUTHENTICATED', 'PERMISSION_CHANGED'],
      consumed: ['COMPANY_SUSPENDED', 'SUBSCRIPTION_CANCELLED']
    }
  },

  /**
   * DOMINIO BILLING
   * Responsabilidades: Planes, suscripciones, pagos, facturación electrónica
   * Modelos propios: Plan, Feature, PlanFeature, PlanLimit, Suscripcion, 
   *                  FeatureOverride, Pago, PaymentEvent, Comprobante, SerieComprobante
   * Dependencies: AUTH (para verificar estado de empresa)
   */
  BILLING: {
    name: 'billing',
    description: 'Facturación, Pagos y Suscripciones',
    models: [
      'Plan',
      'Feature',
      'PlanFeature',
      'PlanLimit',
      'Suscripcion',
      'FeatureOverride',
      'Pago',
      'PaymentEvent',
      'Comprobante',
      'SeriesComprobante'
    ],
    allowedDependencies: ['AUTH'], // Solo puede consultar estado de AUTH
    exposedAPIs: [
      '/api/saas/*',
      '/api/pagos/*',
      '/api/facturacion/*',
      '/api/payments/*',
      '/api/features/*',
      '/api/suspensiones/*'
    ],
    events: {
      produced: [
        'SUBSCRIPTION_ACTIVATED',
        'SUBSCRIPTION_CANCELLED',
        'PAYMENT_COMPLETED',
        'PAYMENT_FAILED',
        'INVOICE_ISSUED',
        'COMPANY_SUSPENDED'
      ],
      consumed: ['COMPANY_CREATED', 'USAGE_THRESHOLD_REACHED']
    }
  },

  /**
   * DOMINIO ML
   * Responsabilidades: Predicciones, modelos de machine learning, análisis predictivo
   * Modelos propios: Prediccion, ModeloML, Entrenamiento
   * Dependencies: CORE (lectura de datos históricos)
   */
  ML: {
    name: 'ml',
    description: 'Machine Learning Orchestration',
    models: [
      'Prediccion',
      'ModeloML',
      'Entrenamiento'
    ],
    allowedDependencies: ['CORE'], // Solo lectura de datos de CORE
    exposedAPIs: [
      '/api/ml/*'
    ],
    events: {
      produced: ['PREDICTION_GENERATED', 'MODEL_TRAINED', 'ANOMALY_DETECTED'],
      consumed: ['SALE_COMPLETED', 'INVENTORY_UPDATED']
    }
  },

  /**
   * DOMINIO CORE
   * Responsabilidades: Gestión de empresas, productos, ventas, clientes, inventario
   * Modelos propios: Empresa, Producto, Categoria, Cliente, Proveedor, 
   *                  Venta, DetalleVenta, Gasto, MovimientoInventario, 
   *                  Alerta, AuditLog, ApiKey, Rubro, EmpresaRubro
   * Dependencies: AUTH (para verificar tenant), BILLING (para verificar features)
   */
  CORE: {
    name: 'core',
    description: 'Core Business Logic',
    models: [
      'Empresa',
      'Producto',
      'Categoria',
      'Cliente',
      'Proveedor',
      'Venta',
      'DetalleVenta',
      'Gasto',
      'MovimientoInventario',
      'Alerta',
      'AuditLog',
      'ApiKey',
      'Rubro',
      'EmpresaRubro'
    ],
    allowedDependencies: ['AUTH', 'BILLING'], // Verifica tenant y features
    exposedAPIs: [
      '/api/usuarios/*',
      '/api/productos/*',
      '/api/categorias/*',
      '/api/ventas/*',
      '/api/gastos/*',
      '/api/clientes/*',
      '/api/proveedores/*',
      '/api/inventario/*',
      '/api/dashboard/*',
      '/api/alertas/*',
      '/api/reportes/*'
    ],
    events: {
      produced: [
        'COMPANY_CREATED',
        'SALE_COMPLETED',
        'INVENTORY_UPDATED',
        'PRODUCT_CREATED',
        'USAGE_THRESHOLD_REACHED'
      ],
      consumed: ['SUBSCRIPTION_ACTIVATED', 'SUBSCRIPTION_CANCELLED', 'COMPANY_SUSPENDED']
    }
  }
};

/**
 * Verifica si un dominio puede depender de otro
 * @param {string} sourceDomain - Dominio origen
 * @param {string} targetDomain - Dominio destino
 * @returns {boolean} - True si la dependencia está permitida
 */
function canDependOn(sourceDomain, targetDomain) {
  const domain = DOMAIN_BOUNDARIES[sourceDomain.toUpperCase()];
  if (!domain) {
    throw new Error(`Dominio desconocido: ${sourceDomain}`);
  }
  return domain.allowedDependencies.includes(targetDomain.toUpperCase());
}

/**
 * Obtiene los modelos pertenecientes a un dominio
 * @param {string} domainName - Nombre del dominio
 * @returns {Array<string>} - Lista de nombres de modelos
 */
function getDomainModels(domainName) {
  const domain = DOMAIN_BOUNDARIES[domainName.toUpperCase()];
  if (!domain) {
    throw new Error(`Dominio desconocido: ${domainName}`);
  }
  return domain.models;
}

/**
 * Verifica si un modelo pertenece a un dominio específico
 * @param {string} modelName - Nombre del modelo
 * @param {string} domainName - Nombre del dominio
 * @returns {boolean} - True si el modelo pertenece al dominio
 */
function isModelInDomain(modelName, domainName) {
  const domainModels = getDomainModels(domainName);
  return domainModels.includes(modelName);
}

/**
 * Obtiene el dominio al que pertenece un modelo
 * @param {string} modelName - Nombre del modelo
 * @returns {string|null} - Nombre del dominio o null si no encontrado
 */
function getModelDomain(modelName) {
  for (const [domainName, domain] of Object.entries(DOMAIN_BOUNDARIES)) {
    if (domain.models.includes(modelName)) {
      return domainName;
    }
  }
  return null;
}

module.exports = {
  DOMAIN_BOUNDARIES,
  canDependOn,
  getDomainModels,
  isModelInDomain,
  getModelDomain
};
