import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Reportes = () => {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [cargando, setCargando] = useState('');

  const descargar = async (tipo) => {
    setCargando(tipo);
    try {
      const params = desde && hasta ? `?desde=${desde}&hasta=${hasta}` : '';
      const urls = {
        'ventas-pdf': `/reportes/ventas/pdf${params}`,
        'ventas-excel': `/reportes/ventas/excel${params}`,
        'gastos-excel': '/reportes/gastos/excel'
      };

      const response = await api.get(urls[tipo], { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = tipo.includes('pdf') ? `reporte_${tipo}.pdf` : `reporte_${tipo}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Reporte descargado');
    } catch {
      toast.error('Error al descargar reporte');
    } finally {
      setCargando('');
    }
  };

  const reportes = [
    { id: 'ventas-pdf', titulo: 'Reporte de Ventas', formato: 'PDF', icono: '📄', color: 'text-red-700', bg: 'bg-red-100', btn: 'bg-red-600' },
    { id: 'ventas-excel', titulo: 'Reporte de Ventas', formato: 'Excel', icono: '📊', color: 'text-emerald-700', bg: 'bg-emerald-100', btn: 'bg-emerald-600' },
    { id: 'gastos-excel', titulo: 'Reporte de Gastos', formato: 'Excel', icono: '💸', color: 'text-amber-700', bg: 'bg-amber-100', btn: 'bg-amber-600' }
  ];

  return (
    <div className="flex-1 p-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Reportes</h1>

      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">📅 Filtrar por fecha (opcional)</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold text-slate-700">Desde</label>
            <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold text-slate-700">Hasta</label>
            <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
          <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600" onClick={() => { setDesde(''); setHasta(''); }}>
            Limpiar filtro
          </button>
        </div>
        {desde && hasta && (
          <p className="mt-3 text-sm font-semibold text-indigo-600">Reportes del {new Date(desde).toLocaleDateString('es-PE')} al {new Date(hasta).toLocaleDateString('es-PE')}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {reportes.map((r) => (
          <div key={r.id} className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${r.bg} ${r.color}`}>{r.icono}</div>
            <div className="flex-1">
              <h3 className="mb-1 text-base font-semibold text-slate-900">{r.titulo}</h3>
              <p className="mb-2 text-sm text-slate-500">Descarga el reporte en formato {r.formato}.</p>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${r.bg} ${r.color}`}>{r.formato}</span>
            </div>
            <button
              onClick={() => descargar(r.id)}
              disabled={cargando === r.id}
              className={`rounded-lg px-4 py-2 font-semibold text-white ${r.btn} disabled:opacity-70`}
            >
              {cargando === r.id ? '⏳ Generando...' : '⬇ Descargar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reportes;
