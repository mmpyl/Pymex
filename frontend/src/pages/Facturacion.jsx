import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TIPOS_CON_PDF = ['factura', 'boleta'];

const estadoConfig = {
  aceptado:  { color: '#16a34a', bg: '#dcfce7', label: '✅ Aceptado' },
  rechazado: { color: '#dc2626', bg: '#fee2e2', label: '❌ Rechazado' },
  pendiente: { color: '#d97706', bg: '#fef3c7', label: '⏳ Pendiente' },
};

const Facturacion = () => {
  const [comprobantes,   setComprobantes]   = useState([]);
  const [ventas,         setVentas]         = useState([]);
  const [mostrarForm,    setMostrarForm]    = useState(false);
  const [tipo,           setTipo]           = useState('boleta');
  const [form,           setForm]           = useState({
    venta_id: '', serie: 'B001',
    nombre_cliente: '', dni_cliente: '',
    ruc_cliente: '', razon_social: '', direccion: ''
  });
  const [cargando,       setCargando]       = useState(false);
  const [cargandoDatos,  setCargandoDatos]  = useState(true);
  const [errorVentas,    setErrorVentas]    = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargandoDatos(true);
    setErrorVentas('');
    try {
      const [compRes, ventasRes] = await Promise.allSettled([
        api.get('/facturacion/comprobantes'),
        api.get('/ventas')
      ]);

      setComprobantes(
        compRes.status === 'fulfilled' ? (compRes.value.data || []) : []
      );

      if (ventasRes.status === 'fulfilled') {
        const ventasData = ventasRes.value.data || [];
        setVentas(ventasData);
        if (ventasData.length === 0)
          setErrorVentas('No hay ventas registradas aún. Registra una venta primero.');
      } else {
        setVentas([]);
        setErrorVentas('No se pudieron cargar las ventas. Verifica la conexión.');
      }
    } catch (err) {
      toast.error('Error al cargar datos');
    } finally {
      setCargandoDatos(false);
    }
  };

  const cambiarTipo = (t) => {
    setTipo(t);
    setForm((prev) => ({
      ...prev,
      serie: t === 'factura' ? 'F001' : 'B001',
      nombre_cliente: '', dni_cliente: '',
      ruc_cliente: '', razon_social: '', direccion: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.venta_id) { toast.error('Debes seleccionar una venta'); return; }

    setCargando(true);
    try {
      const payload = tipo === 'factura'
        ? { serie: form.serie, ruc_cliente: form.ruc_cliente, razon_social: form.razon_social, direccion: form.direccion }
        : { serie: form.serie, nombre_cliente: form.nombre_cliente || 'Consumidor Final', dni_cliente: form.dni_cliente };

      const endpoint = tipo === 'factura'
        ? `/facturacion/factura/${form.venta_id}`
        : `/facturacion/boleta/${form.venta_id}`;

      const { data } = await api.post(endpoint, payload);

      if (data.success) {
        toast.success(`${tipo === 'factura' ? 'Factura' : 'Boleta'} emitida: ${data.numero}`);
        setMostrarForm(false);
        setForm({ venta_id: '', serie: tipo === 'factura' ? 'F001' : 'B001', nombre_cliente: '', dni_cliente: '', ruc_cliente: '', razon_social: '', direccion: '' });
        cargar();
      } else {
        toast.error(`SUNAT rechazó: ${data.descripcion}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al emitir comprobante');
    } finally {
      setCargando(false);
    }
  };

  const descargarPdf = async (id, tipoComp) => {
    if (!TIPOS_CON_PDF.includes(tipoComp?.toLowerCase())) {
      toast('PDF no disponible para este tipo de comprobante.');
      return;
    }
    try {
      const response = await api.get(`/facturacion/pdf/${id}/${tipoComp}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tipoComp}_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Error al descargar PDF. Verifica que el comprobante fue aceptado por SUNAT.');
    }
  };

  const ventaSeleccionada = ventas.find((v) => String(v.id) === String(form.venta_id));

  return (
    <div className="flex-1 p-6">
      <div style={styles.header}>
        <div>
          <h1 style={styles.titulo}>Facturación Electrónica</h1>
          <p style={styles.subtitulo}>Emisión de boletas y facturas a SUNAT (entorno beta)</p>
        </div>
        <button style={styles.btnPrimario} onClick={() => { setMostrarForm(!mostrarForm); if (!mostrarForm) cargar(); }}>
          {mostrarForm ? '✕ Cancelar' : '+ Emitir comprobante'}
        </button>
      </div>

      <div style={styles.resumenGrid}>
        {[
          { label: 'Total emitidos', valor: comprobantes.length, color: '#4f46e5', icono: '🧾' },
          { label: 'Aceptados', valor: comprobantes.filter((c) => c.estado === 'aceptado').length, color: '#16a34a', icono: '✅' },
          { label: 'Rechazados', valor: comprobantes.filter((c) => c.estado === 'rechazado').length, color: '#dc2626', icono: '❌' },
          { label: 'Entorno', valor: 'Beta SUNAT', color: '#d97706', icono: '🔧' },
        ].map((k) => (
          <div key={k.label} style={{ ...styles.kpi, borderTop: `3px solid ${k.color}` }}>
            <span style={styles.kpiIcono}>{k.icono}</span>
            <div>
              <p style={styles.kpiLabel}>{k.label}</p>
              <p style={{ ...styles.kpiValor, color: k.color }}>{k.valor}</p>
            </div>
          </div>
        ))}
      </div>

      {mostrarForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitulo}>Emitir comprobante electrónico</h3>

          <div style={styles.tipoSelector}>
            {[
              { key: 'boleta', label: '🧾 Boleta', desc: 'Para personas naturales' },
              { key: 'factura', label: '📄 Factura', desc: 'Requiere RUC del cliente' }
            ].map((t) => (
              <button key={t.key} type="button" onClick={() => cambiarTipo(t.key)}
                style={{ ...styles.tipoBtnBase, ...(tipo === t.key ? styles.tipoBtnActivo : {}) }}>
                <span style={{ fontSize: '16px' }}>{t.label}</span>
                <span style={{ fontSize: '11px', opacity: 0.7, display: 'block', marginTop: '2px' }}>{t.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={{ ...styles.grupo, gridColumn: '1 / -1' }}>
                <label style={styles.label}>
                  Venta a facturar *
                  {cargandoDatos && <span style={styles.loadingLabel}> cargando...</span>}
                </label>
                {errorVentas && <div style={styles.alertaInfo}>⚠️ {errorVentas}</div>}
                <select style={styles.input} value={form.venta_id}
                  onChange={(e) => setForm({ ...form, venta_id: e.target.value })}
                  required disabled={cargandoDatos || ventas.length === 0}>
                  <option value="">
                    {cargandoDatos ? 'Cargando ventas...' : ventas.length === 0 ? 'No hay ventas disponibles' : 'Seleccionar venta'}
                  </option>
                  {ventas.map((v) => (
                    <option key={v.id} value={String(v.id)}>
                      #{v.id} — S/ {parseFloat(v.total).toFixed(2)}
                      {v.Cliente ? ` — ${v.Cliente.nombre}` : ' — Consumidor final'}
                      {' — '}{new Date(v.fecha).toLocaleDateString('es-PE')}
                    </option>
                  ))}
                </select>
                {ventaSeleccionada && (
                  <div style={styles.ventaPreview}>
                    <span>💰 Total: <strong>S/ {parseFloat(ventaSeleccionada.total).toFixed(2)}</strong></span>
                    <span>💳 Pago: <strong>{ventaSeleccionada.metodo_pago}</strong></span>
                    <span>📅 Fecha: <strong>{new Date(ventaSeleccionada.fecha).toLocaleDateString('es-PE')}</strong></span>
                    {ventaSeleccionada.DetalleVentas?.length > 0 && (
                      <span>📦 Ítems: <strong>{ventaSeleccionada.DetalleVentas.length}</strong></span>
                    )}
                  </div>
                )}
              </div>

              <div style={styles.grupo}>
                <label style={styles.label}>Serie</label>
                <input style={{ ...styles.input, backgroundColor: '#f8fafc', color: '#64748b' }}
                  value={form.serie} readOnly />
              </div>

              {tipo === 'boleta' ? (
                <>
                  <div style={styles.grupo}>
                    <label style={styles.label}>Nombre cliente</label>
                    <input style={styles.input} type="text" value={form.nombre_cliente}
                      onChange={(e) => setForm({ ...form, nombre_cliente: e.target.value })}
                      placeholder="Consumidor final" />
                  </div>
                  <div style={styles.grupo}>
                    <label style={styles.label}>DNI <span style={styles.opcional}>(opcional)</span></label>
                    <input style={styles.input} type="text" value={form.dni_cliente}
                      onChange={(e) => setForm({ ...form, dni_cliente: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                      placeholder="12345678" maxLength={8} />
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.grupo}>
                    <label style={styles.label}>RUC cliente *</label>
                    <input style={styles.input} type="text" value={form.ruc_cliente}
                      onChange={(e) => setForm({ ...form, ruc_cliente: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                      placeholder="20123456789" maxLength={11} required />
                  </div>
                  <div style={styles.grupo}>
                    <label style={styles.label}>Razón Social *</label>
                    <input style={styles.input} type="text" value={form.razon_social}
                      onChange={(e) => setForm({ ...form, razon_social: e.target.value })}
                      placeholder="EMPRESA S.A.C." required />
                  </div>
                  <div style={styles.grupo}>
                    <label style={styles.label}>Dirección <span style={styles.opcional}>(opcional)</span></label>
                    <input style={styles.input} type="text" value={form.direccion}
                      onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                      placeholder="Av. Lima 123" />
                  </div>
                </>
              )}
            </div>

            <div style={styles.submitRow}>
              <button style={{ ...styles.btnEmitir, opacity: (cargando || !form.venta_id) ? 0.6 : 1, cursor: (cargando || !form.venta_id) ? 'not-allowed' : 'pointer' }}
                type="submit" disabled={cargando || !form.venta_id}>
                {cargando ? '⏳ Enviando a SUNAT...' : `📤 Emitir ${tipo === 'factura' ? 'Factura' : 'Boleta'}`}
              </button>
              {!form.venta_id && !cargandoDatos && ventas.length > 0 && (
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Selecciona una venta para continuar</span>
              )}
            </div>
          </form>
        </div>
      )}

      <div style={styles.tabla}>
        <div style={styles.tablaHeader}>
          <h3 style={styles.tablaTitulo}>Comprobantes emitidos</h3>
          <button onClick={cargar} style={styles.btnRefresh}>🔄 Actualizar</button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              {['Número', 'Tipo', 'Cliente', 'Total', 'IGV', 'Estado', 'Fecha', 'Acciones'].map((h) =>
                <th key={h} style={styles.th}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {comprobantes.map((c) => {
              const est = estadoConfig[c.estado] || estadoConfig.pendiente;
              const tienePdf = c.estado === 'aceptado' && TIPOS_CON_PDF.includes(c.tipo?.toLowerCase());
              const esNotaC = c.tipo === 'nota_credito';

              return (
                <tr key={c.id} style={styles.tr}>
                  <td style={styles.td}><strong style={{ color: '#4f46e5' }}>{c.numero}</strong></td>
                  <td style={styles.td}>
                    <span style={styles.tipoBadge}>
                      {c.tipo === 'boleta' ? '🧾' : c.tipo === 'factura' ? '📄' : '📋'} {c.tipo}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div>{c.razon_social || 'Consumidor final'}</div>
                    {c.ruc_cliente && <div style={{ fontSize: '11px', color: '#94a3b8' }}>RUC: {c.ruc_cliente}</div>}
                  </td>
                  <td style={styles.td}><strong>S/ {parseFloat(c.total || 0).toFixed(2)}</strong></td>
                  <td style={styles.td}>S/ {parseFloat(c.igv || 0).toFixed(2)}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, backgroundColor: est.bg, color: est.color }}>{est.label}</span>
                    {c.sunat_descripcion && (
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{c.sunat_descripcion}</div>
                    )}
                  </td>
                  <td style={styles.td}>
                    {c.fecha_emision ? new Date(c.fecha_emision).toLocaleDateString('es-PE') : '-'}
                  </td>
                  <td style={styles.td}>
                    {tienePdf && (
                      <button onClick={() => descargarPdf(c.id, c.tipo)} style={styles.btnPdf} title="Descargar PDF">
                        📄 PDF
                      </button>
                    )}
                    {esNotaC && (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }} title="Las notas de crédito no generan PDF independiente">
                        Sin PDF
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {comprobantes.length === 0 && !cargandoDatos && (
              <tr>
                <td colSpan={8} style={styles.sinDatos}>
                  <div>🧾</div>
                  <div>No hay comprobantes emitidos aún</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                    Emite tu primera boleta o factura usando el botón de arriba
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '30px', flex: 1, maxWidth: '1200px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '16px' },
  titulo: { fontSize: '24px', fontWeight: '700', color: '#1e1b4b', margin: '0 0 4px' },
  subtitulo: { fontSize: '13px', color: '#64748b', margin: 0 },
  btnPrimario: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0 },
  resumenGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' },
  kpi: { backgroundColor: 'white', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', gap: '12px', alignItems: 'center' },
  kpiIcono: { fontSize: '24px' },
  kpiLabel: { margin: '0 0 2px', fontSize: '12px', color: '#64748b' },
  kpiValor: { margin: 0, fontSize: '20px', fontWeight: '700' },
  formCard: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.09)', marginBottom: '24px', border: '1px solid #e2e8f0' },
  formTitulo: { margin: '0 0 20px', color: '#1e1b4b', fontSize: '17px', fontWeight: '700' },
  tipoSelector: { display: 'flex', gap: '12px', marginBottom: '24px' },
  tipoBtnBase: { flex: 1, padding: '12px 20px', border: '2px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', backgroundColor: 'white', fontSize: '14px', textAlign: 'left' },
  tipoBtnActivo: { borderColor: '#4f46e5', backgroundColor: '#eef2ff', color: '#4f46e5' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  grupo: { display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '6px', fontWeight: '600', color: '#374151', fontSize: '13px' },
  loadingLabel: { fontWeight: '400', color: '#94a3b8', fontStyle: 'italic' },
  opcional: { fontWeight: '400', color: '#94a3b8' },
  input: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
  alertaInfo: { backgroundColor: '#fef9c3', border: '1px solid #fde047', color: '#713f12', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px', fontSize: '13px' },
  ventaPreview: { marginTop: '8px', padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#166534' },
  submitRow: { marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px' },
  btnEmitir: { padding: '12px 28px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px' },
  tabla: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
  tablaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' },
  tablaTitulo: { margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e1b4b' },
  btnRefresh: { padding: '6px 14px', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f8fafc' },
  th: { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#374151', verticalAlign: 'middle' },
  badge: { padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', display: 'inline-block' },
  tipoBadge: { fontSize: '12px', color: '#475569', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' },
  btnPdf: { padding: '5px 12px', backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  sinDatos: { textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '15px', lineHeight: '1.8' }
};

export default Facturacion;

