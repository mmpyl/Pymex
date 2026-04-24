const TablaEntidad = ({ datos, columnas, onEditar, onEliminar }) => (
  <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
    <table className="w-full border-collapse">
      <thead className="bg-slate-50">
        <tr>
          {columnas.map((c) => <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-slate-700">{c}</th>)}
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {datos.map((item) => (
          <tr key={item.id} className="border-t border-slate-100">
            {columnas.map((c) => <td key={c} className="px-4 py-3 text-sm text-slate-700">{item[c.toLowerCase()] || '—'}</td>)}
            <td className="px-4 py-3 text-sm">
              <button onClick={() => onEditar(item)} className="mr-2 rounded-md bg-indigo-100 px-3 py-1 text-indigo-700">Editar</button>
              <button onClick={() => onEliminar(item.id)} className="rounded-md bg-red-100 px-3 py-1 text-red-700">Eliminar</button>
            </td>
          </tr>
        ))}
        {datos.length === 0 && (
          <tr>
            <td colSpan={columnas.length + 1} className="px-4 py-8 text-center text-sm text-slate-400">No hay registros</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default TablaEntidad;
