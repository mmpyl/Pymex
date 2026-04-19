export default function PagosModule({ pagos = [], onCheckout }) {
  return (
    <table width='100%' cellPadding='8'>
      <thead><tr><th>ID</th><th>Empresa</th><th>Monto</th><th>Estado</th><th>Vencimiento</th><th>Acciones</th></tr></thead>
      <tbody>
        {pagos.map((p) => (
          <tr key={p.id}>
            <td>{p.id}</td><td>{p.Empresa?.nombre}</td><td>{p.monto} {p.moneda}</td><td>{p.estado}</td><td>{p.fecha_vencimiento?.slice(0, 10)}</td>
            <td><button onClick={() => onCheckout(p.id)}>Checkout</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
