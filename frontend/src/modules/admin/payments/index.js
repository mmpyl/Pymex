/**
 * Módulo de administración de pagos
 * 
 * Proporciona funcionalidades para visualizar y monitorear
 * los eventos de pagos recibidos desde Stripe.
 */

// API
export { default as paymentApi } from './api/paymentApi';

// Hooks
export { usePaymentEvents, usePaymentEvent } from './hooks/usePaymentEvents';

// Páginas
export { default as PaymentEventsPage } from './pages/PaymentEventsPage';

// Configuración del módulo
export const paymentsModuleConfig = {
  name: 'payments',
  label: 'Pagos',
  icon: 'credit-card',
  routes: [
    {
      path: '/super-admin/payments/events',
      component: 'PaymentEventsPage',
      label: 'Eventos de Pagos',
      exact: true
    }
  ]
};

export default {
  paymentApi,
  hooks: {
    usePaymentEvents,
    usePaymentEvent
  },
  pages: {
    PaymentEventsPage
  },
  config: paymentsModuleConfig
};
