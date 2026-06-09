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
  isNotchpayApiWrapperStatus,
  isPendingPaymentStatus,
  isSuccessfulPaymentStatus,
  isTerminalNotchpayFailureReason,
  normalizeNotchpayStatus,
  resolveStripeCheckoutStatus,
  type PaymentStatus,
} from "./payment-status";
import {
  buildNotchpayLookupKeys,
  extractPlanIdFromVitrineReference,
} from "./notchpay-reference";
import { getSupabase, isSupabaseConfigured, readServerEnv } from "./supabase";

export type FulfillResult = {
  ok: boolean;
  alreadyDone?: boolean;
  emailSent?: boolean;
  factureUrl?: string;
  error?: string;
  paymentStatus?: PaymentStatus;
  statusMessage?: string;
  /** Le client peut relancer la vérification (délai NotchPay). */
  retryable?: boolean;
  /** Déjà confirmé en base (webhook ou appel précédent). */
  fulfilled?: boolean;
  /** Statut NotchPay = complete mais e-mails pas encore envoyés. */
  needsFulfill?: boolean;
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

function parseNotchpayTransactionPayload(
  data: Record<string, unknown>
): Record<string, unknown> | null {
  const nested = data.transaction ?? data.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const tx = nested as Record<string, unknown>;
    if (
      tx.payment_status != null ||
      tx.paymentStatus != null ||
      tx.status != null ||
      tx.reference != null
    ) {
      return tx;
    }
  }

  if (data.reference && (data.payment_status != null || data.paymentStatus != null || data.amount != null)) {
    const status = String(data.status ?? "");
    const paymentStatus = data.payment_status ?? data.paymentStatus;
    if (isNotchpayApiWrapperStatus(status) && paymentStatus == null) {
      return null;
    }
    return data;
  }

  return null;
}

function resolveNotchpayReference(
  tx: Record<string, unknown> | null | undefined,
  fallback: string
): string {
  const fromTx = String(tx?.reference ?? "").trim();
  return fromTx || fallback;
}

function resolvePlanIdFromNotchpay(
  reference: string,
  canonicalRef: string,
  tx?: Record<string, unknown> | null
): string | null {
  const fromMeta = String(((tx?.metadata ?? {}) as Record<string, string>).planId ?? "").trim();
  return (
    extractPlanIdFromVitrineReference(reference) ??
    extractPlanIdFromVitrineReference(canonicalRef) ??
    (fromMeta || null)
  );
}

async function fetchNotchpayTransactionByKey(
  reference: string
): Promise<Record<string, unknown> | null> {
  const notchPayKey = readServerEnv("NOTCHPAY_PUBLIC_KEY");
  if (!notchPayKey) return null;
  try {
    const res = await fetch(
      `${NOTCHPAY_BASE}/payments/${encodeURIComponent(reference)}`,
      { headers: { Authorization: notchPayKey }, cache: "no-store" }
    );
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      if (res.status !== 404) {
        console.warn("[notchpay] retrieve", res.status, data.message ?? data);
      }
      return null;
    }
    return parseNotchpayTransactionPayload(data);
  } catch (err) {
    console.error("[notchpay] retrieve exception :", err);
    return null;
  }
}

/** Essaie la référence vitrine puis l'identifiant trx NotchPay (`trx.test_*`). */
async function fetchNotchpayTransaction(
  primaryReference: string,
  alternateReference?: string
): Promise<Record<string, unknown> | null> {
  for (const key of buildNotchpayLookupKeys(primaryReference, alternateReference)) {
    const tx = await fetchNotchpayTransactionByKey(key);
    if (tx) return tx;
  }
  return null;
}

async function buildInstallmentFulfillResult(
  planId: string,
  alreadyDone: boolean
): Promise<FulfillResult> {
  const plan = await getInstallmentPlan(planId);
  const paymentUrl = getInstallmentPaymentUrl(planId);
  if (!plan) {
    return { ok: true, alreadyDone, emailSent: alreadyDone, paymentStatus: "complete" };
  }
  return {
    ok: true,
    alreadyDone,
    emailSent: alreadyDone,
    paymentStatus: "complete",
    installment: {
      planId,
      paidCount: plan.paidCount,
      totalInstallments: plan.installmentAmounts.length,
      complete: plan.status === "complete",
      nextPaymentUrl: plan.status === "complete" ? undefined : paymentUrl,
      nextInstallmentNumber: plan.status === "complete" ? undefined : plan.paidCount + 1,
      nextInstallmentAmount: getNextInstallmentAmount(plan) ?? undefined,
    },
  };
}

