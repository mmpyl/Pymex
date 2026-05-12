import React, { useState } from 'react';
import { 
  Users, Search, Filter, Plus, MoreVertical, Eye, Edit, Trash2, 
  Mail, Phone, Building2, CheckCircle2, XCircle, Clock 
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const mockUsers = [
  { id: 1, name: 'Ana García', email: 'ana.garcia@techcorp.com', role: 'Admin', company: 'TechCorp', status: 'active', phone: '+52 55 1234 5678', avatar: 'AG', lastActive: '2024-01-15T10:30:00Z' },
  { id: 2, name: 'Carlos Mendoza', email: 'carlos.m@innovate.mx', role: 'User', company: 'Innovate Labs', status: 'active', phone: '+52 81 9876 5432', avatar: 'CM', lastActive: '2024-01-15T09:15:00Z' },
  { id: 3, name: 'María López', email: 'maria.lopez@startup.com', role: 'Manager', company: 'Startup Hub', status: 'inactive', phone: '+52 33 5555 1234', avatar: 'ML', lastActive: '2024-01-10T14:20:00Z' },
  { id: 4, name: 'Roberto Díaz', email: 'roberto.d@enterprise.com', role: 'User', company: 'Enterprise Corp', status: 'suspended', phone: '+52 55 8765 4321', avatar: 'RD', lastActive: '2024-01-08T16:45:00Z' },
  { id: 5, name: 'Laura Fernández', email: 'laura.f@digital.mx', role: 'Admin', company: 'Digital Solutions', status: 'active', phone: '+52 55 2468 1357', avatar: 'LF', lastActive: '2024-01-15T11:00:00Z' },
  { id: 6, name: 'Jorge Ramírez', email: 'jorge.r@consulting.com', role: 'User', company: 'Ramírez Consulting', status: 'pending', phone: '+52 55 1357 2468', avatar: 'JR', lastActive: null }
];

const UserList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getStatusBadge = (status) => {
    const variants = { active: 'default', inactive: 'secondary', suspended: 'destructive', pending: 'outline' };
    const icons = {
      active: <CheckCircle2 className="w-3 h-3 mr-1" />,
      inactive: <XCircle className="w-3 h-3 mr-1" />,
      suspended: <XCircle className="w-3 h-3 mr-1" />,
      pending: <Clock className="w-3 h-3 mr-1" />
    };
    const labels = { active: 'Activo', inactive: 'Inactivo', suspended: 'Suspendido', pending: 'Pendiente' };
    return <Badge variant={variants[status]} className="gap-1">{icons[status]}{labels[status]}</Badge>;
  };

  const getRoleBadge = (role) => {
    const variants = { Admin: 'default', Manager: 'secondary', User: 'outline' };
    return <Badge variant={variants[role]}>{role}</Badge>;
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground mt-1">Gestiona los usuarios del sistema</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nuevo Usuario</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsers.length}</div>
            <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsers.filter(u => u.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Usuarios activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsers.filter(u => u.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">Esperando activación</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspendidos</CardTitle>
            <XCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsers.filter(u => u.status === 'suspended').length}</div>
            <p className="text-xs text-muted-foreground">Cuentas suspendidas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="w-4 h-4" />Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre, email o empresa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Rol" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="User">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Actividad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No se encontraron usuarios</TableCell></TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">{user.avatar}</div>
                        <div className="font-medium">{user.name}</div>
                      </div>
                    </TableCell>
                    <TableCell><div className="flex items-center gap-2"><Mail className="w-3 h-3 text-muted-foreground" />{user.email}</div></TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell><div className="flex items-center gap-2"><Building2 className="w-3 h-3 text-muted-foreground" />{user.company}</div></TableCell>
                    <TableCell><div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-3 h-3" />{user.phone}</div></TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastActive ? new Date(user.lastActive).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Nunca'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />Ver detalle</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} resultados
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Anterior</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Siguiente</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
