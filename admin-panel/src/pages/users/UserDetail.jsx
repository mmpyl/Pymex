import React from 'react';
import { ArrowLeft, User, Mail, Phone, Building2, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const UserDetail = () => {
  const user = {
    id: 1,
    name: 'Ana García',
    email: 'ana.garcia@techcorp.com',
    role: 'Admin',
    company: 'TechCorp',
    status: 'active',
    phone: '+52 55 1234 5678',
    avatar: 'AG',
    createdAt: '2023-06-15',
    lastActive: '2024-01-15T10:30:00Z',
    permissions: ['users.read', 'users.write', 'companies.read', 'companies.write', 'billing.read']
  };

  const getStatusBadge = (status) => {
    const variants = { active: 'default', inactive: 'secondary', suspended: 'destructive', pending: 'outline' };
    const labels = { active: 'Activo', inactive: 'Inactivo', suspended: 'Suspendido', pending: 'Pendiente' };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalle de Usuario</h1>
          <p className="text-muted-foreground mt-1">Información completa del usuario</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center font-bold text-2xl text-primary mx-auto mb-4">
              {user.avatar}
            </div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Estado</span>
              {getStatusBadge(user.status)}
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Empresa</span>
              <span className="text-sm font-medium">{user.company}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Teléfono</span>
              <span className="text-sm font-medium">{user.phone}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />Email
                </div>
                <p className="font-medium">{user.email}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />Teléfono
                </div>
                <p className="font-medium">{user.phone}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4" />Empresa
                </div>
                <p className="font-medium">{user.company}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />Fecha de Registro
                </div>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('es-MX')}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4" />Última Actividad
                </div>
                <p className="font-medium">
                  {new Date(user.lastActive).toLocaleDateString('es-MX', { 
                    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Permisos Asignados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((perm) => (
                <Badge key={perm} variant="outline" className="font-mono text-xs">
                  {perm}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDetail;
