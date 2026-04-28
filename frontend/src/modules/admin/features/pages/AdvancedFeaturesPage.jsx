import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useFeatures } from '../hooks/useFeatures';

/**
 * Página de Gestión Avanzada de Features
 * 
 * Proporciona interfaz completa para:
 * - Ver catálogo de features, planes y rubros
 * - Gestionar features por plan
 * - Gestionar features por rubro (existente)
 * - Gestionar overrides por empresa
 * - Ver features efectivos de una empresa
 */
const AdvancedFeaturesPage = () => {
  const {
    loading,
    error,
    catalogo,
    effectiveFeatures,
    loadCatalogo,
    updatePlanFeature,
    updateRubroFeature,
    updateEmpresaOverride,
    loadEffectiveFeatures,
  } = useFeatures();

  // Estado local
  const [activeTab, setActiveTab] = useState('rubros'); // 'rubros' | 'planes' | 'empresas' | 'efectivos'
  const [empresaIdBusqueda, setEmpresaIdBusqueda] = useState('');
  const [saving, setSaving] = useState(false);

  // Cargar catálogo al montar
  useEffect(() => {
    loadCatalogo().catch((err) => {
      console.error('Error cargando catálogo:', err);
      toast.error('Error al cargar el catálogo de features');
    });
  }, [loadCatalogo]);

  /**
   * Maneja toggle de feature para rubro
   */
  const handleToggleRubroFeature = async (rubroId, featureId, currentStatus) => {
    try {
      setSaving(true);
      await updateRubroFeature(rubroId, featureId, !currentStatus);
      toast.success('Feature de rubro actualizado');
    } catch (err) {
      console.error('Error updating rubro feature:', err);
      toast.error(err.response?.data?.error || 'Error al actualizar feature');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Maneja toggle de feature para plan
   */
  const handleTogglePlanFeature = async (planId, featureId, currentStatus) => {
    try {
      setSaving(true);
      await updatePlanFeature(planId, featureId, !currentStatus);
      toast.success('Feature de plan actualizado');
    } catch (err) {
      console.error('Error updating plan feature:', err);
      toast.error(err.response?.data?.error || 'Error al actualizar feature');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Maneja toggle de override para empresa
   */
  const handleToggleEmpresaOverride = async (empresaId, featureId, currentStatus) => {
    try {
      setSaving(true);
      const motivo = prompt('Ingrese el motivo del override (opcional):');
      await updateEmpresaOverride(empresaId, featureId, !currentStatus, motivo || null);
      toast.success('Override de empresa actualizado');
      
      // Si estamos viendo los features efectivos de esta empresa, recargar
      if (effectiveFeatures?.empresa?.id === Number(empresaId)) {
        await loadEffectiveFeatures(empresaId);
      }
    } catch (err) {
      console.error('Error updating empresa override:', err);
      toast.error(err.response?.data?.error || 'Error al actualizar override');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Busca y carga features efectivos de una empresa
   */
  const handleBuscarEmpresa = async () => {
    if (!empresaIdBusqueda.trim()) {
      toast.error('Ingrese un ID de empresa');
      return;
    }

    try {
      await loadEffectiveFeatures(Number(empresaIdBusqueda));
      setActiveTab('efectivos');
    } catch (err) {
      console.error('Error loading effective features:', err);
      toast.error(err.response?.data?.error || 'Empresa no encontrada');
    }
  };

  if (loading && !catalogo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión Avanzada de Features</h1>
        <p className="text-gray-600 mt-1">
          Administre características por plan, rubro y overrides específicos por empresa
        </p>
      </div>

      {/* Tabs de navegación */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'rubros', label: 'Por Rubro' },
            { id: 'planes', label: 'Por Plan' },
            { id: 'empresas', label: 'Overrides por Empresa' },
            { id: 'efectivos', label: 'Features Efectivos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Búsqueda de empresa para features efectivos */}
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="empresaId" className="block text-sm font-medium text-gray-700 mb-1">
              ID de Empresa
            </label>
            <input
              type="number"
              id="empresaId"
              value={empresaIdBusqueda}
              onChange={(e) => setEmpresaIdBusqueda(e.target.value)}
              placeholder="Ej: 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleBuscarEmpresa()}
            />
          </div>
          <button
            onClick={handleBuscarEmpresa}
            disabled={!empresaIdBusqueda.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Contenido de tabs */}
      {activeTab === 'rubros' && catalogo && (
        <RubrosTab
          rubros={catalogo.rubros}
          features={catalogo.features}
          onToggleFeature={handleToggleRubroFeature}
          saving={saving}
        />
      )}

      {activeTab === 'planes' && catalogo && (
        <PlanesTab
          planes={catalogo.planes}
          features={catalogo.features}
          onToggleFeature={handleTogglePlanFeature}
          saving={saving}
        />
      )}

      {activeTab === 'empresas' && catalogo && (
        <EmpresasTab
          features={catalogo.features}
          onToggleOverride={handleToggleEmpresaOverride}
          saving={saving}
        />
      )}

      {activeTab === 'efectivos' && effectiveFeatures && (
        <EfectivosTab
          empresa={effectiveFeatures.empresa}
          features={effectiveFeatures.features}
        />
      )}

      {activeTab === 'efectivos' && !effectiveFeatures && (
        <div className="text-center py-12 text-gray-500">
          Busque una empresa para ver sus features efectivos
        </div>
      )}
    </div>
  );
};

/**
 * Tab de Features por Rubro
 */
const RubrosTab = ({ rubros, features, onToggleFeature, saving }) => (
  <div className="bg-white shadow rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50">
              Feature
            </th>
            {rubros.map((rubro) => (
              <th key={rubro.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                {rubro.nombre}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {features.map((feature) => (
            <tr key={feature.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white">
                <div className="text-sm font-medium text-gray-900">{feature.nombre}</div>
                <div className="text-xs text-gray-500">{feature.codigo}</div>
              </td>
              {rubros.map((rubro) => {
                const rubroFeature = rubro.features?.find((rf) => rf.id === feature.id);
                const isActive = rubroFeature?.activo ?? false;
                return (
                  <td key={`${rubro.id}-${feature.id}`} className="px-6 py-4 text-center">
                    <ToggleCell
                      isActive={isActive}
                      onClick={() => onToggleFeature(rubro.id, feature.id, isActive)}
                      disabled={saving}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * Tab de Features por Plan
 */
const PlanesTab = ({ planes, features, onToggleFeature, saving }) => (
  <div className="bg-white shadow rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50">
              Feature
            </th>
            {planes.map((plan) => (
              <th key={plan.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                {plan.nombre} (${plan.precio_mensual})
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {features.map((feature) => (
            <tr key={feature.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white">
                <div className="text-sm font-medium text-gray-900">{feature.nombre}</div>
                <div className="text-xs text-gray-500">{feature.codigo}</div>
              </td>
              {planes.map((plan) => {
                const planFeature = plan.features?.find((pf) => pf.id === feature.id);
                const isActive = planFeature?.activo ?? false;
                return (
                  <td key={`${plan.id}-${feature.id}`} className="px-6 py-4 text-center">
                    <ToggleCell
                      isActive={isActive}
                      onClick={() => onToggleFeature(plan.id, feature.id, isActive)}
                      disabled={saving}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * Tab de Overrides por Empresa
 */
const EmpresasTab = ({ features, onToggleOverride, saving }) => {
  const [empresaId, setEmpresaId] = useState('');

  return (
    <div className="space-y-4">
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="empresaIdOverride" className="block text-sm font-medium text-gray-700 mb-1">
              ID de Empresa para Override
            </label>
            <input
              type="number"
              id="empresaIdOverride"
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              placeholder="Ej: 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {empresaId && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Estado Override
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {features.map((feature) => (
                  <tr key={feature.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{feature.nombre}</div>
                      <div className="text-xs text-gray-500">{feature.codigo}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ToggleCell
                        isActive={false}
                        onClick={() => onToggleOverride(Number(empresaId), feature.id, false)}
                        disabled={saving}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Tab de Features Efectivos
 */
const EfectivosTab = ({ empresa, features }) => (
  <div className="space-y-4">
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-blue-900">Empresa: {empresa.nombre}</h3>
      <div className="mt-2 text-sm text-blue-800">
        <span>ID: {empresa.id}</span>
        <span className="mx-4">|</span>
        <span>Plan: {empresa.plan || empresa.plan_id}</span>
        <span className="mx-4">|</span>
        <span>Rubro ID: {empresa.rubro_id}</span>
      </div>
    </div>

    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feature</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origen</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {features.map((f) => (
            <tr key={f.feature_id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{f.nombre}</div>
                <div className="text-xs text-gray-500">{f.feature_code}</div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  f.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {f.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{f.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * Componente Toggle reutilizable
 */
const ToggleCell = ({ isActive, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative inline-flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-colors ${
      isActive ? 'bg-green-100 hover:bg-green-200' : 'bg-gray-100 hover:bg-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <div className={`w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
      <div
        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
          isActive ? 'translate-x-5' : 'translate-x-1'
        }`}
        style={{ marginTop: '4px' }}
      />
    </div>
    <span className={`text-xs mt-1 ${isActive ? 'text-green-700' : 'text-gray-500'}`}>
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  </button>
);

export default AdvancedFeaturesPage;
