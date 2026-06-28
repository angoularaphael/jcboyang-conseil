import { bankDetails } from "../data/bank-details";
import { getContactEmail, getFromEmail, getNotifyEmail, getReplyToEmail } from "./email-config";
import { createSmtpTransport, isSmtpConfigured } from "./smtp";

export type VirementPayload = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company: string;
  sessionLabel: string;
  date: string;
  message: string;
  amount: number;
  currency: string;
  reference: string;
};

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
  factureViewUrl?: string;
  paymentProvider?: "stripe" | "notchpay";
  paidAt?: string;
};

export function formatReservationMoney(amount: number, currency: string): string {
  const cur = currency.toLowerCase();
  if (cur === "xaf") {
    return `${Math.round(amount).toLocaleString("fr-FR")} FCFA`;
  }
  return `${amount.toFixed(2)} ${cur.toUpperCase()}`;
}

function formatMoney(amount: number, currency: string): string {
  return formatReservationMoney(amount, currency);
}

function paymentMethodLabel(provider?: ReservationPayload["paymentProvider"]): string {
  if (provider === "notchpay") return "Mobile Money (NotchPay)";
  return "Carte bancaire (Stripe)";
}

export function buildFactureHtml(payload: ReservationPayload): string {
  const ttc = payload.amount;
  const ht = ttc / 1.2;
  const tva = ttc - ht;
  const ref =
    payload.invoiceNumber ??
    (payload.paymentProvider === "notchpay"
      ? `JCBO-${payload.stripeSessionId.replace(/[^a-zA-Z0-9]/g, "").slice(-12).toUpperCase()}`
      : `JCBO-${payload.stripeSessionId.replace(/^cs_(test_)?/, "").slice(0, 12).toUpperCase()}`);
  const paidAt = payload.paidAt ?? new Date().toLocaleDateString("fr-FR");
  const viewUrl = payload.hostedInvoiceUrl ?? payload.factureViewUrl;

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
          <tr><td align="right" style="padding:4px 0;font-size:12px;color:#6b7280;">Mode de paiement</td><td align="right" style="padding:4px 0;font-size:12px;color:#374151;width:120px;">${paymentMethodLabel(payload.paymentProvider)}</td></tr>
        </table>
        <p style="margin:0 0 8px;font-size:13px;color:#374151;">Bonjour <strong>${payload.customerName}</strong>,</p>
        <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
          Merci pour votre confiance. Votre paiement a bien été enregistré.
          ${payload.date ? ` Date souhaitée pour la séance : <strong>${payload.date}</strong>.` : ""}
          Notre équipe vous recontactera très rapidement pour planifier votre séance.
        </p>
        ${
          viewUrl
            ? `<p style="margin:0 0 20px;"><a href="${viewUrl}" style="display:inline-block;background:#d4a762;color:#0b1f3a;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:13px;">${payload.hostedInvoiceUrl ? "Télécharger la facture PDF" : "Voir ma facture en ligne"}</a></p>`
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
          Un visiteur du site vitrine vient de confirmer un paiement (${paymentMethodLabel(payload.paymentProvider)}) pour une séance.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(212,167,98,0.06);border-radius:12px;border:1px solid rgba(212,167,98,0.2);margin-bottom:28px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:0.2em;color:#d4a762;text-transform:uppercase;">Détails de la réservation</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;width:42%;">Prestation</td><td style="padding:5px 0;font-size:13px;font-weight:600;color:#0b1f3a;">${payload.sessionLabel}</td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">Montant payé</td><td style="padding:5px 0;font-size:14px;font-weight:700;color:#16a34a;">${formatReservationMoney(payload.amount, payload.currency)}</td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">Client</td><td style="padding:5px 0;font-size:13px;font-weight:600;color:#0b1f3a;">${payload.customerName}</td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">E-mail</td><td style="padding:5px 0;font-size:13px;color:#0b1f3a;">${payload.customerEmail}</td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">Téléphone</td><td style="padding:5px 0;font-size:13px;color:#0b1f3a;">${payload.customerPhone || "—"}</td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">Entreprise</td><td style="padding:5px 0;font-size:13px;color:#0b1f3a;">${payload.company || "—"}</td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">Date souhaitée</td><td style="padding:5px 0;font-size:13px;color:#0b1f3a;">${payload.date || "À convenir"}</td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">Réf. paiement</td><td style="padding:5px 0;font-size:11px;font-family:monospace;color:#9ca3af;">${payload.stripeSessionId}</td></tr>
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
      subject: `[JCBO] Paiement reçu — ${payload.sessionLabel} (${formatReservationMoney(payload.amount, payload.currency)})`,
      html,
      replyTo: payload.customerEmail,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur d'envoi email" };
  }
}

