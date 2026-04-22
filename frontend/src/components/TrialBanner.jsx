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
      <div className="bg-red-50 border-b border-red-200 px-5 py-2.5 flex items-center justify-between gap-3 text-sm">
        <span className="text-red-800 font-semibold">
          🚫 Tu empresa está suspendida por mora. Contacta al soporte para regularizar tu cuenta.
        </span>
        <a href="mailto:soporte@sapyme.pe" className="bg-red-700 hover:bg-red-800 text-white px-3.5 py-1.5 rounded-md no-underline font-semibold text-xs whitespace-nowrap transition-colors">
          Contactar soporte
        </a>
      </div>
    );
  }

  if (info.tipo === 'trial') {
    const urgente = info.dias <= 3;
    return (
      <div className={`border-b px-5 py-2.5 flex items-center justify-between gap-3 text-sm ${urgente ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <span className={`font-medium ${urgente ? 'text-red-800' : 'text-yellow-800'}`}>
          {urgente ? '⚠️' : '🕐'} Tu período de prueba vence en{' '}
          <strong>{info.dias} día{info.dias !== 1 ? 's' : ''}</strong>.
          {urgente ? ' ¡Elige un plan para no perder el acceso!' : ' Aprovecha todas las funciones.'}
        </span>
        <a href="/admin" className={`px-3.5 py-1.5 rounded-md no-underline font-semibold text-xs whitespace-nowrap transition-colors ${urgente ? 'bg-red-700 hover:bg-red-800 text-white' : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}>
          Ver planes
        </a>
      </div>
    );
  }

  return null;
}
