/**
 * Guía de Migración - Fase 1 DDD
 * 
 * Este documento proporciona instrucciones paso a paso para migrar
 * el código legacy a la nueva arquitectura basada en dominios.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CÓMO IMPORTAR MODELOS DESDE LOS NUEVOS DOMINIOS
// ═══════════════════════════════════════════════════════════════════════════════

// ❌ ANTES (código legacy - YA NO FUNCIONA):
// const { Usuario, Empresa, Venta } = require('../models');  // ELIMINADO

// ✅ AHORA (usando dominios):
const authModels = require('../domains/auth/models');
const coreModels = require('../domains/core/models');
const billingModels = require('../domains/billing/models');

const { Usuario } = authModels;
const { Empresa, Venta } = coreModels;

// O también:
const { Usuario } = require('../domains/auth/models/Usuario');
const { Empresa } = require('../domains/core/models/Empresa');


// ═══════════════════════════════════════════════════════════════════════════════
// 2. CÓMO PUBLICAR EVENTOS DE DOMINIO
// ═══════════════════════════════════════════════════════════════════════════════

const { eventBus } = require('../domains/eventBus');

// Ejemplo: Publicar evento cuando se completa una venta
async function completarVenta(ventaData) {
  // ... lógica de negocio ...
  
  // Publicar evento para que otros dominios reaccionen
  eventBus.publish('SALE_COMPLETED', {
    ventaId: venta.id,
    empresaId: venta.empresa_id,
    total: venta.total,
    fecha: new Date().toISOString()
  }, 'CORE');
  
  return venta;
}


// ═══════════════════════════════════════════════════════════════════════════════
// 3. CÓMO SUSCRIBIRSE A EVENTOS DE OTROS DOMINIOS
// ═══════════════════════════════════════════════════════════════════════════════

// Ejemplo: El dominio BILLING escucha ventas para tracking de límites
const { eventBus } = require('../domains/eventBus');

eventBus.subscribe('SALE_COMPLETED', async (eventRecord) => {
  const { ventaId, empresaId, total } = eventRecord.payload;
  
  // Actualizar contadores de uso para verificar límites del plan
  await verificarLimiteVentas(empresaId, total);
}, 'BILLING');


// ═══════════════════════════════════════════════════════════════════════════════
// 4. CÓMO EVITAR JOINs ENTRE DOMINIOS
// ═══════════════════════════════════════════════════════════════════════════════

// ❌ ANTES (JOIN cruzado entre dominios - NO PERMITIDO):
const ventasConUsuario = await Venta.findAll({
  include: [
    { model: Usuario, as: 'usuario' }  // Usuario es del dominio AUTH
  ]
});

// ✅ AHORA (consultar por separado y unir en aplicación):
const ventas = await Venta.findAll({ where: { empresa_id } });
const usuarioIds = [...new Set(ventas.map(v => v.usuario_id))];

const usuarios = await Usuario.findAll({
  where: { id: usuarioIds }
});

// Unir en memoria si es necesario
const ventasConUsuario = ventas.map(venta => ({
  ...venta.toJSON(),
  usuario: usuarios.find(u => u.id === venta.usuario_id)
}));


// ═══════════════════════════════════════════════════════════════════════════════
// 5. VERIFICAR LÍMITES DE DOMINIO
// ═══════════════════════════════════════════════════════════════════════════════

const { canDependOn, getModelDomain } = require('../domains/domainBoundaries');

// Verificar si un dominio puede depender de otro
if (canDependOn('BILLING', 'AUTH')) {
  console.log('BILLING puede consultar AUTH');
}

// Obtener el dominio de un modelo
const domain = getModelDomain('Usuario');  // Returns: 'AUTH'
const domain2 = getModelDomain('Venta');   // Returns: 'CORE'


// ═══════════════════════════════════════════════════════════════════════════════
// 6. MIGRACIÓN DE CONTROLADORES EXISTENTES
// ═══════════════════════════════════════════════════════════════════════════════

// Archivo: controllers/ventaController.js

// ❌ ANTES:
const { Venta, Usuario, Empresa } = require('../models');

exports.getVentas = async (req, res) => {
  const ventas = await Venta.findAll({
    include: [{ model: Usuario }]  // JOIN cruzado
  });
  res.json(ventas);
};

// ✅ AHORA:
const coreModels = require('../domains/core/models');
const authModels = require('../domains/auth/models');
const { eventBus } = require('../domains/eventBus');

exports.getVentas = async (req, res) => {
  const { Venta } = coreModels;
  const { Usuario } = authModels;
  
  // Consultar por separado
  const ventas = await Venta.findAll({ where: { empresa_id: req.empresaId } });
  
  // Si se necesitan usuarios, consultar aparte
  const usuarioIds = [...new Set(ventas.map(v => v.usuario_id))];
  const usuarios = await Usuario.findAll({ where: { id: usuarioIds } });
  
  // Unir en memoria
  const resultado = ventas.map(venta => ({
    ...venta.toJSON(),
    usuario: usuarios.find(u => u.id === venta.usuario_id)
  }));
  
  res.json(resultado);
};


// ═══════════════════════════════════════════════════════════════════════════════
// 7. CHECKLIST DE MIGRACIÓN POR ARCHIVO
// ═══════════════════════════════════════════════════════════════════════════════

/*
Para cada controlador/servicio existente:

[ ] Identificar qué modelos usa
[ ] Determinar a qué dominio pertenece cada modelo
[ ] Reemplazar imports con imports de dominios
[ ] Eliminar includes de Sequelize que crucen dominios
[ ] Implementar consultas separadas si es necesario
[ ] Agregar publicación de eventos para operaciones críticas
[ ] Verificar que no haya dependencias circulares
[ ] Ejecutar tests para validar funcionalidad
*/


