export default function SuscripcionesModule({ suscripciones = [] }) {
  return (
    <table width='100%' cellPadding='8'>
      <thead><tr><th>ID</th><th>Empresa</th><th>Plan</th><th>Estado</th><th>Inicio</th><th>Fin</th></tr></thead>
      <tbody>
        {suscripciones.map((s) => (
          <tr key={s.id}>
            <td>{s.id}</td><td>{s.Empresa?.nombre}</td><td>{s.Plan?.nombre}</td><td>{s.estado}</td>
            <td>{s.fecha_inicio?.slice(0, 10)}</td><td>{s.fecha_fin?.slice(0, 10) || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
