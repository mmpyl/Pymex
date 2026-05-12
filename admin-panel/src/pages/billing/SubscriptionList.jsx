import React, { useState } from 'react';
import { CreditCard, Search, Filter, MoreVertical, Eye, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';

const mockSubscriptions = [
  { id: 1, company: 'TechCorp', plan: 'Profesional', status: 'active', startDate: '2023-06-15', nextBilling: '2024-02-15', amount: 599, users: 18 },
  { id: 2, company: 'Innovate Labs', plan: 'Empresarial', status: 'active', startDate: '2023-08-01', nextBilling: '2024-02-01', amount: 999, users: 45 },
  { id: 3, company: 'Startup Hub', plan: 'Básico', status: 'cancelled', startDate: '2023-03-10', nextBilling: '-', amount: 299, users: 5 },
  { id: 4, company: 'Digital Solutions', plan: 'Profesional', status: 'active', startDate: '2023-09-20', nextBilling: '2024-02-20', amount: 599, users: 12 },
  { id: 5, company: 'Enterprise Corp', plan: 'Enterprise', status: 'active', startDate: '2023-01-05', nextBilling: '2024-02-05', amount: 2500, users: 150 },
  { id: 6, company: 'Ramírez Consulting', plan: 'Básico', status: 'past_due', startDate: '2023-11-15', nextBilling: '2024-01-15', amount: 299, users: 4 }
];

const SubscriptionList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusBadge = (status) => {
    const variants = { active: 'default', cancelled: 'secondary', past_due: 'destructive', trial: 'outline' };
    const labels = { active: 'Activo', cancelled: 'Cancelado', past_due: 'Vencido', trial: 'Prueba' };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const filteredSubs = mockSubscriptions.filter(sub => {
    const matchesSearch = sub.company.toLowerCase().includes(searchTerm.toLowerCase()) || sub.plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suscripciones</h1>
          <p className="text-muted-foreground mt-1">Gestiona las suscripciones activas</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSubscriptions.filter(s => s.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingreso Mensual</CardTitle>
            <CreditCard className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockSubscriptions.filter(s => s.status === 'active').reduce((acc, s) => acc + s.amount, 0)} MXN
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Filter className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSubscriptions.reduce((acc, s) => acc + s.users, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <CreditCard className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSubscriptions.filter(s => s.status === 'past_due').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por empresa o plan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
                <SelectItem value="past_due">Vencidos</SelectItem>
                <SelectItem value="trial">Prueba</SelectItem>
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
                <TableHead>Empresa</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Próximo Cobro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubs.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No se encontraron suscripciones</TableCell></TableRow>
              ) : (
                filteredSubs.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.company}</TableCell>
                    <TableCell><Badge variant="outline">{sub.plan}</Badge></TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>{sub.users}</TableCell>
                    <TableCell>${sub.amount} MXN</TableCell>
                    <TableCell>{new Date(sub.startDate).toLocaleDateString('es-MX')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{sub.nextBilling}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />Ver detalle</DropdownMenuItem>
                          <DropdownMenuItem><Download className="w-4 h-4 mr-2" />Descargar factura</DropdownMenuItem>
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
    </div>
  );
};

export default SubscriptionList;