function buildVirementHtml(payload: VirementPayload): string {
  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f8f6f2;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f2;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(212,167,98,0.25);max-width:600px;">
      <tr><td style="background:linear-gradient(135deg,#0b1f3a 0%,#162d4f 100%);padding:28px 36px;">
        <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.2em;color:rgba(212,167,98,0.8);text-transform:uppercase;">JCBO Conseil</p>
        <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;">Instructions de virement</h1>
        <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Référence : ${payload.reference}</p>
      </td></tr>
      <tr><td style="padding:32px 36px;">
        <p style="margin:0 0 16px;font-size:14px;color:#374151;">Bonjour <strong>${payload.customerName}</strong>,</p>
        <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
          Merci pour votre réservation « <strong>${payload.sessionLabel}</strong> ».
          Pour confirmer définitivement votre séance, effectuez un virement de
          <strong style="color:#0b1f3a;">${formatReservationMoney(payload.amount, payload.currency)}</strong>
          en indiquant impérativement la référence ci-dessous.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(212,167,98,0.08);border-radius:12px;border:1px solid rgba(212,167,98,0.25);margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:0.15em;color:#d4a762;text-transform:uppercase;">Référence à indiquer</p>
            <p style="margin:0;font-size:18px;font-weight:700;color:#0b1f3a;font-family:monospace;">${payload.reference}</p>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr><td style="padding:6px 0;font-size:13px;color:#6b7280;width:38%;">Titulaire</td><td style="padding:6px 0;font-size:13px;color:#0b1f3a;font-weight:600;">${bankDetails.holder}</td></tr>
          <tr><td style="padding:6px 0;font-size:13px;color:#6b7280;">IBAN</td><td style="padding:6px 0;font-size:13px;color:#0b1f3a;font-family:monospace;">${bankDetails.iban}</td></tr>
          <tr><td style="padding:6px 0;font-size:13px;color:#6b7280;">BIC / SWIFT</td><td style="padding:6px 0;font-size:13px;color:#0b1f3a;font-family:monospace;">${bankDetails.bic}</td></tr>
          <tr><td style="padding:6px 0;font-size:13px;color:#6b7280;">Banque</td><td style="padding:6px 0;font-size:13px;color:#0b1f3a;">${bankDetails.bankName}</td></tr>
        </table>
        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
          Dès réception du virement, notre équipe vous recontactera pour planifier votre séance.
          ${payload.date ? ` Date souhaitée : ${payload.date}.` : ""}
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function sendAdminVirementEmail(
  payload: VirementPayload
): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) return { ok: false, error: "SMTP non configuré" };

  const html = `<!DOCTYPE html><html lang="fr"><body style="font-family:Georgia,serif;padding:24px;color:#374151;">
    <h2 style="color:#0b1f3a;">Nouvelle réservation par virement</h2>
    <p><strong>${payload.customerName}</strong> (${payload.customerEmail}) a réservé « ${payload.sessionLabel} » par virement.</p>
    <ul>
      <li>Montant : <strong>${formatReservationMoney(payload.amount, payload.currency)}</strong></li>
      <li>Référence : <code>${payload.reference}</code></li>
      <li>Téléphone : ${payload.customerPhone || "—"}</li>
      <li>Entreprise : ${payload.company || "—"}</li>
      <li>Date souhaitée : ${payload.date || "À convenir"}</li>
    </ul>
    ${payload.message ? `<p><strong>Message :</strong> ${payload.message}</p>` : ""}
  </body></html>`;

  try {
    await createTransport().sendMail({
      from: getFromEmail(),
      replyTo: payload.customerEmail,
      to: getNotifyEmail(),
      subject: `[JCBO] Virement en attente — ${payload.sessionLabel} (${payload.reference})`,
      html,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur" };
  }
}

export async function sendCustomerVirementEmail(
  payload: VirementPayload
): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) return { ok: false, error: "SMTP non configuré" };
  if (!payload.customerEmail) return { ok: false, error: "E-mail client manquant" };

  try {
    await createTransport().sendMail({
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      to: payload.customerEmail,
      subject: `Virement — ${payload.sessionLabel} — JCBO Conseil`,
      html: buildVirementHtml(payload),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur" };
  }
}

export type InstallmentEmailPayload = {
  customerName: string;
  customerEmail: string;
  sessionLabel: string;
  paidCount: number;
  totalInstallments: number;
  lastAmountXaf: number;
  nextAmountXaf?: number;
  totalXaf: number;
  nextPaymentUrl: string;
  complete: boolean;
};

function buildInstallmentHtml(payload: InstallmentEmailPayload): string {
  const lastFormatted = formatReservationMoney(payload.lastAmountXaf, "xaf");
  const totalFormatted = formatReservationMoney(payload.totalXaf, "xaf");
  const progress = `${payload.paidCount} / ${payload.totalInstallments}`;

  const nextBlock = payload.complete
    ? `<p style="margin:0 0 20px;font-size:14px;color:#16a34a;font-weight:600;">
         Toutes vos échéances sont réglées. Votre réservation est confirmée et la facture complète vous sera envoyée séparément.
       </p>`
    : `<p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.7;">
         Prochaine étape : régler l'<strong>échéance ${payload.paidCount + 1} sur ${payload.totalInstallments}</strong>
         (${payload.nextAmountXaf ? formatReservationMoney(payload.nextAmountXaf, "xaf") : "voir lien ci-dessous"}).
       </p>
       <p style="margin:0 0 20px;">
         <a href="${payload.nextPaymentUrl}" style="display:inline-block;background:#d4a762;color:#0b1f3a;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:13px;">
           Payer l'échéance ${payload.paidCount + 1}
         </a>
       </p>`;

  return `<!DOCTYPE html>
<html lang="fr"><body style="margin:0;padding:0;background:#f8f6f2;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f2;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid rgba(212,167,98,0.25);max-width:560px;">
<tr><td style="background:linear-gradient(135deg,#0b1f3a,#162d4f);padding:28px 32px;">
<p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.2em;color:rgba(212,167,98,0.8);text-transform:uppercase;">JCBO Conseil</p>
<h1 style="margin:8px 0 0;font-size:20px;color:#fff;">Paiement en plusieurs fois</h1>
</td></tr>
<tr><td style="padding:32px;">
<p style="margin:0 0 12px;font-size:14px;color:#374151;">Bonjour <strong>${payload.customerName}</strong>,</p>
<p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.7;">
  Nous avons bien reçu votre échéance de <strong>${lastFormatted}</strong> pour « <strong>${payload.sessionLabel}</strong> ».
</p>
<p style="margin:0 0 20px;padding:14px 18px;background:rgba(212,167,98,0.1);border-radius:12px;font-size:14px;color:#0b1f3a;">
  Progression : <strong>${progress}</strong> échéance(s) payée(s) — total prestation : <strong>${totalFormatted}</strong>
</p>
${nextBlock}
<p style="margin:0;font-size:11px;color:#9ca3af;">Conservez cet e-mail pour retrouver le lien de paiement des prochaines échéances.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

export async function sendInstallmentProgressEmail(
  payload: InstallmentEmailPayload
): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) return { ok: false, error: "SMTP non configuré" };
  if (!payload.customerEmail) return { ok: false, error: "E-mail client manquant" };

  const subject = payload.complete
    ? `Paiement complet — ${payload.sessionLabel} — JCBO Conseil`
    : `Échéance ${payload.paidCount}/${payload.totalInstallments} reçue — ${payload.sessionLabel}`;

  try {
    await createTransport().sendMail({
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      to: payload.customerEmail,
      subject,
      html: buildInstallmentHtml(payload),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur" };
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

export type LeadFormPayload = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  need?: string;
  message?: string;
  source: "audit" | "contact";
  fields?: Record<string, string>;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildLeadDetailsHtml(payload: LeadFormPayload): string {
  const rows: [string, string][] = [
    ["Nom", payload.name],
    ["E-mail", payload.email],
    ["Téléphone", payload.phone],
    ["Entreprise", payload.company || "—"],
    ["Besoin", payload.need || "—"],
  ];
  if (payload.fields) {
    for (const [key, value] of Object.entries(payload.fields)) {
      if (!value.trim()) continue;
      rows.push([key, value]);
    }
  }
  return rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 0;font-size:13px;color:#6b7280;width:38%;">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 0;font-size:13px;color:#0b1f3a;">${escapeHtml(value)}</td></tr>`
    )
    .join("");
}

