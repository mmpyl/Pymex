import React, { useState } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Save, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';

const CreateCompany = () => {
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    taxId: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'México',
    postalCode: '',
    industry: '',
    companySize: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  const industries = [
    'Tecnología', 'Finanzas', 'Salud', 'Educación', 'Retail',
    'Manufactura', 'Servicios', 'Consultoría', 'Otros'
  ];

  const companySizes = [
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.taxId.trim()) newErrors.taxId = 'El RFC es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage({ type: 'success', text: 'Empresa creada exitosamente' });
      setFormData({
        name: '', legalName: '', taxId: '', email: '', phone: '',
        website: '', address: '', city: '', state: '', country: 'México',
        postalCode: '', industry: '', companySize: '', status: 'active'
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Empresa</h1>
          <p className="text-muted-foreground mt-1">
            Registra una nueva empresa en el sistema
          </p>
        </div>
        <Button variant="outline" onClick={() => window.history.back()}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>

      {submitMessage && (
        <Alert variant={submitMessage.type === 'success' ? 'default' : 'destructive'}>
          <AlertDescription>{submitMessage.text}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Información Básica
              </CardTitle>
              <CardDescription>Datos principales de la empresa</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Comercial *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej. Tech Solutions"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="legalName">Razón Social</Label>
                <Input
                  id="legalName"
                  name="legalName"
                  placeholder="Ej. Tech Solutions S.A. de C.V."
                  value={formData.legalName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">RFC / Tax ID *</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  placeholder="Ej. TSO123456789"
                  value={formData.taxId}
                  onChange={handleChange}
                  className={errors.taxId ? 'border-destructive' : ''}
                />
                {errors.taxId && <p className="text-sm text-destructive">{errors.taxId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industria</Label>
                <Select value={formData.industry} onValueChange={(value) => handleSelectChange('industry', value)}>
                  <SelectTrigger><SelectValue placeholder="Selecciona una industria" /></SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (<SelectItem key={ind} value={ind}>{ind}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize">Tamaño de Empresa</Label>
                <Select value={formData.companySize} onValueChange={(value) => handleSelectChange('companySize', value)}>
                  <SelectTrigger><SelectValue placeholder="Selecciona el tamaño" /></SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (<SelectItem key={size} value={size}>{size} empleados</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="suspended">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contacto@empresa.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    name="website"
                    placeholder="www.empresa.com"
                    value={formData.website}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Dirección
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Calle y Número</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Av. Principal #123"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input id="city" name="city" placeholder="Ciudad de México" value={formData.city} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" name="state" placeholder="CDMX" value={formData.state} onChange={handleChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Código Postal</Label>
                  <Input id="postalCode" name="postalCode" placeholder="00000" value={formData.postalCode} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input id="country" name="country" value={formData.country} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : (<> <Save className="w-4 h-4 mr-2" /> Guardar Empresa </>)}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCompany;
