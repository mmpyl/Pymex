import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, Users, Zap, Check, Edit, Trash2, Plus, 
  Search, Filter, MoreHorizontal, Eye, ToggleLeft, ToggleRight,
  Building2, Briefcase, Layers
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from '../../../components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '../../../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Textarea } from '../../../components/ui/textarea';
import { usePlanes, useFeatures, useRubros, useOverrides, usePlanRubro, useCompanyPlan } from '../../core/hooks/usePlans';
import toast from 'react-hot-toast';

// Datos mock para demostración (en producción vendrían de la API)
const mockPlanes = [
  { id: 1, name: 'Básico', price: 299, currency: 'MXN', period: 'month', active: true, features: ['Hasta 5 usuarios', '10 GB almacenamiento', 'Soporte por email', 'API básica'], popular: false },
  { id: 2, name: 'Profesional', price: 599, currency: 'MXN', period: 'month', active: true, features: ['Hasta 20 usuarios', '100 GB almacenamiento', 'Soporte prioritario', 'API completa', 'Integraciones'], popular: true },
  { id: 3, name: 'Empresarial', price: 999, currency: 'MXN', period: 'month', active: true, features: ['Usuarios ilimitados', '1 TB almacenamiento', 'Soporte 24/7', 'API + Webhooks', 'Integraciones avanzadas', 'SLA garantizado'], popular: false },
  { id: 4, name: 'Enterprise', price: 0, currency: 'MXN', period: 'custom', active: true, features: ['Personalizado', 'Infraestructura dedicada', 'Manager dedicado', 'Custom integrations', 'On-premise option'], popular: false }
];

const mockRubros = [
  { id: 1, name: 'Tecnología', code: 'TECH', active: true, description: 'Empresas de tecnología y software' },
  { id: 2, name: 'Retail', code: 'RETAIL', active: true, description: 'Comercio minorista y mayorista' },
  { id: 3, name: 'Servicios', code: 'SERV', active: true, description: 'Prestadores de servicios profesionales' },
  { id: 4, name: 'Manufactura', code: 'MANUF', active: true, description: 'Industria manufacturera' },
  { id: 5, name: 'Salud', code: 'HEALTH', active: false, description: 'Instituciones de salud' }
];

const mockFeatures = [
  { id: 1, name: 'Usuarios', key: 'users', category: 'limits', value: '100', unit: 'usuarios', active: true, description: 'Número máximo de usuarios' },
  { id: 2, name: 'Almacenamiento', key: 'storage', category: 'limits', value: '50', unit: 'GB', active: true, description: 'Espacio de almacenamiento en la nube' },
  { id: 3, name: 'API Calls', key: 'api_calls', category: 'limits', value: '10000', unit: 'calls/mes', active: true, description: 'Llamadas a la API por mes' },
  { id: 4, name: 'Soporte Premium', key: 'premium_support', category: 'features', value: 'true', unit: 'boolean', active: true, description: 'Acceso a soporte prioritario 24/7' },
  { id: 5, name: 'White Label', key: 'white_label', category: 'features', value: 'true', unit: 'boolean', active: false, description: 'Personalización de marca' },
  { id: 6, name: 'Export Reports', key: 'export_reports', category: 'features', value: 'true', unit: 'boolean', active: true, description: 'Exportación de reportes en múltiples formatos' }
];

const mockOverrides = [
  { id: 1, companyId: 1, companyName: 'TechCorp S.A.', planId: 2, planName: 'Profesional', overrides: { users: 50, storage: 200 }, active: true, reason: 'Cliente VIP - Acuerdo especial', createdAt: '2024-01-15' },
  { id: 2, companyId: 3, companyName: 'Innovatech Solutions', planId: 1, planName: 'Básico', overrides: { api_calls: 50000 }, active: true, reason: 'Necesidad temporal por migración', createdAt: '2024-02-20' }
];

