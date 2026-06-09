import Stripe from "stripe";
import {
  sendAdminReservationEmail,
  sendCustomerReservationEmail,
  sendInstallmentProgressEmail,
  type ReservationPayload,
} from "./email";
import {
  getInstallmentPaymentUrl,
  getInstallmentPlan,
  getNextInstallmentAmount,
  recordInstallmentPayment,
} from "./installment-plans";
import {
  getNotchpayFailureReason,
  getPaymentStatusMessage,
  isSuccessfulPaymentStatus,
  normalizeNotchpayStatus,
  normalizeStripePaymentStatus,
  type PaymentStatus,
} from "./payment-status";
import { getSupabase, isSupabaseConfigured, readServerEnv } from "./supabase";

export type FulfillResult = {
  ok: boolean;
  alreadyDone?: boolean;
  emailSent?: boolean;
  factureUrl?: string;
  error?: string;
  paymentStatus?: PaymentStatus;
  statusMessage?: string;
  installment?: {
    planId: string;
    paidCount: number;
    totalInstallments: number;
    complete: boolean;
    nextPaymentUrl?: string;
    nextInstallmentNumber?: number;
    nextInstallmentAmount?: number;
  };
};

const NOTCHPAY_BASE = "https://api.notchpay.co";
const SITE_ORIGIN = import.meta.env.SITE ?? "https://www.jcbo-conseil.com";

function buildFactureViewUrl(
  provider: "stripe" | "notchpay",
  id: string
): string {
  const param = provider === "stripe" ? "session_id" : "reference";
  return `${SITE_ORIGIN}/api/reservation/facture?provider=${provider}&${param}=${encodeURIComponent(id)}`;
}

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
    paymentProvider: "stripe",
    invoiceNumber: invoice?.number ?? undefined,
    invoicePdfUrl: invoice?.invoice_pdf ?? undefined,
    hostedInvoiceUrl: invoice?.hosted_invoice_url ?? undefined,
    factureViewUrl: buildFactureViewUrl("stripe", session.id),
    paidAt: session.created
      ? new Date(session.created * 1000).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : new Date().toLocaleDateString("fr-FR"),
  };
}

