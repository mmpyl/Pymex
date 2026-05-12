import React, { useState } from 'react';
import { Flag, ToggleLeft, ToggleRight, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';

const mockFlags = [
  { id: 1, name: 'new_dashboard', description: 'Habilita el nuevo diseño del dashboard', enabled: true, environment: 'all' },
  { id: 2, name: 'ml_predictions', description: 'Activa predicciones con ML', enabled: false, environment: 'production' },
  { id: 3, name: 'dark_mode', description: 'Modo oscuro para usuarios', enabled: true, environment: 'all' },
  { id: 4, name: 'beta_features', description: 'Funcionalidades en beta', enabled: false, environment: 'staging' },
  { id: 5, name: 'api_v2', description: 'Nueva versión de API', enabled: true, environment: 'all' },
  { id: 6, name: 'advanced_analytics', description: 'Analíticas avanzadas', enabled: false, environment: 'production' }
];

const FeatureFlags = () => {
  const [flags, setFlags] = useState(mockFlags);

  const toggleFlag = (id) => {
    setFlags(flags.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const getEnvironmentBadge = (env) => {
    const variants = { all: 'default', production: 'destructive', staging: 'secondary', development: 'outline' };
    return <Badge variant={variants[env]}>{env}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-muted-foreground mt-1">Gestiona características activas/inactivas</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nuevo Flag</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
            <Flag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flags.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <ToggleRight className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flags.filter(f => f.enabled).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <ToggleLeft className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flags.filter(f => !f.enabled).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Feature Flags</CardTitle>
          <CardDescription>Activa o desactiva características del sistema</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Entorno</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flags.map((flag) => (
                <TableRow key={flag.id}>
                  <TableCell className="font-mono text-sm font-medium">{flag.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{flag.description}</TableCell>
                  <TableCell>{getEnvironmentBadge(flag.environment)}</TableCell>
                  <TableCell>
                    <Switch checked={flag.enabled} onCheckedChange={() => toggleFlag(flag.id)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureFlags;
