import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import DashboardSaaS from '../admin-panel/dashboard';
import EmpresasModule from '../admin-panel/empresas';
import UsuariosModule from '../admin-panel/usuarios';
import FeaturesModule from '../admin-panel/features';
import SuscripcionesModule from '../admin-panel/suscripciones';
import PagosModule from '../admin-panel/pagos';
import LimitesModule from '../admin-panel/limites';
import MetricasModule from '../admin-panel/metricas';
import AuditoriaModule from '../admin-panel/auditoria';

const tabs = ['dashboard', 'empresas', 'rubros', 'usuarios', 'planes', 'features', 'limites', 'suscripciones', 'pagos', 'auditoria', 'metricas'];

const Section = ({ title, children }) => (
  <section style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, border: '1px solid #e2e8f0' }}>
    <h3 style={{ marginTop: 0 }}>{title}</h3>
    {children}
  </section>
);

export default function AdminPanel() {
  const [active, setActive] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [dashboard, setDashboard] = useState({});
  const [metricas, setMetricas] = useState({ series_6m: [] });
  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [features, setFeatures] = useState([]);
  const [suscripciones, setSuscripciones] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [auditoria, setAuditoria] = useState([]);

  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');
  const [empresaForm, setEmpresaForm] = useState({ nombre: '', email: '', ruc: '', plan: 'basico' });
  const [featureForm, setFeatureForm] = useState({ nombre: '', codigo: '', descripcion: '' });
  const [limiteForm, setLimiteForm] = useState({ plan_id: '', limite: 'max_productos', valor: 100 });
  const [rubroForm, setRubroForm] = useState({ nombre: '', descripcion: '' });

  const canAccess = useMemo(() => Boolean(localStorage.getItem('admin_token')), []);

  const safeReq = async (fn) => {
    setLoading(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAll = () => safeReq(async () => {
    const [d, m, e, p, f, s, pa, au, r] = await Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/metricas'),
      api.get('/admin/empresas?page=1&pageSize=30'),
      api.get('/admin/planes'),
      api.get('/admin/features'),
      api.get('/admin/suscripciones'),
      api.get('/admin/pagos'),
      api.get('/admin/auditoria?page=1&pageSize=50'),
      api.get('/admin/rubros')
    ]);

    setDashboard(d.data);
    setMetricas(m.data);
    setEmpresas(e.data.data || []);
    setPlanes(p.data || []);
    setFeatures(f.data || []);
    setSuscripciones(s.data || []);
    setPagos(pa.data || []);
    setAuditoria(au.data.data || []);
    setRubros(r.data || []);

    if (!empresaSeleccionada && (e.data.data || []).length > 0) {
      setEmpresaSeleccionada(String(e.data.data[0].id));
    }
  });

  const loadUsuarios = (empresaId) => safeReq(async () => {
    if (!empresaId) return;
    const { data } = await api.get(`/admin/empresas/${empresaId}/usuarios`);
    setUsuarios(data || []);
  });

  useEffect(() => {
    if (canAccess) loadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccess]);

  useEffect(() => {
    if (empresaSeleccionada) loadUsuarios(empresaSeleccionada);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaSeleccionada]);

  const crearEmpresa = async (e) => {
    e.preventDefault();
    await safeReq(async () => {
      await api.post('/admin/empresas', empresaForm);
      setEmpresaForm({ nombre: '', email: '', ruc: '', plan: 'basico' });
      await loadAll();
    });
  };

  const cambiarEstadoEmpresa = async (id, estado) => {
    await safeReq(async () => {
      await api.patch(`/admin/empresas/${id}/estado`, { estado });
      await loadAll();
    });
  };

  const actualizarUsuario = async (usuarioId, patch) => {
    await safeReq(async () => {
      await api.patch(`/admin/empresas/${empresaSeleccionada}/usuarios/${usuarioId}`, patch);
      await loadUsuarios(empresaSeleccionada);
    });
  };


  const crearRubro = async (e) => {
    e.preventDefault();
    await safeReq(async () => {
      await api.post('/admin/rubros', rubroForm);
      setRubroForm({ nombre: '', descripcion: '' });
      await loadAll();
    });
  };

  const asignarRubrosEmpresa = async (empresaId, rubroIds) => {
    if (!rubroIds.length) return;
    await safeReq(async () => {
      await api.put(`/admin/empresas/${empresaId}/rubros`, { rubro_ids: rubroIds });
      await loadAll();
    });
  };

  const crearFeature = async (e) => {
    e.preventDefault();
    await safeReq(async () => {
      await api.post('/admin/features', featureForm);
      setFeatureForm({ nombre: '', codigo: '', descripcion: '' });
      await loadAll();
    });
  };

  const guardarLimite = async (e) => {
    e.preventDefault();
    await safeReq(async () => {
      await api.post(`/admin/planes/${limiteForm.plan_id}/limits`, { limite: limiteForm.limite, valor: Number(limiteForm.valor) });
      await loadAll();
    });
  };

  const ejecutarCobranza = async () => {
    await safeReq(async () => {
      const { data } = await api.post('/admin/billing/run-collection');
      alert(`Cobranza ejecutada: ${data.vencidos_actualizados} pagos vencidos, ${data.empresas_suspendidas} empresas suspendidas`);
      await loadAll();
    });
  };

  const checkoutPago = async (pagoId) => {
    await safeReq(async () => {
      const { data } = await api.post(`/admin/pagos/${pagoId}/checkout`);
      alert(`Checkout generado: ${data.checkout_url}`);
    });
  };

  if (!canAccess) return <div style={{ padding: 24 }}>No tienes permisos para acceder al panel super admin.</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Panel Super Admin SaaS</h1>
      <button onClick={ejecutarCobranza}>Ejecutar cobranza</button>

      <nav style={{ display: 'flex', gap: 10, margin: '16px 0', flexWrap: 'wrap' }}>
        {tabs.map((tab) => <button key={tab} onClick={() => setActive(tab)}>{tab}</button>)}
      </nav>

      {error && <p style={{ color: '#b91c1c', fontWeight: 600 }}>{error}</p>}
      {loading && <p>Cargando...</p>}

      {active === 'dashboard' && <Section title='Dashboard SaaS'><DashboardSaaS dashboard={dashboard} /></Section>}

      {active === 'empresas' && (
        <>
          <Section title='Crear empresa'>
            <form onSubmit={crearEmpresa} style={{ display: 'grid', gap: 8, maxWidth: 500 }}>
              <input placeholder='Nombre' value={empresaForm.nombre} onChange={(e) => setEmpresaForm({ ...empresaForm, nombre: e.target.value })} required />
              <input placeholder='Email' value={empresaForm.email} onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })} required />
              <input placeholder='RUC' value={empresaForm.ruc} onChange={(e) => setEmpresaForm({ ...empresaForm, ruc: e.target.value })} />
              <button type='submit'>Crear</button>
            </form>
          </Section>
          <Section title='Empresas'><EmpresasModule empresas={empresas} rubros={rubros} onEstado={cambiarEstadoEmpresa} onAsignarRubros={asignarRubrosEmpresa} /></Section>
        </>
      )}


      {active === 'rubros' && (
        <>
          <Section title='Crear rubro'>
            <form onSubmit={crearRubro} style={{ display: 'grid', gap: 8, maxWidth: 500 }}>
              <input placeholder='Nombre de rubro (ej: Ferretería)' value={rubroForm.nombre} onChange={(e) => setRubroForm({ ...rubroForm, nombre: e.target.value })} required />
              <input placeholder='Descripción' value={rubroForm.descripcion} onChange={(e) => setRubroForm({ ...rubroForm, descripcion: e.target.value })} />
              <button type='submit'>Guardar rubro</button>
            </form>
          </Section>
          <Section title='Rubros registrados'>
            <ul>{rubros.map((r) => <li key={r.id}><strong>{r.nombre}</strong> - {r.descripcion || 'Sin descripción'}</li>)}</ul>
          </Section>
        </>
      )}

      {active === 'usuarios' && (
        <Section title='Usuarios por empresa'>
          <select value={empresaSeleccionada} onChange={(e) => setEmpresaSeleccionada(e.target.value)}>
            {empresas.map((emp) => <option key={emp.id} value={emp.id}>{emp.nombre}</option>)}
          </select>
          <UsuariosModule usuarios={usuarios} onActualizar={actualizarUsuario} />
        </Section>
      )}

      {active === 'planes' && <Section title='Planes'><ul>{planes.map((p) => <li key={p.id}>{p.nombre} - {p.codigo} - S/ {p.precio_mensual}</li>)}</ul></Section>}

      {active === 'features' && (
        <>
          <Section title='Crear feature'>
            <form onSubmit={crearFeature} style={{ display: 'grid', gap: 8, maxWidth: 500 }}>
              <input placeholder='Nombre' value={featureForm.nombre} onChange={(e) => setFeatureForm({ ...featureForm, nombre: e.target.value })} required />
              <input placeholder='Código' value={featureForm.codigo} onChange={(e) => setFeatureForm({ ...featureForm, codigo: e.target.value })} required />
              <input placeholder='Descripción' value={featureForm.descripcion} onChange={(e) => setFeatureForm({ ...featureForm, descripcion: e.target.value })} />
              <button type='submit'>Guardar feature</button>
            </form>
          </Section>
          <Section title='Features'><FeaturesModule features={features} /></Section>
        </>
      )}

      {active === 'limites' && (
        <>
          <Section title='Configurar límite por plan'>
            <form onSubmit={guardarLimite} style={{ display: 'grid', gap: 8, maxWidth: 450 }}>
              <select value={limiteForm.plan_id} onChange={(e) => setLimiteForm({ ...limiteForm, plan_id: e.target.value })} required>
                <option value=''>Selecciona plan</option>
                {planes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <input value={limiteForm.limite} onChange={(e) => setLimiteForm({ ...limiteForm, limite: e.target.value })} />
              <input type='number' value={limiteForm.valor} onChange={(e) => setLimiteForm({ ...limiteForm, valor: e.target.value })} />
              <button type='submit'>Guardar límite</button>
            </form>
          </Section>
          <Section title='Límites por plan'><LimitesModule planes={planes} /></Section>
        </>
      )}

      {active === 'suscripciones' && <Section title='Suscripciones'><SuscripcionesModule suscripciones={suscripciones} /></Section>}
      {active === 'pagos' && <Section title='Pagos'><PagosModule pagos={pagos} onCheckout={checkoutPago} /></Section>}
      {active === 'auditoria' && <Section title='Auditoría'><AuditoriaModule auditoria={auditoria} /></Section>}
      {active === 'metricas' && <Section title='Métricas SaaS'><MetricasModule dashboard={dashboard} /><pre>{JSON.stringify(metricas.series_6m || [], null, 2)}</pre></Section>}
    </div>
  );
}
