export default function FeaturesModule({ features = [], onToggleEmpresaFeature }) {
  return (
    <div>
      <ul>{features.map((f) => <li key={f.id}>{f.nombre} ({f.codigo})</li>)}</ul>
      <p style={{ color: '#64748b' }}>Tip: usa override por empresa para activar/desactivar features premium.</p>
      {onToggleEmpresaFeature && <small>Overrides habilitados.</small>}
    </div>
  );
}
