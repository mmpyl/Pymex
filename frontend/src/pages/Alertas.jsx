import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const tipoConfig = {
  stock_bajo: { color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-500', icono: '📦', label: 'Stock bajo' },
  ventas_bajas: { color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-500', icono: '📉', label: 'Ventas bajas' },
  gastos_altos: { color: 'text-violet-700', bg: 'bg-violet-100', border: 'border-violet-500', icono: '💸', label: 'Gastos altos' },
  default: { color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-400', icono: '🔔', label: 'Alerta' }
};

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const { data } = await api.get('/alertas');
    setAlertas(data);
  };

  const marcarLeida = async (id) => {
    await api.put(`/alertas/${id}/leer`);
    cargar();
  };

  const marcarTodas = async () => {
    await api.put('/alertas/todas/leer');
    toast.success('Todas las alertas marcadas como leídas');
    cargar();
  };

  const alertasFiltradas = filtro === 'todas' ? alertas
    : filtro === 'sin-leer' ? alertas.filter((a) => !a.leido)
    : alertas.filter((a) => a.tipo === filtro);

  const sinLeer = alertas.filter((a) => !a.leido).length;

  return (
    <div className="flex-1 p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
          Alertas
          {sinLeer > 0 && <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs text-white">{sinLeer} sin leer</span>}
        </h1>
        {sinLeer > 0 && (
          <button className="rounded-lg bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700" onClick={marcarTodas}>
            ✓ Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          ['todas', 'Todas'],
          ['sin-leer', `Sin leer (${sinLeer})`],
          ['stock_bajo', '📦 Stock bajo'],
          ['ventas_bajas', '📉 Ventas bajas']
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFiltro(key)}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold ${filtro === key ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {alertasFiltradas.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center text-slate-400 shadow-sm">
            <p className="m-0 text-4xl">🎉</p>
            <p>No hay alertas en esta categoría</p>
          </div>
        ) : (
          alertasFiltradas.map((alerta) => {
            const config = tipoConfig[alerta.tipo] || tipoConfig.default;
            return (
              <div
                key={alerta.id}
                className={`flex items-center gap-4 rounded-xl border-l-4 bg-white p-4 shadow-sm ${config.border} ${alerta.leido ? 'opacity-60' : ''}`}
              >
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-xl ${config.bg} ${config.color}`}>
                  {config.icono}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${config.bg} ${config.color}`}>{config.label}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(alerta.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="m-0 text-sm text-slate-700">{alerta.mensaje}</p>
                </div>
                {!alerta.leido ? (
                  <button onClick={() => marcarLeida(alerta.id)} className="rounded-md bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    ✓ Leído
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">✓ Leído</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Alertas;