async function resolveInstallmentFulfillIfPaid(
  planId: string,
  reference: string,
  tx?: Record<string, unknown> | null
): Promise<FulfillResult | null> {
  if (await isInstallmentReferenceHandled(planId, reference, tx)) {
    return { ...(await buildInstallmentFulfillResult(planId, true)), fulfilled: true };
  }

  const plan = await getInstallmentPlan(planId);
  if (!plan || !tx) return null;

  const meta = (tx.metadata ?? {}) as Record<string, string>;
  const installmentNumber = Number(meta.installmentNumber ?? 0);
  if (installmentNumber > 0 && installmentNumber <= plan.paidCount) {
    return { ...(await buildInstallmentFulfillResult(planId, true)), fulfilled: true };
  }

  return null;
}

/** Vérifie le statut réel côté API (utilisé par le webhook avant confirmation). */
export async function verifyNotchpayPaymentIsComplete(
  reference: string,
  alternateReference?: string
): Promise<{
  complete: boolean;
  reference: string;
  paymentStatus: PaymentStatus;
}> {
  const tx = await fetchNotchpayTransaction(reference, alternateReference);
  if (!tx) {
    return { complete: false, reference, paymentStatus: "pending" };
  }
  const canonicalRef = resolveNotchpayReference(tx, reference);
  const paymentStatus = getNotchpayPaymentStatus(tx);
  return {
    complete: isSuccessfulPaymentStatus(paymentStatus),
    reference: canonicalRef,
    paymentStatus,
  };
}

/** Vérification légère (sans e-mail) — utilisée par le polling client. */
export async function checkNotchpayPaymentStatus(
  reference: string,
  alternateReference?: string
): Promise<FulfillResult> {
  let tx = await fetchNotchpayTransaction(reference, alternateReference);
  const canonicalRef = resolveNotchpayReference(tx, reference);

  if (await isNotchpayAlreadyFulfilled(canonicalRef)) {
    return {
      ok: true,
      fulfilled: true,
      alreadyDone: true,
      emailSent: true,
      paymentStatus: "complete",
      factureUrl: buildFactureViewUrl("notchpay", canonicalRef),
    };
  }

  const planId = resolvePlanIdFromNotchpay(reference, canonicalRef, tx);
  if (planId) {
    const installmentResult = await resolveInstallmentFulfillIfPaid(planId, canonicalRef, tx);
    if (installmentResult) return installmentResult;
  }

  if (!tx) {
    return {
      ok: false,
      fulfilled: false,
      paymentStatus: "pending",
      statusMessage: "Validation Mobile Money en cours…",
      retryable: true,
    };
  }

  const paymentStatus = getNotchpayPaymentStatus(tx);
  if (!isSuccessfulPaymentStatus(paymentStatus)) {
    return { ...rejectNotchpayPayment(tx), fulfilled: false };
  }

  return {
    ok: true,
    fulfilled: false,
    needsFulfill: true,
    paymentStatus: "complete",
  };
}

function getNotchpayPaymentStatus(tx: Record<string, unknown>): PaymentStatus {
  const paymentStatusField = tx.payment_status ?? tx.paymentStatus;
  const raw = paymentStatusField ?? tx.status;
  if (isNotchpayApiWrapperStatus(raw) && paymentStatusField == null) {
    const reason = getNotchpayFailureReason(tx);
    if (isTerminalNotchpayFailureReason(reason)) return "failed";
    return "unknown";
  }
  return normalizeNotchpayStatus(raw);
}

