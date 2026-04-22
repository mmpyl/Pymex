import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TIPOS_CON_PDF = ['factura', 'boleta'];

const estadoConfig = {
  aceptado: { color: 'text-emerald-700', bg: 'bg-emerald-100', label: '✅ Aceptado' },
  rechazado: { color: 'text-red-700', bg: 'bg-red-100', label: '❌ Rechazado' },
  pendiente: { color: 'text-amber-700', bg: 'bg-amber-100', label: '⏳ Pendiente' },
};

const Facturacion = () => {
  const [comprobantes, setComprobantes] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipo, setTipo] = useState('boleta');
  const [form, setForm] = useState({
    venta_id: '', serie: 'B001',
    nombre_cliente: '', dni_cliente: '',
    ruc_cliente: '', razon_social: '', direccion: '',
  });
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [errorVentas, setErrorVentas] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargandoDatos(true);
    setErrorVentas('');
    try {
      const [compRes, ventasRes] = await Promise.allSettled([
        api.get('/facturacion/comprobantes'),
        api.get('/ventas'),
      ]);

      setComprobantes(compRes.status === 'fulfilled' ? (compRes.value.data || []) : []);

      if (ventasRes.status === 'fulfilled') {
        const ventasData = ventasRes.value.data || [];
        setVentas(ventasData);
        if (ventasData.length === 0) setErrorVentas('No hay ventas registradas aún. Registra una venta primero.');
      } else {
        setVentas([]);
        setErrorVentas('No se pudieron cargar las ventas. Verifica la conexión.');
      }
    } catch {
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
      ruc_cliente: '', razon_social: '', direccion: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.venta_id) {
      toast.error('Debes seleccionar una venta');
      return;
    }

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
    <div className="flex-1 space-y-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facturación Electrónica</h1>
          <p className="text-sm text-slate-500">Emisión de boletas y facturas a SUNAT (entorno beta)</p>
        </div>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => { setMostrarForm(!mostrarForm); if (!mostrarForm) cargar(); }}>
          {mostrarForm ? '✕ Cancelar' : '+ Emitir comprobante'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total emitidos', valor: comprobantes.length, color: 'text-indigo-700 border-indigo-500', icono: '🧾' },
          { label: 'Aceptados', valor: comprobantes.filter((c) => c.estado === 'aceptado').length, color: 'text-emerald-700 border-emerald-500', icono: '✅' },
          { label: 'Rechazados', valor: comprobantes.filter((c) => c.estado === 'rechazado').length, color: 'text-red-700 border-red-500', icono: '❌' },
          { label: 'Entorno', valor: 'Beta SUNAT', color: 'text-amber-700 border-amber-500', icono: '🔧' },
        ].map((k) => (
          <div key={k.label} className={`rounded-xl border-t-4 bg-white p-4 shadow-sm ${k.color}`}>
            <p className="text-xs text-slate-500">{k.label}</p>
            <p className="mt-1 text-xl font-bold">{k.valor}</p>
            <p className="mt-1 text-lg">{k.icono}</p>
          </div>
        ))}
      </div>

      {mostrarForm && (
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Nuevo comprobante</h3>

          <div className="mb-4 grid grid-cols-2 gap-3">
            {[
              { key: 'boleta', label: '🧾 Boleta', desc: 'DNI o consumidor final' },
              { key: 'factura', label: '🏢 Factura', desc: 'RUC y razón social' },
            ].map((t) => (
              <button
                key={t.key}
                className={`rounded-lg border px-4 py-3 text-left ${tipo === t.key ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700'}`}
                onClick={() => cambiarTipo(t.key)}
              >
                <span className="block text-base">{t.label}</span>
                <span className="mt-0.5 block text-xs opacity-70">{t.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Venta a facturar *</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={form.venta_id}
                onChange={(e) => setForm((prev) => ({ ...prev, venta_id: e.target.value }))}
                required
              >
                <option value="">Seleccionar venta</option>
                {ventas.map((v) => (
                  <option key={v.id} value={v.id}>
                    Venta #{v.id} — S/ {parseFloat(v.total || 0).toFixed(2)} — {new Date(v.fecha).toLocaleDateString('es-PE')}
                  </option>
                ))}
              </select>
              {errorVentas && <p className="mt-1 text-xs text-red-600">{errorVentas}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Serie</label>
              <input className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500" value={form.serie} disabled />
            </div>

            {tipo === 'boleta' ? (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Nombre cliente</label>
                  <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.nombre_cliente} onChange={(e) => setForm((p) => ({ ...p, nombre_cliente: e.target.value }))} placeholder="Consumidor Final" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">DNI (opcional)</label>
                  <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.dni_cliente} onChange={(e) => setForm((p) => ({ ...p, dni_cliente: e.target.value }))} maxLength={8} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">RUC *</label>
                  <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.ruc_cliente} onChange={(e) => setForm((p) => ({ ...p, ruc_cliente: e.target.value }))} maxLength={11} required={tipo === 'factura'} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Razón social *</label>
                  <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.razon_social} onChange={(e) => setForm((p) => ({ ...p, razon_social: e.target.value }))} required={tipo === 'factura'} />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Dirección fiscal</label>
                  <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.direccion} onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))} />
                </div>
              </>
            )}

            <div className="md:col-span-2 flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total venta</p>
                <p className="text-2xl font-bold text-indigo-700">S/ {parseFloat(ventaSeleccionada?.total || 0).toFixed(2)}</p>
              </div>
              <button
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={cargando || !form.venta_id}
              >
                {cargando ? '⏳ Emitiendo...' : `✅ Emitir ${tipo === 'factura' ? 'Factura' : 'Boleta'}`}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-slate-900">Comprobantes emitidos</h3>
        <p className="mb-4 text-sm text-slate-500">Historial de comprobantes electrónicos enviados a SUNAT.</p>

        {cargandoDatos ? (
          <p className="py-6 text-center text-slate-400">Cargando comprobantes…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Número</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Tipo</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Cliente</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Total</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Estado</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {comprobantes.map((c) => {
                  const est = estadoConfig[c.estado] || { color: 'text-slate-700', bg: 'bg-slate-100', label: c.estado || '—' };
                  return (
                    <tr key={c.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-sm font-semibold text-indigo-700">{c.numero}</td>
                      <td className="px-3 py-2 text-sm capitalize text-slate-700">{c.tipo}</td>
                      <td className="px-3 py-2 text-sm text-slate-700">
                        <div>{c.nombre_cliente || c.razon_social || 'Consumidor Final'}</div>
                        {c.ruc_cliente && <div className="text-xs text-slate-400">RUC: {c.ruc_cliente}</div>}
                      </td>
                      <td className="px-3 py-2 text-sm font-semibold text-slate-800">S/ {parseFloat(c.total || 0).toFixed(2)}</td>
                      <td className="px-3 py-2 text-sm">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${est.bg} ${est.color}`}>{est.label}</span>
                        {c.sunat_descripcion && <div className="mt-1 text-xs text-slate-400">{c.sunat_descripcion}</div>}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {TIPOS_CON_PDF.includes(String(c.tipo || '').toLowerCase()) ? (
                          <button className="rounded-md bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700" onClick={() => descargarPdf(c.id, c.tipo)}>
                            PDF
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400" title="Las notas de crédito no generan PDF independiente">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {comprobantes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-400">
                      No hay comprobantes emitidos aún.
                      <div className="mt-1 text-xs">Usa “Emitir comprobante” para generar tu primer CPE.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Facturacion;
