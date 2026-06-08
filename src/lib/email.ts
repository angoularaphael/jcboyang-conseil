import { getContactEmail, getFromEmail, getNotifyEmail, getReplyToEmail } from "./email-config";
import { createSmtpTransport, isSmtpConfigured } from "./smtp";

function createTransport() {
  return createSmtpTransport();
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
  invoiceNumber?: string;
  invoicePdfUrl?: string;
  hostedInvoiceUrl?: string;
  paidAt?: string;
};

function formatMoney(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
}

function buildFactureHtml(payload: ReservationPayload): string {
  const ttc = payload.amount;
  const ht = ttc / 1.2;
  const tva = ttc - ht;
  const ref =
    payload.invoiceNumber ??
    `JCBO-${payload.stripeSessionId.replace(/^cs_(test_)?/, "").slice(0, 12).toUpperCase()}`;
  const paidAt = payload.paidAt ?? new Date().toLocaleDateString("fr-FR");

  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f8f6f2;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f2;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(212,167,98,0.25);max-width:600px;">
      <tr><td style="background:linear-gradient(135deg,#0b1f3a 0%,#162d4f 100%);padding:28px 36px;">
        <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.2em;color:rgba(212,167,98,0.8);text-transform:uppercase;">JCBO Conseil</p>
        <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;">Facture</h1>
        <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">N° ${ref} — ${paidAt}</p>
      </td></tr>
      <tr><td style="padding:32px 36px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="vertical-align:top;width:50%;padding-right:12px;">
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.15em;color:#d4a762;text-transform:uppercase;">Émetteur</p>
              <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
                <strong>JCBO Conseil</strong><br/>
                Jean-Christophe BOYANG-TSANG<br/>
                87 Rue Achille Viadieu<br/>
                31400 Toulouse, France<br/>
                contact@jcbo-conseil.com
              </p>
            </td>
            <td style="vertical-align:top;width:50%;padding-left:12px;">
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.15em;color:#d4a762;text-transform:uppercase;">Client</p>
              <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
                <strong>${payload.customerName}</strong><br/>
                ${payload.company ? `${payload.company}<br/>` : ""}
                ${payload.customerEmail}<br/>
                ${payload.customerPhone || ""}
              </p>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
          <tr style="background:rgba(212,167,98,0.12);">
            <th align="left" style="padding:10px 12px;font-size:11px;color:#0b1f3a;text-transform:uppercase;">Prestation</th>
            <th align="right" style="padding:10px 12px;font-size:11px;color:#0b1f3a;text-transform:uppercase;">Montant HT</th>
          </tr>
          <tr>
            <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;color:#374151;">${payload.sessionLabel}</td>
            <td align="right" style="padding:12px;border-bottom:1px solid #eee;font-size:14px;color:#374151;">${formatMoney(ht, payload.currency)}</td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr><td align="right" style="padding:4px 0;font-size:13px;color:#6b7280;">TVA (20 %)</td><td align="right" style="padding:4px 0;font-size:13px;color:#374151;width:120px;">${formatMoney(tva, payload.currency)}</td></tr>
          <tr><td align="right" style="padding:4px 0;font-size:15px;font-weight:700;color:#0b1f3a;">Total TTC payé</td><td align="right" style="padding:4px 0;font-size:15px;font-weight:700;color:#16a34a;width:120px;">${formatMoney(ttc, payload.currency)}</td></tr>
        </table>
        <p style="margin:0 0 8px;font-size:13px;color:#374151;">Bonjour <strong>${payload.customerName}</strong>,</p>
        <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
          Merci pour votre confiance. Votre paiement a bien été enregistré.
          ${payload.date ? ` Date souhaitée pour la séance : <strong>${payload.date}</strong>.` : ""}
          Notre équipe vous recontactera très rapidement pour planifier votre séance.
        </p>
        ${
          payload.hostedInvoiceUrl
            ? `<p style="margin:0 0 20px;"><a href="${payload.hostedInvoiceUrl}" style="display:inline-block;background:#d4a762;color:#0b1f3a;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:13px;">Télécharger la facture PDF</a></p>`
            : ""
        }
        <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
          Référence paiement : <code style="font-family:monospace;">${payload.stripeSessionId}</code><br/>
          JCBO Conseil — ${getContactEmail()}
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

async function fetchInvoicePdfAttachment(
  pdfUrl: string,
  invoiceNumber: string
): Promise<{ filename: string; content: Buffer } | null> {
  try {
    const res = await fetch(pdfUrl);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      filename: `Facture-JCBO-${invoiceNumber.replace(/[^a-zA-Z0-9-]/g, "")}.pdf`,
      content: buf,
    };
  } catch {
    return null;
  }
}

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
  if (!payload.customerEmail) {
    return { ok: false, error: "E-mail client manquant" };
  }

  const html = buildFactureHtml(payload);
  const ref =
    payload.invoiceNumber ??
    payload.stripeSessionId.replace(/^cs_(test_)?/, "").slice(0, 12).toUpperCase();

  const attachments: { filename: string; content: Buffer }[] = [];
  if (payload.invoicePdfUrl) {
    const pdf = await fetchInvoicePdfAttachment(payload.invoicePdfUrl, ref);
    if (pdf) attachments.push(pdf);
  }

  try {
    await createTransport().sendMail({
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      to: payload.customerEmail,
      subject: `Facture — ${payload.sessionLabel} — JCBO Conseil`,
      html,
      attachments,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur" };
  }
}
