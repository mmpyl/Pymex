const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

/**
 * Modelo DomainEvent - Outbox Pattern
 * 
 * Este modelo implementa el patrón Outbox para garantizar que los eventos
 * del dominio no se pierdan si el proceso muere. Los eventos se persisten
 * en la base de datos antes de ser publicados, y un proceso separado se
 * encarga de despacharlos a los suscriptores.
 * 
 * ESTADOS DEL EVENTO:
 * - 'pending': Evento creado, pendiente de despacho
 * - 'processing': Evento siendo procesado (locked por worker)
 * - 'delivered': Evento entregado exitosamente a todos los suscriptores
 * - 'failed': Evento falló después de múltiples reintentos
 */
const DomainEvent = sequelize.define('DomainEvent', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  
  // Identificador único del evento (para idempotencia)
  event_id: { 
    type: DataTypes.STRING(120), 
    allowNull: false, 
    unique: true 
  },
  
  // Nombre del evento (ej: COMPANY_SUSPENDED, PAYMENT_COMPLETED)
  event_type: { 
    type: DataTypes.STRING(100), 
    allowNull: false,
    index: true 
  },
  
  // Dominio que publica el evento
  source_domain: { 
    type: DataTypes.STRING(50), 
    allowNull: false,
    index: true 
  },
  
  // Payload del evento en formato JSON
  payload: { 
    type: DataTypes.JSONB, 
    allowNull: false 
  },
  
  // Estado del evento (pending, processing, delivered, failed)
  status: { 
    type: DataTypes.ENUM('pending', 'processing', 'delivered', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
    index: true 
  },
  
  // Número de reintentos para eventos fallidos
  retry_count: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 0 
  },
  
  // Máximo de reintentos permitidos
  max_retries: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 3 
  },
  
  // Timestamp de creación
  created_at: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW,
    index: true 
  },
  
  // Timestamp de cuando fue procesado por última vez
  processed_at: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  
  // Timestamp de cuando fue entregado exitosamente
  delivered_at: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  
  // Error message si falló
  error_message: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  
  // Worker ID que está procesando este evento (para locking)
  worker_id: { 
    type: DataTypes.STRING(100), 
    allowNull: true 
  },
  
  // Metadata adicional (versión del schema, correlation_id, etc.)
  metadata: { 
    type: DataTypes.JSONB, 
    allowNull: true 
  }
}, {
  tableName: 'domain_events',
  timestamps: false,
  indexes: [
    { fields: ['status', 'created_at'] }, // Para consultas de pending events
    { fields: ['source_domain', 'status'] },
    { fields: ['event_type', 'status'] }
  ]
});

module.exports = DomainEvent;
