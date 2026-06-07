import nodemailer from "nodemailer";
import { getContactEmail, getFromEmail, getNotifyEmail, getReplyToEmail } from "./email-config";

function isSmtpConfigured(): boolean {
  return !!(
    import.meta.env.SMTP_HOST &&
    import.meta.env.SMTP_USER &&
    import.meta.env.SMTP_PASS
  );
}

function createTransport() {
  const port = Number(import.meta.env.SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host: import.meta.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: import.meta.env.SMTP_USER,
      pass: import.meta.env.SMTP_PASS,
    },
  });
}

export type ReservationPayload = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company: string;
  sessionLabel: string;
  date: string;
  message: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
};

export async function sendAdminReservationEmail(
  payload: ReservationPayload
): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    return { ok: false, error: "SMTP non configuré" };
  }

  const adminEmail = getNotifyEmail();
  const mail = { from: getFromEmail(), replyTo: getReplyToEmail() };

  const html = `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f8f6f2;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f2;padding:40px 20px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(212,167,98,0.2);max-width:560px;">
      <tr><td style="background:linear-gradient(135deg,#0b1f3a 0%,#162d4f 100%);padding:32px 40px;text-align:center;">
        <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.2em;color:rgba(212,167,98,0.7);text-transform:uppercase;">JCBO-CONSEIL — Paiement reçu</p>
        <h1 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#ffffff;">Nouvelle réservation payée</h1>
      </td></tr>
      <tr><td style="padding:36px 40px;">
        <p style="margin:0 0 16px;font-size:15px;color:#374151;">Bonjour,</p>
        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;">
          Un visiteur du site vitrine vient de confirmer un paiement sur Stripe pour une séance.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(212,167,98,0.06);border-radius:12px;border:1px solid rgba(212,167,98,0.2);margin-bottom:28px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:0.2em;color:#d4a762;text-transform:uppercase;">Détails de la réservation</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;width:42%;">Prestation</td><td style="padding:5px 0;font-size:13px;font-weight:600;color:#0b1f3a;">${payload.sessionLabel}</td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">Montant payé</td><td style="padding:5px 0;font-size:14px;font-weight:700;color:#16a34a;">${payload.amount.toFixed(2)} ${payload.currency.toUpperCase()}</td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">Client</td><td style="padding:5px 0;font-size:13px;font-weight:600;color:#0b1f3a;">${payload.customerName}</td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">E-mail</td><td style="padding:5px 0;font-size:13px;color:#0b1f3a;">${payload.customerEmail}</td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">Téléphone</td><td style="padding:5px 0;font-size:13px;color:#0b1f3a;">${payload.customerPhone || "—"}</td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">Entreprise</td><td style="padding:5px 0;font-size:13px;color:#0b1f3a;">${payload.company || "—"}</td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">Date souhaitée</td><td style="padding:5px 0;font-size:13px;color:#0b1f3a;">${payload.date || "À convenir"}</td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">Réf. Stripe</td><td style="padding:5px 0;font-size:11px;font-family:monospace;color:#9ca3af;">${payload.stripeSessionId}</td></tr>
            </table>
          </td></tr>
        </table>
        ${
          payload.message
            ? `<p style="margin:0 0 12px;font-size:12px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Message du client</p>
              <p style="margin:0 0 28px;padding:14px 16px;background:#f8f9fa;border-radius:10px;font-size:13px;color:#374151;line-height:1.6;">${payload.message}</p>`
            : ""
        }
        <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">Cette notification est aussi visible dans votre dashboard administrateur, onglet « Notifications ».</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  try {
    await createTransport().sendMail({
      ...mail,
      to: adminEmail,
      subject: `[JCBO] Paiement reçu — ${payload.sessionLabel} (${payload.amount.toFixed(2)} ${payload.currency.toUpperCase()})`,
      html,
      replyTo: payload.customerEmail,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur d'envoi email" };
  }
}

export async function sendCustomerReservationEmail(
  payload: ReservationPayload
): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    return { ok: false, error: "SMTP non configuré" };
  }
  const html = `<!DOCTYPE html><html lang="fr"><body style="font-family:Georgia,serif;padding:24px;color:#374151;">
    <p>Bonjour <strong>${payload.customerName}</strong>,</p>
    <p>Nous confirmons la réception de votre paiement pour la prestation suivante :</p>
    <p style="background:#f8f6f2;padding:16px;border-radius:8px;border:1px solid rgba(212,167,98,0.3);">
      <strong>${payload.sessionLabel}</strong><br/>
      Montant : <strong>${payload.amount.toFixed(2)} ${payload.currency.toUpperCase()}</strong><br/>
      Référence : <code>${payload.stripeSessionId}</code>
    </p>
    <p>Notre équipe vous recontactera très rapidement pour planifier votre séance.</p>
    <p style="color:#9ca3af;font-size:12px;">JCBO Conseil — ${getContactEmail()}</p>
  </body></html>`;
  try {
    await createTransport().sendMail({
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      to: payload.customerEmail,
      subject: `Confirmation de paiement — ${payload.sessionLabel}`,
      html,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur" };
  }
}
