/**
 * WebhookSignatureService - Servicio para verificación de firmas de webhooks
 * 
 * Este servicio se encarga de verificar la autenticidad de los eventos
 * recibidos desde proveedores de pago como Stripe.
 */

const crypto = require('crypto');

class WebhookSignatureService {
  /**
   * Verifica la firma de un webhook de Stripe
   * 
   * @param {string} payload - El payload raw del webhook
   * @param {string} signature - La firma proporcionada en el header stripe-signature
   * @param {string} secret - El secreto del webhook (STRIPE_WEBHOOK_SECRET)
   * @returns {boolean} - True si la firma es válida
   */
  verifyStripeSignature(payload, signature, secret) {
    // En desarrollo sin secret, permitir todos (solo para testing local)
    if (!secret) {
      console.warn('[WebhookSignatureService] No hay STRIPE_WEBHOOK_SECRET configurado. Aceptando evento sin verificar.');
      return true;
    }
    
    if (!signature) {
      console.warn('[WebhookSignatureService] Falta header stripe-signature');
      return false;
    }

    try {
      // Stripe envía la firma como: t=timestamp,v1=hash,v0=hash
      // Verificamos si el hash esperado está incluido en la firma
      const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      return signature.includes(expected);
    } catch (error) {
      console.error('[WebhookSignatureService] Error verificando firma:', error.message);
      return false;
    }
  }

  /**
   * Extrae el timestamp de una firma de Stripe
   * 
   * @param {string} signature - La firma del header stripe-signature
   * @returns {number|null} - Timestamp en segundos o null si no se puede extraer
   */
  extractTimestamp(signature) {
    if (!signature) return null;
    
    const match = signature.match(/t=(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Verifica si un timestamp está dentro de la ventana de tolerancia
   * 
   * @param {number} timestamp - Timestamp del evento
   * @param {number} toleranceSeconds - Ventana de tolerancia en segundos (default: 300 = 5 min)
   * @returns {boolean} - True si está dentro de la ventana
   */
  isWithinTolerance(timestamp, toleranceSeconds = 300) {
    if (!timestamp) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const age = now - timestamp;
    
    return age >= 0 && age <= toleranceSeconds;
  }
}

module.exports = new WebhookSignatureService();
