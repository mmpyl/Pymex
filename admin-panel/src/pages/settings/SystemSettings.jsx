import React, { useState } from 'react';
import { Settings, Save, Bell, Globe, Shield, CreditCard, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Admin Panel',
    siteDescription: 'Panel de administración del sistema',
    supportEmail: 'soporte@empresa.com',
    defaultCurrency: 'MXN',
    defaultLanguage: 'es',
    timezone: 'America/Mexico_City',
    enableNotifications: true,
    enableEmailAlerts: true,
    enableTwoFactor: false,
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    enableAuditLog: true,
    dataRetention: '90'
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSwitchChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
          <p className="text-muted-foreground mt-1">Ajustes generales de la plataforma</p>
        </div>
        <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />Guardar Cambios</Button>
      </div>

      {saved && (
        <Alert variant="default">
          <AlertDescription>Configuración guardada exitosamente</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" />Configuración General</CardTitle>
            <CardDescription>Información básica del sitio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nombre del Sitio</Label>
                <Input id="siteName" value={settings.siteName} onChange={(e) => handleChange('siteName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Email de Soporte</Label>
                <Input id="supportEmail" type="email" value={settings.supportEmail} onChange={(e) => handleChange('supportEmail', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Descripción</Label>
              <Textarea id="siteDescription" value={settings.siteDescription} onChange={(e) => handleChange('siteDescription', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Regional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" />Configuración Regional</CardTitle>
            <CardDescription>Moneda, idioma y zona horaria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Moneda Predeterminada</Label>
                <Select value={settings.defaultCurrency} onValueChange={(v) => handleChange('defaultCurrency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                    <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Idioma Predeterminado</Label>
                <Select value={settings.defaultLanguage} onValueChange={(v) => handleChange('defaultLanguage', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zona Horaria</Label>
                <Select value={settings.timezone} onValueChange={(v) => handleChange('timezone', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Mexico_City">Ciudad de México</SelectItem>
                    <SelectItem value="America/New_York">New York</SelectItem>
                    <SelectItem value="Europe/Madrid">Madrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />Notificaciones y Alertas</CardTitle>
            <CardDescription>Configura cómo recibir notificaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones Push</Label>
                <p className="text-sm text-muted-foreground">Recibe notificaciones en el navegador</p>
              </div>
              <Switch checked={settings.enableNotifications} onCheckedChange={(v) => handleSwitchChange('enableNotifications', v)} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas por Email</Label>
                <p className="text-sm text-muted-foreground">Recibe alertas importantes por correo</p>
              </div>
              <Switch checked={settings.enableEmailAlerts} onCheckedChange={(v) => handleSwitchChange('enableEmailAlerts', v)} />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Seguridad</CardTitle>
            <CardDescription>Configuraciones de seguridad y acceso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticación de Dos Factores</Label>
                <p className="text-sm text-muted-foreground">Requiere 2FA para todos los usuarios</p>
              </div>
              <Switch checked={settings.enableTwoFactor} onCheckedChange={(v) => handleSwitchChange('enableTwoFactor', v)} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tiempo de Sesión (minutos)</Label>
                <Input type="number" value={settings.sessionTimeout} onChange={(e) => handleChange('sessionTimeout', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Intentos de Login Máximos</Label>
                <Input type="number" value={settings.maxLoginAttempts} onChange={(e) => handleChange('maxLoginAttempts', e.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Audit Log</Label>
                <p className="text-sm text-muted-foreground">Registrar todas las actividades</p>
              </div>
              <Switch checked={settings.enableAuditLog} onCheckedChange={(v) => handleSwitchChange('enableAuditLog', v)} />
            </div>
            <div className="space-y-2">
              <Label>Retención de Datos (días)</Label>
              <Input type="number" value={settings.dataRetention} onChange={(e) => handleChange('dataRetention', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" />Facturación</CardTitle>
            <CardDescription>Configuración de pagos y facturas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>RFC de la Empresa</Label>
              <Input placeholder="EMP123456789" />
            </div>
            <div className="space-y-2">
              <Label>Dirección Fiscal</Label>
              <Textarea placeholder="Calle, número, colonia, CP, ciudad, estado" rows={2} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg"><Save className="w-4 h-4 mr-2" />Guardar Todos los Cambios</Button>
      </div>
    </div>
  );
};

export default SystemSettings;
