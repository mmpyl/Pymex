export default function LimitesModule({ planes = [] }) {
  return (
    <div>
      {planes.map((p) => (
        <div key={p.id} style={{ marginBottom: 10 }}>
          <strong>{p.nombre}</strong>
          <ul>
            {(p.PlanLimits || []).map((l) => <li key={l.id}>{l.limite}: {l.valor}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}
