import React, { useState } from 'react';
import { FileText, Search, Filter, Download, Eye, CreditCard } from 'lucide-react';
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

const mockInvoices = [
  { id: 'INV-2024-001', company: 'TechCorp', amount: 599, status: 'paid', date: '2024-01-15', dueDate: '2024-01-30', method: 'Tarjeta' },
  { id: 'INV-2024-002', company: 'Innovate Labs', amount: 999, status: 'paid', date: '2024-01-01', dueDate: '2024-01-15', method: 'Transferencia' },
  { id: 'INV-2024-003', company: 'Startup Hub', amount: 299, status: 'pending', date: '2024-01-10', dueDate: '2024-01-25', method: 'Tarjeta' },
  { id: 'INV-2024-004', company: 'Digital Solutions', amount: 599, status: 'paid', date: '2024-01-20', dueDate: '2024-02-04', method: 'PayPal' },
  { id: 'INV-2024-005', company: 'Enterprise Corp', amount: 2500, status: 'paid', date: '2024-01-05', dueDate: '2024-01-20', method: 'Transferencia' },
  { id: 'INV-2024-006', company: 'Ramírez Consulting', amount: 299, status: 'overdue', date: '2023-12-15', dueDate: '2023-12-30', method: 'Tarjeta' },
  { id: 'INV-2024-007', company: 'Cloud Systems', amount: 999, status: 'cancelled', date: '2024-01-08', dueDate: '2024-01-23', method: 'Tarjeta' }
];

const InvoiceList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusBadge = (status) => {
    const variants = { paid: 'default', pending: 'secondary', overdue: 'destructive', cancelled: 'outline' };
    const labels = { paid: 'Pagada', pending: 'Pendiente', overdue: 'Vencida', cancelled: 'Cancelada' };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const filteredInvoices = mockInvoices.filter(inv => {
    const matchesSearch = inv.company.toLowerCase().includes(searchTerm.toLowerCase()) || inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = mockInvoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
  const totalPending = mockInvoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
          <p className="text-muted-foreground mt-1">Historial de facturas y pagos</p>
        </div>
        <Button><Download className="w-4 h-4 mr-2" />Exportar</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockInvoices.reduce((acc, i) => acc + i.amount, 0)} MXN</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cobrado</CardTitle>
            <CreditCard className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid} MXN</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
            <CreditCard className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending} MXN</div>
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
              <Input placeholder="Buscar por factura o empresa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="paid">Pagadas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="overdue">Vencidas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
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
                <TableHead>Folio</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No se encontraron facturas</TableCell></TableRow>
              ) : (
                filteredInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-sm">{inv.id}</TableCell>
                    <TableCell className="font-medium">{inv.company}</TableCell>
                    <TableCell>${inv.amount} MXN</TableCell>
                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                    <TableCell>{new Date(inv.date).toLocaleDateString('es-MX')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString('es-MX')}</TableCell>
                    <TableCell className="text-sm">{inv.method}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />Ver</DropdownMenuItem>
                          <DropdownMenuItem><Download className="w-4 h-4 mr-2" />Descargar PDF</DropdownMenuItem>
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

export default InvoiceList;