export async function sendLeadEmails(
  payload: LeadFormPayload
): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) return { ok: false, error: "SMTP non configuré" };

  const label = payload.source === "audit" ? "Demande d'audit gratuit" : "Formulaire de contact";
  const adminHtml = `<!DOCTYPE html><html lang="fr"><body style="font-family:Georgia,serif;padding:24px;color:#374151;">
    <h2 style="color:#0b1f3a;">${escapeHtml(label)}</h2>
    <table>${buildLeadDetailsHtml(payload)}</table>
    ${payload.message ? `<p style="margin-top:16px;"><strong>Message :</strong><br>${escapeHtml(payload.message).replace(/\n/g, "<br>")}</p>` : ""}
  </body></html>`;

  const customerHtml = `<!DOCTYPE html><html lang="fr"><body style="font-family:Georgia,serif;padding:24px;color:#374151;">
    <h2 style="color:#0b1f3a;">Merci ${escapeHtml(payload.name)}</h2>
    <p>Nous avons bien reçu votre demande. L'équipe JCBO Conseil vous recontactera sous 24 h ouvrées.</p>
    <p style="color:#6b7280;font-size:14px;">JCBO Conseil — ${getContactEmail()}</p>
  </body></html>`;

  try {
    await createTransport().sendMail({
      from: getFromEmail(),
      replyTo: payload.email,
      to: getNotifyEmail(),
      subject: `[JCBO] ${label} — ${payload.name}`,
      html: adminHtml,
    });
    await createTransport().sendMail({
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      to: payload.email,
      subject: `Demande reçue — JCBO Conseil`,
      html: customerHtml,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur d'envoi" };
  }
}
