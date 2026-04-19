// backend/src/services/emailService.js
// Servicio de emails transaccionales con Nodemailer.
// Configura las variables de entorno de EMAIL_* para activarlo.
// Si no están configuradas, los emails se loguean en consola (útil para desarrollo).

const nodemailer = require('nodemailer');

// ─── Configuración del transporter ───────────────────────────────────────────
const crearTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Sin configuración → modo "preview" (imprime en consola)
  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user, pass },
    tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' }
  });
};

const transporter = crearTransporter();
const FROM = process.env.EMAIL_FROM || '"SaPyme" <noreply@sapyme.pe>';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// ─── Helper interno ───────────────────────────────────────────────────────────
const enviar = async ({ to, subject, html }) => {
  if (!transporter) {
    // Modo desarrollo: muestra en consola
    console.log('\n── EMAIL (modo consola) ──────────────────');
    console.log(`Para:    ${to}`);
    console.log(`Asunto:  ${subject}`);
    console.log('─────────────────────────────────────────\n');
    return { previewed: true };
  }

  try {
    const info = await transporter.sendMail({ from: FROM, to, subject, html });
    console.log(`[email] Enviado a ${to} → ${info.messageId}`);
    return info;
  } catch (err) {
    // No falla el flujo principal si el email falla
    console.error(`[email] Error enviando a ${to}:`, err.message);
    return null;
  }
};

// ─── Plantilla base ───────────────────────────────────────────────────────────
const layout = (contenido) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SaPyme</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#4f46e5;padding:24px 32px;">
            <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">SaPyme</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;color:#374151;font-size:15px;line-height:1.7;">
            ${contenido}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              SaPyme — Plataforma para PYMES peruanas<br/>
              Si no esperabas este correo, puedes ignorarlo.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (texto, href) =>
  `<a href="${href}" style="display:inline-block;background:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-top:20px;">${texto}</a>`;

// ─── Emails de negocio ────────────────────────────────────────────────────────

/**
 * Email de bienvenida al registrar una nueva empresa.
 * Se llama desde authController.register()
 */
const emailBienvenida = async ({ nombre, email, empresa, trialDias, trialExpira }) => {
  const expiraStr = trialExpira
    ? new Date(trialExpira).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return enviar({
    to: email,
    subject: `¡Bienvenido a SaPyme, ${nombre}!`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:#1e1b4b;font-size:20px;">¡Hola, ${nombre}! 👋</h2>
      <p>Tu empresa <strong>${empresa}</strong> ya está registrada en SaPyme.</p>
      ${expiraStr ? `
        <div style="background:#eef2ff;border-radius:8px;padding:16px;margin:20px 0;border-left:4px solid #4f46e5;">
          <strong style="color:#4f46e5;">Trial gratuito activo — ${trialDias} días</strong><br/>
          <span style="font-size:14px;color:#475569;">Tu período de prueba vence el ${expiraStr}.</span>
        </div>` : ''}
      <p>Con SaPyme puedes gestionar:</p>
      <ul style="padding-left:20px;color:#374151;">
        <li>Ventas e inventario en tiempo real</li>
        <li>Facturación electrónica SUNAT</li>
        <li>Predicciones ML de ventas y stock</li>
        <li>Reportes PDF y Excel</li>
      </ul>
      ${btn('Ir a mi dashboard', `${APP_URL}/dashboard`)}
    `)
  });
};

/**
 * Aviso cuando el trial expira en N días.
 * Se llama desde un job programado (billingService o cron).
 */
const emailTrialExpirando = async ({ nombre, email, empresa, diasRestantes, planUrl }) => {
  const urgente = diasRestantes <= 3;
  return enviar({
    to: email,
    subject: urgente
      ? `⚠️ Tu trial de SaPyme vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`
      : `Tu período de prueba de SaPyme termina pronto`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:#1e1b4b;font-size:20px;">
        ${urgente ? '⚠️ ' : ''}Tu trial termina en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}
      </h2>
      <p>Hola <strong>${nombre}</strong>, tu período de prueba de <strong>${empresa}</strong> en SaPyme está por vencer.</p>
      <div style="background:${urgente ? '#fef2f2' : '#fefce8'};border-radius:8px;padding:16px;margin:20px 0;border-left:4px solid ${urgente ? '#ef4444' : '#f59e0b'};">
        <strong style="color:${urgente ? '#b91c1c' : '#92400e'};">
          Te quedan ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} de acceso completo
        </strong><br/>
        <span style="font-size:14px;color:#475569;">Elige un plan para seguir usando todas las funciones.</span>
      </div>
      ${btn('Ver planes disponibles', planUrl || `${APP_URL}/admin`)}
      <p style="margin-top:20px;font-size:13px;color:#9ca3af;">
        Si tienes preguntas, responde a este correo.
      </p>
    `)
  });
};

