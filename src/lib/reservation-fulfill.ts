import Stripe from "stripe";
import {
  sendAdminReservationEmail,
  sendCustomerReservationEmail,
  type ReservationPayload,
} from "./email";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export type FulfillResult = {
  ok: boolean;
  alreadyDone?: boolean;
  emailSent?: boolean;
  error?: string;
};

function buildPayload(
  session: Stripe.Checkout.Session,
  invoice?: Stripe.Invoice | null
): ReservationPayload {
  const meta = session.metadata ?? {};
  const amount = (session.amount_total ?? 0) / 100;
  const currency = session.currency ?? "eur";

  return {
    customerName: meta.customerName ?? "Client",
    customerEmail: session.customer_email ?? meta.customerEmail ?? "",
    customerPhone: meta.customerPhone ?? "",
    company: meta.customerCompany ?? "",
    sessionLabel: meta.sessionLabel ?? "Réservation",
    date: meta.desiredDate ?? "",
    message: meta.customerMessage ?? "",
    amount,
    currency,
    stripeSessionId: session.id,
    invoiceNumber: invoice?.number ?? undefined,
    invoicePdfUrl: invoice?.invoice_pdf ?? undefined,
    hostedInvoiceUrl: invoice?.hosted_invoice_url ?? undefined,
    paidAt: session.created
      ? new Date(session.created * 1000).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : new Date().toLocaleDateString("fr-FR"),
  };
}

async function isAlreadyFulfilled(stripeSessionId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supa = getSupabase();
    const { data } = await supa
      .from("admin_notifications")
      .select("id")
      .eq("type", "paiement_vitrine")
      .filter("metadata->>stripeSessionId", "eq", stripeSessionId)
      .limit(1);
    return (data?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

async function saveNotification(payload: ReservationPayload): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supa = getSupabase();
  await supa.from("admin_notifications").insert({
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: "paiement_vitrine",
    titre: `Paiement reçu — ${payload.sessionLabel}`,
    message:
      `${payload.customerName} (${payload.customerEmail}) a payé ${payload.amount.toFixed(2)} ` +
      `${payload.currency.toUpperCase()} pour « ${payload.sessionLabel} ».`,
    metadata: {
      stripeSessionId: payload.stripeSessionId,
      invoiceNumber: payload.invoiceNumber,
      amount: payload.amount,
      currency: payload.currency,
      customer: {
        name: payload.customerName,
        email: payload.customerEmail,
        phone: payload.customerPhone,
        company: payload.company,
      },
      sessionLabel: payload.sessionLabel,
      desiredDate: payload.date,
      message: payload.message,
    },
    lue: false,
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getInvoiceId(session: Stripe.Checkout.Session): string | null {
  if (typeof session.invoice === "string") return session.invoice;
  if (session.invoice?.id) return session.invoice.id;
  return null;
}

/** Attend que Stripe finalise la facture (PDF parfois indisponible au 1er appel, surtout en test). */
async function loadInvoice(
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<Stripe.Invoice | null> {
  const invoiceId = getInvoiceId(session);
  if (!invoiceId) return null;

  const maxAttempts = 6;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);
      if (invoice.invoice_pdf || invoice.hosted_invoice_url || attempt === maxAttempts - 1) {
        return invoice;
      }
    } catch {
      if (attempt === maxAttempts - 1) return null;
    }
    await sleep(1500);
  }
  return null;
}

/** Confirme le paiement, enregistre la notif admin et envoie e-mails + facture (idempotent). */
export async function fulfillReservation(
  stripe: Stripe,
  sessionId: string
): Promise<FulfillResult> {
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["invoice"],
    });
  } catch {
    return { ok: false, error: "Session Stripe introuvable" };
  }

  if (session.metadata?.source !== "vitrine") {
    return { ok: false, error: "Session non reconnue" };
  }

  if (session.payment_status !== "paid") {
    return { ok: false, error: "Paiement non confirmé" };
  }

  if (await isAlreadyFulfilled(sessionId)) {
    return { ok: true, alreadyDone: true, emailSent: true };
  }

  const invoice = await loadInvoice(stripe, session);
  const payload = buildPayload(session, invoice);

  let emailSent = false;
  try {
    const [adminRes, customerRes] = await Promise.all([
      sendAdminReservationEmail(payload),
      sendCustomerReservationEmail(payload),
    ]);
    emailSent = customerRes.ok;
    if (!adminRes.ok) console.error("[fulfill] E-mail admin :", adminRes.error);
    if (!customerRes.ok) {
      console.error("[fulfill] E-mail client / facture :", customerRes.error);
      return { ok: false, error: customerRes.error ?? "Envoi de la facture échoué" };
    }
  } catch (err) {
    console.error("[fulfill] Envoi e-mails échoué :", err);
    return { ok: false, error: "Envoi de la facture échoué" };
  }

  try {
    await saveNotification(payload);
  } catch (err) {
    console.error("[fulfill] Notification admin échouée :", err);
  }

  return { ok: true, emailSent };
}
