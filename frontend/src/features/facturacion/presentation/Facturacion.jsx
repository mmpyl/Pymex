/**
 * Facturacion Presentation Components
 * Componentes React para la visualización de Facturación
 */

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { facturacionService } from '../application/service.js';
import { Comprobante } from '../domain/entities.js';

// Componente principal de Facturacion
export default function Facturacion() {
  const [comprobantes, setComprobantes] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipo, setTipo] = useState('boleta');
  const [form, setForm] = useState({
    venta_id: '',
    serie: 'B001',
    nombre_cliente: '',
    dni_cliente: '',
    ruc_cliente: '',
    razon_social: '',
    direccion: '',
  });
  const [cargando, setCargando] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await facturacionService.loadFacturacionData();
      setComprobantes(data.comprobantes);
      setVentas(data.ventas);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos de facturación');
    } finally {
      setLoading(false);
    }
  };

  const cambiarTipo = (t) => {
    setTipo(t);
    setForm((prev) => ({
      ...prev,
      serie: t === 'factura' ? 'F001' : 'B001',
      nombre_cliente: '',
      dni_cliente: '',
      ruc_cliente: '',
      razon_social: '',
      direccion: '',
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
      const payload =
        tipo === 'factura'
          ? {
              serie: form.serie,
              ruc_cliente: form.ruc_cliente,
              razon_social: form.razon_social,
              direccion: form.direccion,
            }
          : {
              serie: form.serie,
              nombre_cliente: form.nombre_cliente || 'Consumidor Final',
              dni_cliente: form.dni_cliente,
            };

      const result = await facturacionService.emitirComprobante(tipo, form.venta_id, payload);

      if (result.success) {
        toast.success(`${tipo === 'factura' ? 'Factura' : 'Boleta'} emitida: ${result.numero}`);
        setMostrarForm(false);
        setForm({
          venta_id: '',
          serie: tipo === 'factura' ? 'F001' : 'B001',
          nombre_cliente: '',
          dni_cliente: '',
          ruc_cliente: '',
          razon_social: '',
          direccion: '',
        });
        cargar();
      } else {
        toast.error(`SUNAT rechazó: ${result.descripcion}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al emitir comprobante');
    } finally {
      setCargando(false);
    }
  };

  const descargarPdf = async (id, tipoComp) => {
    try {
      const blob = await facturacionService.descargarPDF(id, tipoComp);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tipoComp}_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF descargado');
    } catch {
      toast.error('Error al descargar PDF');
    }
  };

  if (loading) return <FacturacionSkeleton />;

  const ventaSeleccionada = ventas.find((v) => String(v.id) === String(form.venta_id));
  const estadisticas = facturacionService.getEstadisticas(
    {
      total_emitidos: comprobantes.length,
      aceptados: comprobantes.filter((c) => c.estado === 'aceptado').length,
      rechazados: comprobantes.filter((c) => c.estado === 'rechazado').length,
      pendientes: comprobantes.filter((c) => c.estado === 'pendiente').length,
    }
  );

  return (
    <div className="flex-1 space-y-5 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facturación Electrónica</h1>
          <p className="text-sm text-slate-500">Emisión de boletas y facturas a SUNAT (entorno beta)</p>
        </div>
        <button
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            setMostrarForm(!mostrarForm);
            if (!mostrarForm) cargar();
          }}
        >
          {mostrarForm ? '✕ Cancelar' : '+ Emitir comprobante'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {estadisticas.map((k) => (
          <div key={k.label} className={`rounded-xl border-t-4 bg-white p-4 shadow-sm ${k.color}`}>
            <p className="text-xs text-slate-500">{k.label}</p>
            <p className="mt-1 text-xl font-bold">{k.valor}</p>
            <p className="mt-1 text-lg">{k.icono}</p>
          </div>
        ))}
      </div>

      {/* Formulario */}
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
                className={`rounded-lg border px-4 py-3 text-left ${
                  tipo === t.key
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
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
                    Venta #{v.id} — S/ {parseFloat(v.total || 0).toFixed(2)} —{' '}
                    {new Date(v.fecha).toLocaleDateString('es-PE')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Serie</label>
              <input
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                value={form.serie}
                disabled
              />
            </div>

            {tipo === 'boleta' ? (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Nombre cliente</label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.nombre_cliente}
                    onChange={(e) => setForm((p) => ({ ...p, nombre_cliente: e.target.value }))}
                    placeholder="Consumidor Final"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">DNI (opcional)</label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.dni_cliente}
                    onChange={(e) => setForm((p) => ({ ...p, dni_cliente: e.target.value }))}
                    maxLength={8}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">RUC *</label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.ruc_cliente}
                    onChange={(e) => setForm((p) => ({ ...p, ruc_cliente: e.target.value }))}
                    maxLength={11}
                    required={tipo === 'factura'}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Razón social *</label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.razon_social}
                    onChange={(e) => setForm((p) => ({ ...p, razon_social: e.target.value }))}
                    required={tipo === 'factura'}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Dirección fiscal</label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.direccion}
                    onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))}
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2 flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total venta</p>
                <p className="text-2xl font-bold text-indigo-700">
                  S/ {parseFloat(ventaSeleccionada?.total || 0).toFixed(2)}
                </p>
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

      {/* Tabla de comprobantes */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-slate-900">Comprobantes emitidos</h3>
        <p className="mb-4 text-sm text-slate-500">Historial de comprobantes electrónicos enviados a SUNAT.</p>

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
                const est = Comprobante.getEstadoConfig(c.estado);
                return (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-sm font-semibold text-indigo-700">{c.numero}</td>
                    <td className="px-3 py-2 text-sm capitalize text-slate-700">{c.tipo}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">
                      <div>{c.cliente_nombre || c.razon_social || 'Consumidor Final'}</div>
                      {c.cliente_documento && (
                        <div className="text-xs text-slate-400">Documento: {c.cliente_documento}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm font-semibold text-slate-800">S/ {c.totalFormateado}</td>
                    <td className="px-3 py-2 text-sm">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${est.bg} ${est.color}`}>
                        {est.label}
                      </span>
                      {c.sunat_descripcion && (
                        <div className="mt-1 text-xs text-slate-400">{c.sunat_descripcion}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {Comprobante.getTiposConPDF().includes(String(c.tipo || '').toLowerCase()) ? (
                        <button
                          className="rounded-md bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700"
                          onClick={() => descargarPdf(c.id, c.tipo)}
                        >
                          PDF
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {comprobantes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-400">
                    No hay comprobantes emitidos aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loader
function FacturacionSkeleton() {
  return (
    <div className="flex-1 space-y-5 p-6">
      <div className="h-[60px] rounded-xl bg-slate-200/70" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[100px] rounded-xl bg-slate-200/70" />
        ))}
      </div>
      <div className="h-[300px] rounded-xl bg-slate-200/70" />
    </div>
  );
}
