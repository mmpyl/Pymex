export default function UsuariosModule({ usuarios = [], onActualizar }) {
  return (
    <table width='100%' cellPadding='8'>
      <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>
        {usuarios.map((u) => (
          <tr key={u.id}>
            <td>{u.id}</td><td>{u.nombre}</td><td>{u.email}</td><td>{u.rol_id}</td><td>{u.estado}</td>
            <td>
              <button onClick={() => onActualizar(u.id, { estado: 'activo' })}>Activar</button>{' '}
              <button onClick={() => onActualizar(u.id, { estado: 'bloqueado' })}>Bloquear</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
