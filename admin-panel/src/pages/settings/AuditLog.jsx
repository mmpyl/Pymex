import React, { useState } from 'react';
import { FileText, Search, Filter, User, Activity, Shield, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';

const mockLogs = [
  { id: 1, action: 'USER_CREATED', user: 'admin@system.com', entity: 'User', entityId: '#1234', timestamp: '2024-01-15T10:30:00Z', ip: '192.168.1.100' },
  { id: 2, action: 'COMPANY_UPDATED', user: 'manager@techcorp.com', entity: 'Company', entityId: '#5678', timestamp: '2024-01-15T09:45:00Z', ip: '192.168.1.101' },
  { id: 3, action: 'SUBSCRIPTION_CANCELLED', user: 'user@startup.com', entity: 'Subscription', entityId: '#9012', timestamp: '2024-01-15T08:20:00Z', ip: '192.168.1.102' },
  { id: 4, action: 'LOGIN_SUCCESS', user: 'ana@digital.mx', entity: 'Auth', entityId: '-', timestamp: '2024-01-15T07:15:00Z', ip: '192.168.1.103' },
  { id: 5, action: 'PLAN_CHANGED', user: 'carlos@innovate.mx', entity: 'Plan', entityId: '#3456', timestamp: '2024-01-14T16:30:00Z', ip: '192.168.1.104' },
  { id: 6, action: 'USER_DELETED', user: 'admin@system.com', entity: 'User', entityId: '#7890', timestamp: '2024-01-14T14:00:00Z', ip: '192.168.1.100' },
  { id: 7, action: 'SETTINGS_UPDATED', user: 'admin@system.com', entity: 'Settings', entityId: '-', timestamp: '2024-01-14T11:30:00Z', ip: '192.168.1.100' },
  { id: 8, action: 'INVOICE_GENERATED', user: 'system@automated.com', entity: 'Invoice', entityId: '#INV-001', timestamp: '2024-01-14T09:00:00Z', ip: '10.0.0.1' }
];

const AuditLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const getActionBadge = (action) => {
    const colors = {
      USER_CREATED: 'default', USER_DELETED: 'destructive', LOGIN_SUCCESS: 'default',
      COMPANY_UPDATED: 'secondary', SUBSCRIPTION_CANCELLED: 'destructive',
      PLAN_CHANGED: 'secondary', SETTINGS_UPDATED: 'outline', INVOICE_GENERATED: 'default'
    };
    return <Badge variant={colors[action] || 'outline'}>{action}</Badge>;
  };

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const actions = [...new Set(mockLogs.map(l => l.action))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground mt-1">Registro de actividades del sistema</p>
        </div>
        <Button variant="outline"><FileText className="w-4 h-4 mr-2" />Exportar</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Únicos</CardTitle>
            <User className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(mockLogs.map(l => l.user)).size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acciones Distintas</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoy</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLogs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length}</div>
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
              <Input placeholder="Buscar por usuario, acción o entidad..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Acción" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                {actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
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
                <TableHead>Acción</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>ID Entidad</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Fecha/Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No se encontraron registros</TableCell></TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="font-medium">{log.user}</TableCell>
                    <TableCell>{log.entity}</TableCell>
                    <TableCell className="font-mono text-sm">{log.entityId}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{log.ip}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

export default AuditLog;
