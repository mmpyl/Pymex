export default function AuditoriaModule({ auditoria = [] }) {
  return (
    <table width='100%' cellPadding='8'>
      <thead><tr><th>Fecha</th><th>Admin</th><th>Acción</th><th>Entidad</th><th>ID</th></tr></thead>
      <tbody>
        {auditoria.map((a) => (
          <tr key={a.id}><td>{a.creado_en?.slice(0, 19).replace('T', ' ')}</td><td>{a.admin_usuario_id}</td><td>{a.accion}</td><td>{a.entidad}</td><td>{a.entidad_id || '-'}</td></tr>
        ))}
      </tbody>
    </table>
  );
}
