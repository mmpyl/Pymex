import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import toast from 'react-hot-toast';

const riesgoConfig = {
  critico: { color: 'text-red-700', bg: 'bg-red-100', label: '🔴 Crítico' },
  alto: { color: 'text-amber-700', bg: 'bg-amber-100', label: '🟠 Alto' },
  medio: { color: 'text-blue-700', bg: 'bg-blue-100', label: '🔵 Medio' },
  bajo: { color: 'text-emerald-700', bg: 'bg-emerald-100', label: '🟢 Bajo' },
  sin_ventas: { color: 'text-slate-700', bg: 'bg-slate-100', label: '⚪ Sin ventas' },
};

const Predicciones = () => {
  const [ventasPred, setVentasPred] = useState([]);
  const [demandaPred, setDemandaPred] = useState([]);
  const [stockPred, setStockPred] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [entrenando, setEntrenando] = useState(false);
  const [vista, setVista] = useState('ventas');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const [v, d, s] = await Promise.all([
        api.get('/ml/ventas?meses=6'),
        api.get('/ml/demanda'),
        api.get('/ml/stock'),
      ]);
      setVentasPred(v.data.predicciones || []);
      setDemandaPred(d.data.predicciones || []);
      setStockPred(s.data.predicciones || []);
    } catch {
      toast.error('Activa el servicio ML (puerto 8000)');
    } finally {
      setCargando(false);
    }
  };

  const entrenar = async () => {
    setEntrenando(true);
    try {
      await api.post('/ml/entrenar');
      toast.success('Modelos entrenados correctamente');
      cargar();
    } catch {
      toast.error('Error al entrenar modelos');
    } finally {
      setEntrenando(false);
    }
  };

  return (
    <div className="flex-1 space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🤖 Predicciones ML</h1>
          <p className="text-sm text-slate-500">Las predicciones se generan con tus datos históricos usando Random Forest y XGBoost.</p>
        </div>
        <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70" onClick={entrenar} disabled={entrenando}>
          {entrenando ? '⏳ Entrenando...' : '🔄 Entrenar modelos'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['ventas', '📈 Ventas futuras'],
          ['demanda', '📦 Demanda por producto'],
          ['stock', '⚠️ Quiebre de stock'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setVista(key)}
            className={`rounded-md px-4 py-2 text-sm font-semibold ${vista === key ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="rounded-xl bg-white p-14 text-center text-slate-500 shadow-sm">⏳ Cargando predicciones...</div>
      ) : (
        <>
          {vista === 'ventas' && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Predicción de ventas — próximos 6 meses</h2>
              <p className="mb-4 text-sm text-slate-500">Modelo: <strong>Random Forest</strong> — Basado en tus ventas históricas</p>
              {ventasPred.length > 0 && !ventasPred[0]?.error ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ventasPred}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis />
                      <Tooltip formatter={(v) => `S/ ${parseFloat(v).toFixed(2)}`} />
                      <Bar dataKey="ventas_predichas" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Ventas predichas" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                    {ventasPred.map((p, i) => (
                      <div key={i} className="rounded-lg border-t-4 border-indigo-600 bg-slate-50 p-3 text-center">
                        <p className="text-xs font-semibold text-slate-500">{p.periodo}</p>
                        <p className="text-lg font-bold text-indigo-700">S/ {parseFloat(p.ventas_predichas).toFixed(2)}</p>
                        <p className="text-[11px] text-slate-400">Confianza: {p.confianza}%</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-lg bg-slate-50 p-8 text-center text-slate-400">
                  <p>⚠️ {ventasPred[0]?.error || 'Sin datos suficientes'}</p>
                  <p className="text-xs">Registra más ventas y presiona "Entrenar modelos"</p>
                </div>
              )}
            </div>
          )}

          {vista === 'demanda' && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Demanda predicha por producto — próximo mes</h2>
              <p className="mb-4 text-sm text-slate-500">Modelo: <strong>XGBoost</strong> — Cuánto vas a vender de cada producto</p>
              {demandaPred.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={demandaPred.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="producto" type="category" width={130} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => `${v} unidades`} />
                      <Bar dataKey="demanda_predicha" fill="#16a34a" radius={[0, 6, 6, 0]} name="Unidades" />
                    </BarChart>
                  </ResponsiveContainer>
                  <TableShell>
                    <thead className="bg-slate-50"><tr><Th>Producto</Th><Th>Demanda predicha</Th><Th>Método</Th><Th>Confianza</Th></tr></thead>
                    <tbody>
                      {demandaPred.map((p, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <Td>{p.producto}</Td>
                          <Td><strong>{p.demanda_predicha} uds</strong></Td>
                          <Td><span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">{p.metodo}</span></Td>
                          <Td>{p.confianza}%</Td>
                        </tr>
                      ))}
                    </tbody>
                  </TableShell>
                </>
              ) : (
                <div className="rounded-lg bg-slate-50 p-8 text-center text-slate-400">Sin datos de demanda disponibles</div>
              )}
            </div>
          )}

          {vista === 'stock' && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Predicción de quiebre de stock</h2>
              <p className="mb-4 text-sm text-slate-500">Basado en la velocidad de ventas de los últimos 30 días</p>
              {stockPred.length > 0 ? (
                <TableShell>
                  <thead className="bg-slate-50"><tr><Th>Producto</Th><Th>Stock actual</Th><Th>Ventas/día</Th><Th>Días para quiebre</Th><Th>Riesgo</Th><Th>Compra sugerida</Th></tr></thead>
                  <tbody>
                    {stockPred.map((p, i) => {
                      const cfg = riesgoConfig[p.riesgo] || riesgoConfig.bajo;
                      return (
                        <tr key={i} className="border-t border-slate-100">
                          <Td><strong>{p.producto}</strong></Td>
                          <Td>{p.stock_actual} uds</Td>
                          <Td>{p.ventas_dia} uds/día</Td>
                          <Td><strong className={cfg.color}>{p.dias_para_quiebre >= 999 ? '∞' : `${p.dias_para_quiebre} días`}</strong></Td>
                          <Td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></Td>
                          <Td>
                            {p.recomendacion_compra > 0 ? (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">+{p.recomendacion_compra} uds</span>
                            ) : (
                              <span className="text-slate-400">OK</span>
                            )}
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </TableShell>
              ) : (
                <div className="rounded-lg bg-slate-50 p-8 text-center text-slate-400">Sin productos para analizar</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const TableShell = ({ children }) => <div className="mt-4 overflow-x-auto"><table className="w-full border-collapse">{children}</table></div>;
const Th = ({ children }) => <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">{children}</th>;
const Td = ({ children }) => <td className="px-4 py-3 text-sm text-slate-700">{children}</td>;

export default Predicciones;