/**
 * Aviso de pago vencido (enviado al ejecutar runBillingCollection).
 */
const emailPagoVencido = async ({ nombre, email, empresa, monto, fechaVencimiento }) => {
  const fechaStr = new Date(fechaVencimiento).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
  return enviar({
    to: email,
    subject: `Pago vencido — tu cuenta de SaPyme ha sido suspendida`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:#b91c1c;font-size:20px;">Tu cuenta ha sido suspendida</h2>
      <p>Hola <strong>${nombre}</strong>, encontramos un pago pendiente de <strong>${empresa}</strong>:</p>
      <div style="background:#fef2f2;border-radius:8px;padding:16px;margin:20px 0;border-left:4px solid #ef4444;">
        <strong>Monto vencido: S/ ${Number(monto).toFixed(2)}</strong><br/>
        <span style="font-size:14px;color:#475569;">Fecha de vencimiento: ${fechaStr}</span>
      </div>
      <p>Tu acceso a SaPyme está <strong>temporalmente suspendido</strong> hasta regularizar el pago.</p>
      ${btn('Regularizar mi cuenta', `${APP_URL}/admin`)}
      <p style="margin-top:20px;font-size:13px;color:#9ca3af;">
        Si ya realizaste el pago, responde a este correo con el comprobante.
      </p>
    `)
  });
};

/**
 * Confirmación de pago registrado (manual o webhook).
 */
const emailPagoConfirmado = async ({ nombre, email, empresa, monto, periodo }) => {
  return enviar({
    to: email,
    subject: `✅ Pago confirmado — SaPyme ${periodo || ''}`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:#065f46;font-size:20px;">✅ Pago confirmado</h2>
      <p>Hola <strong>${nombre}</strong>, confirmamos el pago de <strong>${empresa}</strong>:</p>
      <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:20px 0;border-left:4px solid #10b981;">
        <strong>Monto: S/ ${Number(monto).toFixed(2)}</strong><br/>
        ${periodo ? `<span style="font-size:14px;color:#475569;">Período: ${periodo}</span>` : ''}
      </div>
      <p>Tu acceso completo a SaPyme está activo. ¡Gracias por tu confianza!</p>
      ${btn('Ir a mi dashboard', `${APP_URL}/dashboard`)}
    `)
  });
};

/**
 * Reporte de cobranza para el super admin.
 */
const emailReporteCobranza = async ({ adminEmail, vencidos, suspendidas, fecha }) => {
  return enviar({
    to: adminEmail,
    subject: `[SaPyme] Reporte cobranza — ${new Date(fecha).toLocaleDateString('es-PE')}`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:#1e1b4b;font-size:18px;">Reporte de cobranza automática</h2>
      <p>Se ejecutó el proceso de cobranza en SaPyme:</p>
      <table width="100%" style="border-collapse:collapse;margin:16px 0;">
        <tr style="background:#f8fafc;">
          <td style="padding:10px 14px;font-weight:600;border-bottom:1px solid #e5e7eb;">Pagos marcados como vencidos</td>
          <td style="padding:10px 14px;text-align:right;border-bottom:1px solid #e5e7eb;color:#b91c1c;font-weight:700;">${vencidos}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-weight:600;">Empresas suspendidas</td>
          <td style="padding:10px 14px;text-align:right;color:#b91c1c;font-weight:700;">${suspendidas}</td>
        </tr>
      </table>
      <p style="font-size:13px;color:#9ca3af;">Ejecutado: ${new Date(fecha).toLocaleString('es-PE')}</p>
      ${btn('Ver panel admin', `${APP_URL}/admin`)}
    `)
  });
};

module.exports = {
  emailBienvenida,
  emailTrialExpirando,
  emailPagoVencido,
  emailPagoConfirmado,
  emailReporteCobranza
};
