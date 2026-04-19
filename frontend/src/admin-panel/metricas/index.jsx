export default function MetricasModule({ dashboard = {} }) {
  return (
    <ul>
      <li>MRR: S/ {dashboard.mrr || 0}</li>
      <li>Nuevas suscripciones: {dashboard.nuevas_suscripciones || 0}</li>
      <li>Cancelaciones: {dashboard.cancelaciones || 0}</li>
      <li>Churn: {dashboard.churn_pct || 0}%</li>
    </ul>
  );
}