// ═══════════════════════════════════════════════════════════════════════════════
// 8. EJEMPLO COMPLETO: SERVICIO DE VENTAS MIGRADO
// ═══════════════════════════════════════════════════════════════════════════════

const coreModels = require('../domains/core/models');
const billingModels = require('../domains/billing/models');
const { eventBus } = require('../domains/eventBus');
const { canDependOn } = require('../domains/domainBoundaries');

class VentaService {
  /**
   * Crea una nueva venta y publica eventos
   */
  async crearVenta(data) {
    const { Venta, DetalleVenta, MovimientoInventario } = coreModels;
    
    // Verificar que CORE puede acceder a features de BILLING
    if (!canDependOn('CORE', 'BILLING')) {
      throw new Error('Violación de límite de dominio');
    }
    
    // Iniciar transacción
    const transaction = await coreModels.sequelize.transaction();
    
    try {
      // Crear venta
      const venta = await Venta.create(data.venta, { transaction });
      
      // Crear detalles
      for (const detalle of data.detalles) {
        await DetalleVenta.create({ ...detalle, venta_id: venta.id }, { transaction });
        
        // Actualizar inventario
        await MovimientoInventario.create({
          empresa_id: venta.empresa_id,
          producto_id: detalle.producto_id,
          tipo: 'salida',
          cantidad: -detalle.cantidad,
          motivo: `Venta #${venta.id}`
        }, { transaction });
      }
      
      await transaction.commit();
      
      // Publicar evento para que otros dominios reaccionen
      eventBus.publish('SALE_COMPLETED', {
        ventaId: venta.id,
        empresaId: venta.empresa_id,
        total: venta.total,
        items: data.detalles.length
      }, 'CORE');
      
      return venta;
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * Obtiene ventas con datos limitados del mismo dominio
   */
  async getVentasPorEmpresa(empresaId, options = {}) {
    const { Venta, Cliente } = coreModels;
    
    // JOIN dentro del mismo dominio está permitido
    const include = [];
    if (options.incluirCliente) {
      include.push({ model: Cliente, as: 'cliente' });
    }
    
    return await Venta.findAll({
      where: { empresa_id: empresaId },
      include,
      order: [['fecha', 'DESC']],
      limit: options.limit || 50
    });
  }
}

module.exports = new VentaService();
