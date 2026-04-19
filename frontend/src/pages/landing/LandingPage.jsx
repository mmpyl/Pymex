import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{ padding: '56px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <section style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 44, margin: 0 }}>ERP SaaS para PYMES</h1>
        <p style={{ fontSize: 18, color: '#475569', maxWidth: 760, margin: '16px auto' }}>
          Controla ventas, inventario, gastos, reportes y predicciones con una plataforma moderna multiempresa.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/register" style={styles.primary}>Comenzar gratis</Link>
          <Link to="/login" style={styles.secondary}>Iniciar sesión</Link>
        </div>
      </section>

      <section style={styles.grid}>
        {['Dashboard en tiempo real', 'Facturación electrónica', 'Predicciones de demanda', 'Panel Super Admin'].map((item) => (
          <article key={item} style={styles.card}>
            <h3>{item}</h3>
            <p style={{ color: '#64748b' }}>Diseño SaaS moderno, responsive y enfocado en productividad empresarial.</p>
          </article>
        ))}
      </section>
    </div>
  );
};

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 },
  primary: { background: '#2563eb', color: '#fff', padding: '10px 18px', borderRadius: 10, textDecoration: 'none' },
  secondary: { background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: 10, textDecoration: 'none' }
};

export default LandingPage;
