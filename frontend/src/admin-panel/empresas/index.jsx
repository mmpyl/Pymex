export default function EmpresasModule({ empresas = [], rubros = [], onEstado, onAsignarRubros }) {
  return (
    <table width='100%' cellPadding='8'>
      <thead>
        <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Plan</th><th>Rubro(s)</th><th>Estado</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        {empresas.map((e) => {
          const rubroIds = new Set((e.Rubros || []).map((r) => String(r.id)));
          return (
            <tr key={e.id}>
              <td>{e.id}</td><td>{e.nombre}</td><td>{e.email}</td><td>{e.plan}</td>
              <td>{(e.Rubros || []).map((r) => r.nombre).join(', ') || 'Sin rubro'}</td>
              <td>{e.estado}</td>
              <td>
                <button onClick={() => onEstado(e.id, 'activo')}>Activar</button>{' '}
                <button onClick={() => onEstado(e.id, 'suspendido')}>Suspender</button>{' '}
                <select
                  multiple
                  value={[...rubroIds]}
                  onChange={(event) => {
                    const selected = Array.from(event.target.selectedOptions).map((opt) => Number(opt.value));
                    onAsignarRubros(e.id, selected);
                  }}
                >
                  {rubros.map((rubro) => <option key={rubro.id} value={rubro.id}>{rubro.nombre}</option>)}
                </select>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