async function fetchNotchpayTransaction(
  reference: string
): Promise<Record<string, unknown> | null> {
  const notchPayKey = readServerEnv("NOTCHPAY_PUBLIC_KEY");
  if (!notchPayKey) return null;
  try {
    const res = await fetch(`${NOTCHPAY_BASE}/payments/${reference}`, {
      headers: { Authorization: notchPayKey },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.transaction ?? data.data ?? data) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getNotchpayPaymentStatus(tx: Record<string, unknown>): PaymentStatus {
  return normalizeNotchpayStatus(tx.status ?? tx.payment_status);
}

function rejectNotchpayPayment(
  tx: Record<string, unknown>
): FulfillResult {
  const paymentStatus = getNotchpayPaymentStatus(tx);
  const reason = getNotchpayFailureReason(tx);
  const statusMessage = getPaymentStatusMessage("notchpay", paymentStatus, reason);
  return { ok: false, paymentStatus, statusMessage, error: statusMessage };
}

function buildNotchpayPayload(
  tx: Record<string, unknown>,
  reference: string
): ReservationPayload | null {
  if (!isSuccessfulPaymentStatus(getNotchpayPaymentStatus(tx))) return null;

  const meta = (tx.metadata ?? {}) as Record<string, string>;
  if (meta.source && meta.source !== "vitrine") return null;

  const customer = (tx.customer ?? {}) as Record<string, string>;
  const amountXaf = Number(tx.amount ?? meta.amountXaf ?? 0);
  if (!amountXaf) return null;

  const invoiceNumber = `JCBO-${reference.replace(/[^a-zA-Z0-9]/g, "").slice(-12).toUpperCase()}`;

  return {
    customerName: meta.customerName ?? customer.name ?? "Client",
    customerEmail: meta.customerEmail ?? customer.email ?? "",
    customerPhone: meta.customerPhone ?? customer.phone ?? "",
    company: meta.customerCompany ?? "",
    sessionLabel: meta.sessionLabel ?? String(tx.description ?? "Réservation JCBO"),
    date: meta.desiredDate ?? "",
    message: meta.customerMessage ?? "",
    amount: amountXaf,
    currency: "xaf",
    stripeSessionId: reference,
    paymentProvider: "notchpay",
    invoiceNumber,
    factureViewUrl: buildFactureViewUrl("notchpay", reference),
    paidAt: new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
  };
}

/** Charge les données facture pour affichage en ligne (Stripe ou NotchPay). */
export async function getFacturePayload(
  provider: string,
  id: string
): Promise<ReservationPayload | null> {
  const trimmed = id.trim();
  if (!trimmed) return null;

  if (provider === "notchpay") {
    const tx = await fetchNotchpayTransaction(trimmed);
    return tx ? buildNotchpayPayload(tx, trimmed) : null;
  }

  if (provider === "stripe") {
    const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
    if (!stripeKey || stripeKey.includes("REMPLACER")) return null;
    try {
      const stripe = new Stripe(stripeKey);
      const session = await stripe.checkout.sessions.retrieve(trimmed, {
        expand: ["invoice"],
      });
      if (session.metadata?.source !== "vitrine" || session.payment_status !== "paid") {
        return null;
      }
      const invoice = await loadInvoice(stripe, session);
      return buildPayload(session, invoice);
    } catch {
      return null;
    }
  }

  return null;
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

  const paymentStatus = normalizeStripePaymentStatus(session.payment_status);
  if (!isSuccessfulPaymentStatus(paymentStatus)) {
    const statusMessage = getPaymentStatusMessage("stripe", paymentStatus);
    return { ok: false, paymentStatus, statusMessage, error: statusMessage };
  }

  if (await isAlreadyFulfilled(sessionId)) {
    return {
      ok: true,
      alreadyDone: true,
      emailSent: true,
      factureUrl: buildFactureViewUrl("stripe", sessionId),
    };
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

  return { ok: true, emailSent, factureUrl: payload.factureViewUrl };
}

async function isNotchpayAlreadyFulfilled(reference: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supa = getSupabase();
    const { data } = await supa
      .from("admin_notifications")
      .select("id")
      .eq("type", "paiement_vitrine_mobile")
      .filter("metadata->>reference", "eq", reference)
      .limit(1);
    return (data?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

async function saveNotchpayNotification(
  payload: ReservationPayload,
  reference: string,
  amountXaf: number
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supa = getSupabase();
  await supa.from("admin_notifications").insert({
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: "paiement_vitrine_mobile",
    titre: `Paiement Mobile Money — ${payload.sessionLabel}`,
    message:
      `${payload.customerName} (${payload.customerEmail}) a payé ${amountXaf} XAF ` +
      `via Mobile Money pour « ${payload.sessionLabel} ».`,
    metadata: {
      reference,
      amount: amountXaf,
      currency: "XAF",
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

async function isInstallmentReferenceHandled(planId: string, reference: string): Promise<boolean> {
  const plan = await getInstallmentPlan(planId);
  return !!plan?.paidReferences.includes(reference);
}

async function saveInstallmentPartialNotification(
  planId: string,
  reference: string,
  paidCount: number,
  totalInstallments: number,
  sessionLabel: string,
  customerName: string,
  customerEmail: string,
  amountXaf: number
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supa = getSupabase();
  await supa.from("admin_notifications").insert({
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: "paiement_vitrine_mobile",
    titre: `Échéance ${paidCount}/${totalInstallments} — ${sessionLabel}`,
    message:
      `${customerName} (${customerEmail}) a payé l'échéance ${paidCount}/${totalInstallments} ` +
      `(${amountXaf} XAF) pour « ${sessionLabel} ».`,
    metadata: { planId, reference, paidCount, totalInstallments, amountXaf, partial: true },
    lue: false,
  });
}

async function isPlanFullyFulfilled(planId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supa = getSupabase();
    const { data } = await supa
      .from("admin_notifications")
      .select("id")
      .eq("type", "paiement_vitrine_mobile")
      .filter("metadata->>planId", "eq", planId)
      .filter("metadata->>installmentComplete", "eq", "true")
      .limit(1);
    return (data?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

/** Confirme un paiement NotchPay, envoie e-mails et notifie l'admin (idempotent). */
export async function fulfillNotchpayReservation(reference: string): Promise<FulfillResult> {
  const notchPayKey = readServerEnv("NOTCHPAY_PUBLIC_KEY");
  if (!notchPayKey) {
    return { ok: false, error: "NotchPay non configuré" };
  }

  const tx = await fetchNotchpayTransaction(reference);
  if (!tx) {
    return {
      ok: false,
      paymentStatus: "unknown",
      statusMessage: "Paiement introuvable ou non encore enregistré.",
      error: "Paiement introuvable",
    };
  }

  const paymentStatus = getNotchpayPaymentStatus(tx);
  const meta = (tx.metadata ?? {}) as Record<string, string>;
  const planId = meta.planId?.trim();

  // ── Paiement en plusieurs échéances ──────────────────────────────
  if (planId) {
    const installmentNumber = Number(meta.installmentNumber ?? 0);
    const installmentTotal = Number(meta.installmentTotal ?? 0);
    const amountXaf = Number(tx.amount ?? meta.amountXaf ?? 0);

    if (await isInstallmentReferenceHandled(planId, reference)) {
      const plan = await getInstallmentPlan(planId);
      const paymentUrl = getInstallmentPaymentUrl(planId);
      return {
        ok: true,
        alreadyDone: true,
        emailSent: true,
        installment: plan
          ? {
              planId,
              paidCount: plan.paidCount,
              totalInstallments: plan.installmentAmounts.length,
              complete: plan.status === "complete",
              nextPaymentUrl: plan.status === "complete" ? undefined : paymentUrl,
              nextInstallmentNumber: plan.status === "complete" ? undefined : plan.paidCount + 1,
              nextInstallmentAmount: getNextInstallmentAmount(plan) ?? undefined,
            }
          : undefined,
      };
    }

    if (!isSuccessfulPaymentStatus(paymentStatus)) {
      return rejectNotchpayPayment(tx);
    }

    const updatedPlan = await recordInstallmentPayment(planId, reference, installmentNumber);
    if (!updatedPlan) {
      return { ok: false, error: "Impossible d'enregistrer l'échéance" };
    }

    const paymentUrl = getInstallmentPaymentUrl(planId);
    const nextAmount = getNextInstallmentAmount(updatedPlan);
    const installmentInfo = {
      planId,
      paidCount: updatedPlan.paidCount,
      totalInstallments: updatedPlan.installmentAmounts.length,
      complete: updatedPlan.status === "complete",
      nextPaymentUrl: updatedPlan.status === "complete" ? undefined : paymentUrl,
      nextInstallmentNumber:
        updatedPlan.status === "complete" ? undefined : updatedPlan.paidCount + 1,
      nextInstallmentAmount: nextAmount ?? undefined,
    };

    const emailRes = await sendInstallmentProgressEmail({
      customerName: meta.customerName ?? updatedPlan.customerName,
      customerEmail: meta.customerEmail ?? updatedPlan.customerEmail,
      sessionLabel: meta.sessionLabel ?? updatedPlan.sessionLabel,
      paidCount: updatedPlan.paidCount,
      totalInstallments: installmentTotal || updatedPlan.installmentAmounts.length,
      lastAmountXaf: amountXaf,
      nextAmountXaf: nextAmount ?? undefined,
      totalXaf: updatedPlan.totalXaf,
      nextPaymentUrl: paymentUrl,
      complete: updatedPlan.status === "complete",
    });

    try {
      await saveInstallmentPartialNotification(
        planId,
        reference,
        updatedPlan.paidCount,
        updatedPlan.installmentAmounts.length,
        updatedPlan.sessionLabel,
        updatedPlan.customerName,
        updatedPlan.customerEmail,
        amountXaf
      );
    } catch (err) {
      console.error("[fulfill notchpay] Notification échéance échouée :", err);
    }

    if (updatedPlan.status !== "complete") {
      return { ok: true, emailSent: emailRes.ok, installment: installmentInfo };
    }

    if (await isPlanFullyFulfilled(planId)) {
      return {
        ok: true,
        alreadyDone: true,
        emailSent: true,
        installment: { ...installmentInfo, complete: true },
      };
    }

    const totalXaf = updatedPlan.totalXaf;
    const fullPayload: ReservationPayload = {
      customerName: updatedPlan.customerName,
      customerEmail: updatedPlan.customerEmail,
      customerPhone: updatedPlan.customerPhone,
      company: updatedPlan.company,
      sessionLabel: updatedPlan.sessionLabel,
      date: updatedPlan.desiredDate,
      message: updatedPlan.customerMessage,
      amount: totalXaf,
      currency: "xaf",
      stripeSessionId: planId,
      paymentProvider: "notchpay",
      invoiceNumber: `JCBO-${planId.replace(/[^a-zA-Z0-9]/g, "").slice(-12).toUpperCase()}`,
      factureViewUrl: buildFactureViewUrl("notchpay", reference),
      paidAt: new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };

    let emailSent = emailRes.ok;
    try {
      const [adminRes, customerRes] = await Promise.all([
        sendAdminReservationEmail(fullPayload),
        sendCustomerReservationEmail(fullPayload),
      ]);
      emailSent = customerRes.ok;
      if (!customerRes.ok) {
        return { ok: false, error: customerRes.error ?? "Envoi facture échoué", installment: installmentInfo };
      }
      if (!adminRes.ok) console.error("[fulfill notchpay] E-mail admin :", adminRes.error);
    } catch (err) {
      console.error("[fulfill notchpay] Envoi facture finale échoué :", err);
      return { ok: false, error: "Envoi facture échoué", installment: installmentInfo };
    }

    if (isSupabaseConfigured()) {
      try {
        const supa = getSupabase();
        await supa.from("admin_notifications").insert({
          id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: "paiement_vitrine_mobile",
          titre: `Paiement complet (3 échéances) — ${updatedPlan.sessionLabel}`,
          message:
            `${updatedPlan.customerName} a terminé le paiement en ${updatedPlan.installmentAmounts.length} échéances ` +
            `(${totalXaf} XAF) pour « ${updatedPlan.sessionLabel} ».`,
          metadata: {
            planId,
            reference,
            installmentComplete: true,
            totalXaf,
            paidReferences: updatedPlan.paidReferences,
          },
          lue: false,
        });
      } catch (err) {
        console.error("[fulfill notchpay] Notification finale échouée :", err);
      }
    }

    return {
      ok: true,
      emailSent,
      factureUrl: fullPayload.factureViewUrl,
      installment: installmentInfo,
    };
  }

  // ── Paiement unique ──────────────────────────────────────────────
  const factureUrl = buildFactureViewUrl("notchpay", reference);

  if (await isNotchpayAlreadyFulfilled(reference)) {
    return { ok: true, alreadyDone: true, emailSent: true, factureUrl };
  }

  if (!isSuccessfulPaymentStatus(paymentStatus)) {
    return rejectNotchpayPayment(tx);
  }

  const payload = buildNotchpayPayload(tx, reference);
  if (!payload) return rejectNotchpayPayment(tx);

  const amountXaf = payload.amount;

  let emailSent = false;
  try {
    const [adminRes, customerRes] = await Promise.all([
      sendAdminReservationEmail(payload),
      sendCustomerReservationEmail(payload),
    ]);
    emailSent = customerRes.ok;
    if (!customerRes.ok) {
      return { ok: false, error: customerRes.error ?? "Envoi e-mail échoué" };
    }
    if (!adminRes.ok) console.error("[fulfill notchpay] E-mail admin :", adminRes.error);
  } catch (err) {
    console.error("[fulfill notchpay] Envoi e-mails échoué :", err);
    return { ok: false, error: "Envoi e-mail échoué" };
  }

  try {
    await saveNotchpayNotification(payload, reference, amountXaf);
  } catch (err) {
    console.error("[fulfill notchpay] Notification admin échouée :", err);
  }

  return { ok: true, emailSent, factureUrl: payload.factureViewUrl };
}
