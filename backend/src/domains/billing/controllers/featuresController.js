/**
 * Controlador de Features - Dominio BILLING
 * 
 * Maneja las operaciones relacionadas con features, planes y rubros.
 * Incluye gestión de overrides por empresa y resolución de acceso efectivo.
 */

const { Rubro, Empresa } = require('../../core/models');
const { Feature, Plan, PlanFeature, RubroFeature, FeatureOverride } = require('../models');
const { resolveFeatureAccess } = require('../../../middleware/checkFeature');

class FeaturesController {
  /**
   * GET /api/features/catalogo
   * Obtiene catálogo de features, planes y rubros
   */
  async obtenerCatalogo(req, res, next) {
    try {
      const [features, planes, rubros] = await Promise.all([
        Feature.findAll({ where: { estado: 'activo' }, order: [['codigo', 'ASC']] }),
        Plan.findAll({ where: { estado: 'activo' }, order: [['precio_mensual', 'ASC']] }),
        Rubro.findAll({ order: [['nombre', 'ASC']] })
      ]);
      return res.json({ features, planes, rubros });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/features
   * Crea un nuevo feature
   */
  async crearFeature(req, res, next) {
    try {
      const { nombre, codigo, descripcion = '', estado = 'activo' } = req.body;
      
      if (!nombre || !codigo) {
        return res.status(400).json({ error: 'nombre y codigo son obligatorios' });
      }
      
      const feature = await Feature.create({ nombre, codigo, descripcion, estado });
      return res.status(201).json(feature);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /api/features/planes/:planId/features/:featureId
   * Actualiza la relación feature-plan
   */
  async actualizarFeaturePlan(req, res, next) {
    try {
      const activo = Boolean(req.body.activo);
      
      await PlanFeature.upsert({
        plan_id: Number(req.params.planId),
        feature_id: Number(req.params.featureId),
        activo
      });
      
      // Publicar evento para invalidar caché de features para empresas con este plan
      const eventBus = require('../../domains/eventBus');
      eventBus.publish('FEATURE_CHANGED', { 
        feature_id: Number(req.params.featureId),
        plan_id: Number(req.params.planId),
        tipo: 'plan_feature'
      }, 'features');
      
      return res.json({ mensaje: 'Feature de plan actualizada', activo });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /api/features/rubros/:rubroId/features/:featureId
   * Actualiza la relación feature-rubro
   */
  async actualizarFeatureRubro(req, res, next) {
    try {
      const activo = Boolean(req.body.activo);
      
      await RubroFeature.upsert({
        rubro_id: Number(req.params.rubroId),
        feature_id: Number(req.params.featureId),
        activo
      });
      
      return res.json({ mensaje: 'Feature de rubro actualizada', activo });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /api/features/empresas/:empresaId/features/:featureId
   * Actualiza override de feature por empresa
   */
  async actualizarFeatureEmpresa(req, res, next) {
    try {
      const activo = Boolean(req.body.activo);
      
      await FeatureOverride.upsert({
        empresa_id: Number(req.params.empresaId),
        feature_id: Number(req.params.featureId),
        activo,
        motivo: req.body.motivo || null
      });
      
      // Publicar evento para invalidar caché de features para esta empresa específica
      const eventBus = require('../../domains/eventBus');
      eventBus.publish('FEATURE_CHANGED', { 
        feature_id: Number(req.params.featureId),
        empresa_id: Number(req.params.empresaId),
        tipo: 'empresa_override'
      }, 'features');
      
      return res.json({ mensaje: 'Override por empresa actualizado', activo });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/features/empresas/:empresaId/effective
   * Obtiene features efectivos para una empresa
   */
  async obtenerFeaturesEfectivos(req, res, next) {
    try {
      const empresaId = Number(req.params.empresaId);
      
      const empresa = await Empresa.findByPk(empresaId, {
        attributes: ['id', 'nombre', 'plan', 'plan_id', 'rubro_id']
      });
      
      if (!empresa) {
        return res.status(404).json({ error: 'Empresa no encontrada' });
      }

      const features = await Feature.findAll({
        where: { estado: 'activo' },
        order: [['codigo', 'ASC']]
      });

      const evaluacion = await Promise.all(features.map(async (feature) => {
        const resolution = await resolveFeatureAccess(empresaId, feature.codigo);
        return {
          feature_id: feature.id,
          feature_code: feature.codigo,
          nombre: feature.nombre,
          activo: resolution.active,
          source: resolution.source
        };
      }));

      return res.json({ empresa, features: evaluacion });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new FeaturesController();
