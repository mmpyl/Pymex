import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Building2, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  CreditCard,
  CheckCircle,
  XCircle,
  Activity,
  DollarSign,
  TrendingUp,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Datos mock para demostración
const mockCompany = {
  id: 1,
  name: 'TechCorp S.A.',
  legalName: 'TechCorp Sociedad Anónima',
  taxId: '30-12345678-9',
  email: 'contacto@techcorp.com',
  phone: '+54 11 1234-5678',
  address: 'Av. Corrientes 1234, Piso 5',
  city: 'Buenos Aires',
  state: 'Buenos Aires',
  country: 'Argentina',
  postalCode: 'C1043',
  website: 'https://www.techcorp.com',
  status: 'active',
  plan: 'Enterprise',
  employees: 150,
  registeredAt: '2024-01-15',
  lastActivity: '2024-03-20',
  description: 'Empresa líder en soluciones tecnológicas para el sector financiero.',
  industry: 'Tecnología',
  monthlyRevenue: 125000,
  totalInvoices: 48,
  activeUsers: 85,
};

const mockContacts = [
  { id: 1, name: 'Juan Pérez', role: 'CEO', email: 'juan.perez@techcorp.com', phone: '+54 11 1234-5678' },
  { id: 2, name: 'María González', role: 'CTO', email: 'maria.gonzalez@techcorp.com', phone: '+54 11 1234-5679' },
  { id: 3, name: 'Carlos Rodríguez', role: 'CFO', email: 'carlos.rodriguez@techcorp.com', phone: '+54 11 1234-5680' },
];

const mockRecentInvoices = [
  { id: 'INV-2024-001', date: '2024-03-01', amount: 5000, status: 'paid' },
  { id: 'INV-2024-002', date: '2024-03-15', amount: 5000, status: 'pending' },
  { id: 'INV-2024-003', date: '2024-04-01', amount: 5000, status: 'pending' },
];

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(mockCompany);
  const [contacts, setContacts] = useState(mockContacts);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: company,
  });

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [id]);

  useEffect(() => {
    if (company) {
      Object.keys(company).forEach((key) => {
        setValue(key, company[key]);
      });
    }
  }, [company, setValue]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Activo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pendiente</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Inactivo</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getPlanBadge = (plan) => {
    const colors = {
      Starter: 'bg-gray-100 text-gray-700',
      Professional: 'bg-blue-100 text-blue-700',
      Enterprise: 'bg-purple-100 text-purple-700',
    };
    return <Badge className={`${colors[plan] || colors.Starter} hover:${colors[plan] || colors.Starter}`}>{plan}</Badge>;
  };

  const getInvoiceStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Pagada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pendiente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Vencida</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const handleSave = (data) => {
    setCompany({ ...company, ...data });
    setIsEditing(false);
    // TODO: Implementar llamada real al API para actualizar
    console.log('Updating company:', data);
  };

  const handleDelete = () => {
    // TODO: Implementar llamada real al API para eliminar
    console.log('Deleting company:', id);
    setIsDeleteDialogOpen(false);
    navigate('/admin/companies');
  };

  const handleToggleStatus = () => {
    setCompany({
      ...company,
      status: company.status === 'active' ? 'inactive' : 'active',
    });
    // TODO: Implementar llamada real al API
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/companies')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {company.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{company.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(company.status)}
                  {getPlanBadge(company.plan)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleToggleStatus}>
            {company.status === 'active' ? (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Desactivar
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Activar
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/admin/companies/${id}/invoices`)}>
                <CreditCard className="w-4 h-4 mr-2" />
                Ver facturas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/admin/companies/${id}/users`)}>
                <Users className="w-4 h-4 mr-2" />
                Ver usuarios
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar empresa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.activeUsers}</div>
            <p className="text-xs text-gray-500">De {company.employees} empleados totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingreso Mensual</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${company.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Promedio últimos 3 meses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Totales</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.totalInvoices}</div>
            <p className="text-xs text-gray-500">Desde el registro</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividad</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(company.lastActivity).toLocaleDateString('es-AR')}</div>
            <p className="text-xs text-gray-500">Última actividad</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Company Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información de la Empresa</CardTitle>
            <CardDescription>Detalles y datos de contacto</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre comercial</Label>
                    <Input id="name" {...register('name', { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legalName">Razón social</Label>
                    <Input id="legalName" {...register('legalName')} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email', { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" {...register('phone')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" {...register('address')} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input id="city" {...register('city')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Provincia</Label>
                    <Input id="state" {...register('state')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Código Postal</Label>
                    <Input id="postalCode" {...register('postalCode')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" {...register('description')} rows={3} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Guardar cambios
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nombre comercial</p>
                    <p className="font-medium">{company.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Razón social</p>
                    <p className="font-medium">{company.legalName || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{company.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="font-medium">{company.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-medium">{company.address}</p>
                    <p className="text-sm text-gray-600">{company.city}, {company.state} {company.postalCode}</p>
                    <p className="text-sm text-gray-600">{company.country}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Descripción</p>
                  <p className="text-gray-700">{company.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Fecha de registro</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{new Date(company.registeredAt).toLocaleDateString('es-AR')}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sitio web</p>
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                      {company.website}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contacts & Recent Invoices */}
        <div className="space-y-6">
          {/* Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contactos</CardTitle>
              <CardDescription>Personas clave de la empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="p-3 rounded-lg border bg-gray-50">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.role}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {contact.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {contact.phone}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                Añadir contacto
              </Button>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Facturas Recientes</CardTitle>
              <CardDescription>Últimas facturas emitidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRecentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{invoice.id}</p>
                      <p className="text-xs text-gray-500">{new Date(invoice.date).toLocaleDateString('es-AR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${invoice.amount.toLocaleString()}</p>
                      {getInvoiceStatusBadge(invoice.status)}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-sm" asChild>
                <Link to={`/admin/companies/${id}/invoices`}>Ver todas las facturas</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar empresa</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar "{company.name}"? Esta acción no se puede deshacer y se eliminarán todos los datos asociados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