const PlanForm = ({ plan, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    currency: 'MXN',
    period: 'month',
    active: true,
    popular: false,
    features: [],
    description: ''
  });

  useEffect(() => {
    if (plan) {
      setFormData(plan);
    }
  }, [plan]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{plan ? 'Editar Plan' : 'Nuevo Plan'}</DialogTitle>
        <DialogDescription>
          {plan ? 'Modifica la información del plan existente' : 'Crea un nuevo plan de precios'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nombre del Plan</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Profesional"
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              placeholder="0"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency">Moneda</Label>
            <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="period">Periodo de Facturación</Label>
            <Select value={formData.period} onValueChange={(v) => setFormData({ ...formData, period: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mensual</SelectItem>
                <SelectItem value="quarter">Trimestral</SelectItem>
                <SelectItem value="year">Anual</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción del plan..."
            rows={3}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label>Activo</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.popular}
              onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
            />
            <Label>Más Popular</Label>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{plan ? 'Actualizar' : 'Crear'} Plan</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

const RubroForm = ({ rubro, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    active: true
  });

  useEffect(() => {
    if (rubro) {
      setFormData(rubro);
    }
  }, [rubro]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{rubro ? 'Editar Rubro' : 'Nuevo Rubro'}</DialogTitle>
        <DialogDescription>
          {rubro ? 'Modifica la información del rubro' : 'Crea un nuevo rubro de empresa'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nombre del Rubro</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Tecnología"
              required
            />
          </div>
          <div>
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="Ej: TECH"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción del rubro..."
            rows={3}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.active}
            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
          />
          <Label>Activo</Label>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{rubro ? 'Actualizar' : 'Crear'} Rubro</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

const OverrideForm = ({ override, companies, plans, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    companyId: '',
    planId: '',
    overrides: {},
    reason: '',
    active: true
  });

  useEffect(() => {
    if (override) {
      setFormData(override);
    }
  }, [override]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{override ? 'Editar Override' : 'Nuevo Override'}</DialogTitle>
        <DialogDescription>
          {override ? 'Modifica el override existente' : 'Crea un override personalizado para una empresa'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company">Empresa</Label>
            <Select 
              value={String(formData.companyId)} 
              onValueChange={(v) => setFormData({ ...formData, companyId: Number(v) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="plan">Plan Base</Label>
            <Select 
              value={String(formData.planId)} 
              onValueChange={(v) => setFormData({ ...formData, planId: Number(v) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="overrides">Overrides (JSON)</Label>
          <Textarea
            id="overrides"
            value={JSON.stringify(formData.overrides, null, 2)}
            onChange={(e) => {
              try {
                setFormData({ ...formData, overrides: JSON.parse(e.target.value) });
              } catch {
                // Ignore invalid JSON while typing
              }
            }}
            placeholder='{"users": 100, "storage": 500}'
            rows={5}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Formato JSON con los límites personalizados
          </p>
        </div>
        <div>
          <Label htmlFor="reason">Motivo</Label>
          <Textarea
            id="reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Explica el motivo del override..."
            rows={2}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.active}
            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
          />
          <Label>Activo</Label>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{override ? 'Actualizar' : 'Crear'} Override</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

const PlanesPage = () => {
  const { planes, loading, fetchPlanes, createPlan, updatePlan, deletePlan, togglePlanActive } = usePlanes();
  const { rubros, fetchRubros } = useRubros();
  const { features, fetchFeatures } = useFeatures();
  const { overrides, fetchOverrides } = useOverrides();
  const { assignPlanToRubro, removePlanFromRubro } = usePlanRubro();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('planes');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'plan', 'rubro', 'override'
  const [editingItem, setEditingItem] = useState(null);
  const [localPlanes, setLocalPlanes] = useState(mockPlanes);
  const [localRubros, setLocalRubros] = useState(mockRubros);
  const [localFeatures, setLocalFeatures] = useState(mockFeatures);
  const [localOverrides, setLocalOverrides] = useState(mockOverrides);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      await Promise.all([
        fetchPlanes().catch(() => setLocalPlanes(mockPlanes)),
        fetchRubros().catch(() => setLocalRubros(mockRubros)),
        fetchFeatures().catch(() => setLocalFeatures(mockFeatures)),
        fetchOverrides().catch(() => setLocalOverrides(mockOverrides))
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSavePlan = async (planData) => {
    try {
      if (editingItem) {
        await updatePlan(editingItem.id, planData);
        toast.success('Plan actualizado correctamente');
      } else {
        await createPlan(planData);
        toast.success('Plan creado correctamente');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      loadAllData();
    } catch (error) {
      toast.error('Error al guardar el plan');
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este plan?')) {
      try {
        await deletePlan(id);
        toast.success('Plan eliminado correctamente');
        loadAllData();
      } catch (error) {
        toast.error('Error al eliminar el plan');
      }
    }
  };

  const handleTogglePlan = async (id) => {
    try {
      await togglePlanActive(id);
      toast.success('Estado del plan actualizado');
      loadAllData();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const filteredPlanes = (planes.length > 0 ? planes : localPlanes).filter((plan) =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const renderPlanesView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planes y Precios</h1>
          <p className="text-muted-foreground mt-1">Gestiona los planes disponibles y sus características</p>
        </div>
        <Button onClick={() => openModal('plan')}>
          <Plus className="w-4 h-4 mr-2" />Nuevo Plan
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar planes..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlanes.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''} ${!plan.active ? 'opacity-60' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge>Más Popular</Badge>
              </div>
            )}
            {!plan.active && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary">Inactivo</Badge>
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-4">
                {plan.price === 0 ? (
                  <span className="text-3xl font-bold">Custom</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period === 'month' ? 'mes' : plan.period}</span>
                  </>
                )}
              </div>
              <CardDescription className="pt-2">{plan.currency}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {(plan.features || []).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600" />{feature}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openModal('plan', plan)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleTogglePlan(plan.id)}
                >
                  {plan.active ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openModal('plan', plan)}>
                      <Edit className="w-4 h-4 mr-2" />Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTogglePlan(plan.id)}>
                      {plan.active ? 'Desactivar' : 'Activar'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderRubrosView = () => {
    const displayedRubros = rubros.length > 0 ? rubros : localRubros;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rubros de Empresas</h1>
            <p className="text-muted-foreground mt-1">Clasifica las empresas por sector industrial</p>
          </div>
          <Button onClick={() => openModal('rubro')}>
            <Plus className="w-4 h-4 mr-2" />Nuevo Rubro
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRubros.map((rubro) => (
                <TableRow key={rubro.id}>
                  <TableCell className="font-mono text-sm">{rubro.code}</TableCell>
                  <TableCell className="font-medium">{rubro.name}</TableCell>
                  <TableCell className="text-muted-foreground">{rubro.description}</TableCell>
                  <TableCell>
                    <Badge variant={rubro.active ? 'default' : 'secondary'}>
                      {rubro.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openModal('rubro', rubro)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Layers className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  };

  const renderFeaturesView = () => {
    const displayedFeatures = features.length > 0 ? features : localFeatures;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Features del Sistema</h1>
            <p className="text-muted-foreground mt-1">Configura las características disponibles en los planes</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />Nuevo Feature
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedFeatures.map((feature) => (
                <TableRow key={feature.id}>
                  <TableCell className="font-medium">{feature.name}</TableCell>
                  <TableCell className="font-mono text-sm">{feature.key}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{feature.category}</Badge>
                  </TableCell>
                  <TableCell>{feature.value}</TableCell>
                  <TableCell className="text-muted-foreground">{feature.unit}</TableCell>
                  <TableCell>
                    <Badge variant={feature.active ? 'default' : 'secondary'}>
                      {feature.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  };

  const renderOverridesView = () => {
    const displayedOverrides = overrides.length > 0 ? overrides : localOverrides;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overrides por Empresa</h1>
            <p className="text-muted-foreground mt-1">Configuraciones personalizadas que sobrescriben los planes base</p>
          </div>
          <Button onClick={() => openModal('override')}>
            <Plus className="w-4 h-4 mr-2" />Nuevo Override
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Plan Base</TableHead>
                <TableHead>Overrides</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedOverrides.map((override) => (
                <TableRow key={override.id}>
                  <TableCell className="font-medium">{override.companyName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{override.planName}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(override.overrides).map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key}: {value}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{override.reason}</TableCell>
                  <TableCell className="text-muted-foreground">{override.createdAt}</TableCell>
                  <TableCell>
                    <Badge variant={override.active ? 'default' : 'secondary'}>
                      {override.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openModal('override', override)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="planes" className="gap-2">
            <CreditCard className="w-4 h-4" />Planes
          </TabsTrigger>
          <TabsTrigger value="rubros" className="gap-2">
            <Briefcase className="w-4 h-4" />Rubros
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Zap className="w-4 h-4" />Features
          </TabsTrigger>
          <TabsTrigger value="overrides" className="gap-2">
            <Building2 className="w-4 h-4" />Overrides
          </TabsTrigger>
        </TabsList>
        <TabsContent value="planes">{renderPlanesView()}</TabsContent>
        <TabsContent value="rubros">{renderRubrosView()}</TabsContent>
        <TabsContent value="features">{renderFeaturesView()}</TabsContent>
        <TabsContent value="overrides">{renderOverridesView()}</TabsContent>
      </Tabs>

      {/* Modals */}
      {isModalOpen && modalType === 'plan' && (
        <PlanForm
          plan={editingItem}
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
          onSave={handleSavePlan}
        />
      )}
      {isModalOpen && modalType === 'rubro' && (
        <RubroForm
          rubro={editingItem}
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
          onSave={(data) => {
            toast.success('Rubro guardado correctamente');
            setIsModalOpen(false);
            setEditingItem(null);
            loadAllData();
          }}
        />
      )}
      {isModalOpen && modalType === 'override' && (
        <OverrideForm
          override={editingItem}
          companies={[]}
          plans={planes.length > 0 ? planes : localPlanes}
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
          onSave={(data) => {
            toast.success('Override guardado correctamente');
            setIsModalOpen(false);
            setEditingItem(null);
            loadAllData();
          }}
        />
      )}
    </div>
  );
};

export default PlanesPage;
