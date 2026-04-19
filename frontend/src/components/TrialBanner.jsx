// ═══════════════════════════════════════════════════════════════════════
// frontend/src/components/TrialBanner.jsx
// Banner que aparece en la parte superior cuando el usuario está en trial
// o cuando su empresa está suspendida.
// ═══════════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function TrialBanner() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    api.get('/auth/profile')
      .then(({ data }) => {
        const empresa = data.Empresa || data.empresa;
        if (!empresa) return;

        // Empresa suspendida
        if (empresa.estado === 'suspendido') {
          setInfo({ tipo: 'suspendido', empresa: empresa.nombre });
          return;
        }

        // Buscar suscripción trial activa
        api.get('/usuarios/trial-status').then(r => {
          if (r.data?.estado === 'trial' && r.data?.dias_restantes !== undefined) {
            setInfo({ tipo: 'trial', dias: r.data.dias_restantes });
          }
        }).catch(() => {});
      })
      .catch(() => {});
  }, []);

  if (!info) return null;

  if (info.tipo === 'suspendido') {
    return (
      <div style={{
        background: '#fef2f2', borderBottom: '1px solid #fecaca',
        padding: '10px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, fontSize: 14
      }}>
        <span style={{ color: '#b91c1c', fontWeight: 600 }}>
          🚫 Tu empresa está suspendida por mora. Contacta al soporte para regularizar tu cuenta.
        </span>
        <a href="mailto:soporte@sapyme.pe" style={{
          background: '#b91c1c', color: '#fff', padding: '6px 14px',
          borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 13,
          whiteSpace: 'nowrap'
        }}>Contactar soporte</a>
      </div>
    );
  }

  if (info.tipo === 'trial') {
    const urgente = info.dias <= 3;
    return (
      <div style={{
        background: urgente ? '#fef2f2' : '#fefce8',
        borderBottom: `1px solid ${urgente ? '#fecaca' : '#fde68a'}`,
        padding: '10px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, fontSize: 14
      }}>
        <span style={{ color: urgente ? '#b91c1c' : '#92400e', fontWeight: 500 }}>
          {urgente ? '⚠️' : '🕐'} Tu período de prueba vence en{' '}
          <strong>{info.dias} día{info.dias !== 1 ? 's' : ''}</strong>.
          {urgente ? ' ¡Elige un plan para no perder el acceso!' : ' Aprovecha todas las funciones.'}
        </span>
        <a href="/admin" style={{
          background: urgente ? '#b91c1c' : '#d97706', color: '#fff',
          padding: '6px 14px', borderRadius: 6, textDecoration: 'none',
          fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap'
        }}>Ver planes</a>
      </div>
    );
  }

  return null;
}
