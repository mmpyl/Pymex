import React, { useState } from 'react';
import { CreditCard, DollarSign, Users, Zap, Check, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

const mockPlans = [
  { id: 1, name: 'Básico', price: 299, currency: 'MXN', period: 'month', features: ['Hasta 5 usuarios', '10 GB almacenamiento', 'Soporte por email', 'API básica'], popular: false },
  { id: 2, name: 'Profesional', price: 599, currency: 'MXN', period: 'month', features: ['Hasta 20 usuarios', '100 GB almacenamiento', 'Soporte prioritario', 'API completa', 'Integraciones'], popular: true },
  { id: 3, name: 'Empresarial', price: 999, currency: 'MXN', period: 'month', features: ['Usuarios ilimitados', '1 TB almacenamiento', 'Soporte 24/7', 'API + Webhooks', 'Integraciones avanzadas', 'SLA garantizado'], popular: false },
  { id: 4, name: 'Enterprise', price: 0, currency: 'MXN', period: 'custom', features: ['Personalizado', 'Infraestructura dedicada', 'Manager dedicado', 'Custom integrations', 'On-premise option'], popular: false }
];

const PlanList = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planes y Precios</h1>
          <p className="text-muted-foreground mt-1">Gestiona los planes disponibles</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nuevo Plan</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mockPlans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge>Más Popular</Badge>
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
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600" />{feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-2">
                <Button className="flex-1" variant={plan.popular ? 'default' : 'outline'}>Editar</Button>
                <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlanList;
