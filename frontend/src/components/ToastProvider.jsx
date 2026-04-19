import { Toaster } from 'react-hot-toast';

/**
 * Componente de notificaciones globales configurado con mejores prácticas
 */
const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #10b981',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #ef4444',
          },
        },
        loading: {
          style: {
            background: '#eff6ff',
            color: '#1e40af',
            border: '1px solid #3b82f6',
          },
        },
      }}
    />
  );
};

export default ToastProvider;