function rejectNotchpayPayment(
  tx: Record<string, unknown>
): FulfillResult {
  const reason = getNotchpayFailureReason(tx);
  let paymentStatus = getNotchpayPaymentStatus(tx);
  if (isTerminalNotchpayFailureReason(reason) && isPendingPaymentStatus(paymentStatus)) {
    paymentStatus = "failed";
  }
  const statusMessage = getPaymentStatusMessage("notchpay", paymentStatus, reason);
  return {
    ok: false,
    paymentStatus,
    statusMessage,
    error: statusMessage,
    retryable: isPendingPaymentStatus(paymentStatus) && !isTerminalNotchpayFailureReason(reason),
  };
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
        expand: ["invoice", "payment_intent"],
      });
      if (session.metadata?.source !== "vitrine") return null;
      const { status } = resolveStripeCheckoutStatus(session);
      if (!isSuccessfulPaymentStatus(status)) return null;
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
      expand: ["invoice", "payment_intent"],
    });
  } catch {
    return {
      ok: false,
      paymentStatus: "unknown",
      statusMessage: "Session de paiement introuvable.",
      error: "Session Stripe introuvable",
    };
  }

  if (session.metadata?.source !== "vitrine") {
    return { ok: false, error: "Session non reconnue" };
  }

  const { status: paymentStatus, reason } = resolveStripeCheckoutStatus(session);
  if (!isSuccessfulPaymentStatus(paymentStatus)) {
    const statusMessage = getPaymentStatusMessage("stripe", paymentStatus, reason);
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

async function isInstallmentReferenceHandled(
  planId: string,
  reference: string,
  tx?: Record<string, unknown> | null
): Promise<boolean> {
  const plan = await getInstallmentPlan(planId);
  if (!plan) return false;
  const refs = new Set(plan.paidReferences);
  if (refs.has(reference)) return true;
  const fromTx = tx ? String(tx.reference ?? "").trim() : "";
  return !!fromTx && refs.has(fromTx);
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
export async function fulfillNotchpayReservation(
  reference: string,
  alternateReference?: string
): Promise<FulfillResult> {
  const notchPayKey = readServerEnv("NOTCHPAY_PUBLIC_KEY");
  if (!notchPayKey) {
    return { ok: false, error: "NotchPay non configuré" };
  }

  let tx = await fetchNotchpayTransaction(reference, alternateReference);
  if (!tx) {
    await sleep(600);
    tx = await fetchNotchpayTransaction(reference, alternateReference);
  }
  const canonicalRef = resolveNotchpayReference(tx, reference);
  const planIdFromRef = resolvePlanIdFromNotchpay(reference, canonicalRef, tx);

  if (await isNotchpayAlreadyFulfilled(canonicalRef)) {
    return {
      ok: true,
      fulfilled: true,
      alreadyDone: true,
      emailSent: true,
      factureUrl: buildFactureViewUrl("notchpay", canonicalRef),
    };
  }

  if (planIdFromRef) {
    const installmentResult = await resolveInstallmentFulfillIfPaid(
      planIdFromRef,
      canonicalRef,
      tx
    );
    if (installmentResult) return installmentResult;
  }

  if (!tx) {
    return {
      ok: false,
      paymentStatus: "pending",
      statusMessage: "Paiement en attente de confirmation NotchPay.",
      error: "Paiement en attente de confirmation",
      retryable: true,
    };
  }

  const paymentStatus = getNotchpayPaymentStatus(tx);
  if (!isSuccessfulPaymentStatus(paymentStatus)) {
    return rejectNotchpayPayment(tx);
  }

  const meta = (tx.metadata ?? {}) as Record<string, string>;
  const planId = meta.planId?.trim() || planIdFromRef || "";

  // ── Paiement en plusieurs échéances ──────────────────────────────
  if (planId) {
    const installmentNumber = Number(meta.installmentNumber ?? 0);
    const installmentTotal = Number(meta.installmentTotal ?? 0);
    const amountXaf = Number(tx.amount ?? meta.amountXaf ?? 0);

    if (await isInstallmentReferenceHandled(planId, canonicalRef, tx)) {
      return { ...(await buildInstallmentFulfillResult(planId, true)), fulfilled: true };
    }

    const currentPlan = await getInstallmentPlan(planId);
    if (!currentPlan) {
      return { ok: false, error: "Plan de paiement introuvable." };
    }
    if (installmentNumber > 0 && installmentNumber <= currentPlan.paidCount) {
      return { ...(await buildInstallmentFulfillResult(planId, true)), fulfilled: true };
    }
    if (installmentNumber !== currentPlan.paidCount + 1) {
      return {
        ok: false,
        paymentStatus: "failed",
        statusMessage: "Cette échéance ne correspond pas à l'étape attendue du plan.",
        error: "Échéance invalide",
      };
    }

    const updatedPlan = await recordInstallmentPayment(planId, canonicalRef, installmentNumber);
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
        canonicalRef,
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
      return {
        ok: true,
        fulfilled: true,
        emailSent: emailRes.ok,
        paymentStatus: "complete",
        installment: installmentInfo,
      };
    }

    if (await isPlanFullyFulfilled(planId)) {
      return {
        ok: true,
        fulfilled: true,
        alreadyDone: true,
        emailSent: true,
        paymentStatus: "complete",
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
      factureViewUrl: buildFactureViewUrl("notchpay", canonicalRef),
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
            reference: canonicalRef,
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
      fulfilled: true,
      emailSent,
      paymentStatus: "complete",
      factureUrl: fullPayload.factureViewUrl,
      installment: installmentInfo,
    };
  }

  // ── Paiement unique ──────────────────────────────────────────────
  const factureUrl = buildFactureViewUrl("notchpay", canonicalRef);

  const payload = buildNotchpayPayload(tx, canonicalRef);
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
    await saveNotchpayNotification(payload, canonicalRef, amountXaf);
  } catch (err) {
    console.error("[fulfill notchpay] Notification admin échouée :", err);
  }

  return {
    ok: true,
    fulfilled: true,
    emailSent,
    paymentStatus: "complete",
    factureUrl: payload.factureViewUrl,
  };
}
