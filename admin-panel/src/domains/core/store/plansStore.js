import { create } from 'zustand';

const initialState = {
  // Planes
  planes: [],
  selectedPlan: null,
  loadingPlanes: false,
  
  // Features
  features: [],
  featureCategories: [],
  loadingFeatures: false,
  
  // Rubros
  rubros: [],
  loadingRubros: false,
  
  // Plan-Rubro Assignments
  planRubroAssignments: [],
  loadingAssignments: false,
  
  // Overrides
  overrides: [],
  loadingOverrides: false,
  
  // Company effective plans
  companyEffectivePlans: {},
  
  // UI State
  isModalOpen: false,
  modalType: null, // 'plan', 'feature', 'rubro', 'override'
  editingItem: null,
};

export const usePlansStore = create((set, get) => ({
  ...initialState,

  reset: () => set(initialState),

  // ==================== PLANES ====================
  setPlanes: (planes) => set({ planes }),
  addPlan: (plan) => set((state) => ({ planes: [...state.planes, plan] })),
  updatePlan: (updatedPlan) =>
    set((state) => ({
      planes: state.planes.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)),
    })),
  removePlan: (planId) =>
    set((state) => ({
      planes: state.planes.filter((p) => p.id !== planId),
    })),
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  setLoadingPlanes: (loading) => set({ loadingPlanes: loading }),

  // ==================== FEATURES ====================
  setFeatures: (features) => set({ features }),
  addFeature: (feature) => set((state) => ({ features: [...state.features, feature] })),
  updateFeature: (updatedFeature) =>
    set((state) => ({
      features: state.features.map((f) =>
        f.id === updatedFeature.id ? updatedFeature : f
      ),
    })),
  removeFeature: (featureId) =>
    set((state) => ({
      features: state.features.filter((f) => f.id !== featureId),
    })),
  setFeatureCategories: (categories) => set({ featureCategories: categories }),
  setLoadingFeatures: (loading) => set({ loadingFeatures: loading }),

  // ==================== RUBROS ====================
  setRubros: (rubros) => set({ rubros }),
  addRubro: (rubro) => set((state) => ({ rubros: [...state.rubros, rubro] })),
  updateRubro: (updatedRubro) =>
    set((state) => ({
      rubros: state.rubros.map((r) => (r.id === updatedRubro.id ? updatedRubro : r)),
    })),
  removeRubro: (rubroId) =>
    set((state) => ({
      rubros: state.rubros.filter((r) => r.id !== rubroId),
    })),
  setLoadingRubros: (loading) => set({ loadingRubros: loading }),

  // ==================== PLAN-RUBRO ASSIGNMENTS ====================
  setPlanRubroAssignments: (assignments) => set({ planRubroAssignments: assignments }),
  addAssignment: (assignment) =>
    set((state) => ({
      planRubroAssignments: [...state.planRubroAssignments, assignment],
    })),
  updateAssignment: (updatedAssignment) =>
    set((state) => ({
      planRubroAssignments: state.planRubroAssignments.map((a) =>
        a.id === updatedAssignment.id ? updatedAssignment : a
      ),
    })),
  removeAssignment: (assignmentId) =>
    set((state) => ({
      planRubroAssignments: state.planRubroAssignments.filter(
        (a) => a.id !== assignmentId
      ),
    })),
  setLoadingAssignments: (loading) => set({ loadingAssignments: loading }),

  // ==================== OVERRIDES ====================
  setOverrides: (overrides) => set({ overrides }),
  addOverride: (override) =>
    set((state) => ({ overrides: [...state.overrides, override] })),
  updateOverride: (updatedOverride) =>
    set((state) => ({
      overrides: state.overrides.map((o) =>
        o.id === updatedOverride.id ? updatedOverride : o
      ),
    })),
  removeOverride: (overrideId) =>
    set((state) => ({
      overrides: state.overrides.filter((o) => o.id !== overrideId),
    })),
  setLoadingOverrides: (loading) => set({ loadingOverrides: loading }),

  // ==================== COMPANY EFFECTIVE PLANS ====================
  setCompanyEffectivePlan: (companyId, effectivePlan) =>
    set((state) => ({
      companyEffectivePlans: {
        ...state.companyEffectivePlans,
        [companyId]: effectivePlan,
      },
    })),

  // ==================== MODAL STATE ====================
  openModal: (type, item = null) => set({ isModalOpen: true, modalType: type, editingItem: item }),
  closeModal: () => set({ isModalOpen: false, modalType: null, editingItem: null }),
}));
