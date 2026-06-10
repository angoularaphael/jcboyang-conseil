import type Stripe from "stripe";

export type PaymentStatus =
  | "complete"
  | "pending"
  | "processing"
  | "failed"
  | "canceled"
  | "expired"
  | "unpaid"
  | "unknown";

export function normalizeNotchpayStatus(status: unknown): PaymentStatus {
  const value = String(status ?? "").toLowerCase();
  if (value === "complete" || value === "completed" || value === "success" || value === "paid") {
    return "complete";
  }
  if (value === "pending") return "pending";
  if (value === "processing") return "processing";
  if (
    value === "failed" ||
    value === "failure" ||
    value === "refused" ||
    value === "declined" ||
    value === "rejected" ||
    value === "insufficient_funds" ||
    value === "insufficient funds"
  ) {
    return "failed";
  }
  if (value === "canceled" || value === "cancelled") return "canceled";
  if (value === "expired") return "expired";
  return "unknown";
}

/** Statuts d'enveloppe API NotchPay (≠ statut du paiement). */
export function isNotchpayApiWrapperStatus(status: unknown): boolean {
  const value = String(status ?? "").toLowerCase();
  return value === "ok" || value === "accepted" || value === "created";
}

export function normalizeStripePaymentStatus(status: unknown): PaymentStatus {
  const value = String(status ?? "").toLowerCase();
  if (value === "paid" || value === "no_payment_required") return "complete";
  if (value === "unpaid") return "unpaid";
  return "unknown";
}

export function getStripeFailureReason(session: Stripe.Checkout.Session): string | undefined {
  const pi = session.payment_intent;
  if (typeof pi !== "object" || !pi) return undefined;
  const err = pi.last_payment_error;
  if (!err) return undefined;
  if (err.decline_code === "insufficient_funds") return "insufficient funds";
  if (err.code === "card_declined") return err.message ?? "card declined";
  return err.message ?? undefined;
}

/** Statut réel d'une session Checkout Stripe (refus, expiration, annulation…). */
export function resolveStripeCheckoutStatus(session: Stripe.Checkout.Session): {
  status: PaymentStatus;
  reason?: string;
} {
  if (session.status === "expired") {
    return { status: "expired" };
  }
  if (session.status === "open") {
    return { status: "pending" };
  }

  const paid = normalizeStripePaymentStatus(session.payment_status);
  if (isSuccessfulPaymentStatus(paid)) {
    return { status: "complete" };
  }

  const reason = getStripeFailureReason(session);
  const pi = session.payment_intent;
  if (typeof pi === "object" && pi) {
    if (pi.status === "canceled") return { status: "canceled", reason };
    if (pi.status === "processing") return { status: "processing", reason };
    if (
      pi.status === "requires_payment_method" ||
      pi.status === "requires_action" ||
      pi.status === "requires_confirmation"
    ) {
      return { status: "failed", reason: reason ?? "Paiement refusé par la banque." };
    }
  }

  return { status: paid === "unpaid" ? "unpaid" : "failed", reason };
}

export function getNotchpayFailureReason(tx: Record<string, unknown>): string | undefined {
  const nestedError = tx.error as Record<string, unknown> | undefined;
  const lastError = tx.last_error as Record<string, unknown> | undefined;
  const raw =
    tx.failure_reason ??
    tx.failureReason ??
    tx.failure_message ??
    tx.decline_reason ??
    tx.reason ??
    tx.message ??
    nestedError?.message ??
    nestedError?.description ??
    lastError?.message;
  const text = String(raw ?? "").trim();
  return text || undefined;
}

const NOTCHPAY_FAILURE_STATUS =
  /failed|failure|refus|declin|reject|canceled|cancelled|expired|insufficient|unpaid|denied|échou|echou/;

function notchpayStatusCandidates(tx: Record<string, unknown>): string[] {
  const nestedError = tx.error as Record<string, unknown> | undefined;
  return [
    tx.payment_status,
    tx.paymentStatus,
    tx.status,
    tx.state,
    tx.authorization_status,
    tx.transaction_status,
    nestedError?.code,
    nestedError?.type,
  ]
    .map((value) => String(value ?? "").toLowerCase())
    .filter(Boolean);
}

/** Statut de cycle de vie NotchPay (champ `transaction.status`, pas l'enveloppe API `OK`). */
function isNotchpayLifecycleStatus(status: unknown): boolean {
  const value = String(status ?? "").toLowerCase();
  if (!value || isNotchpayApiWrapperStatus(value)) return false;
  return normalizeNotchpayStatus(value) !== "unknown";
}

function resolveLifecycleStatus(tx: Record<string, unknown>): PaymentStatus {
  const paymentStatusField = tx.payment_status ?? tx.paymentStatus;
  if (paymentStatusField != null) {
    return normalizeNotchpayStatus(paymentStatusField);
  }
  if (isNotchpayLifecycleStatus(tx.status)) {
    return normalizeNotchpayStatus(tx.status);
  }
  return "unknown";
}

/** Statut réel d'une transaction NotchPay (doc : `transaction.status === 'complete'`). */
export function resolveNotchpayPaymentStatus(tx: Record<string, unknown>): PaymentStatus {
  const reason = getNotchpayFailureReason(tx);

  if (tx.failed === true || tx.is_failed === true) {
    return "failed";
  }

  let status = resolveLifecycleStatus(tx);

  if (status === "unknown" && isNotchpayApiWrapperStatus(tx.status)) {
    if (tx.paid === true || tx.is_paid === true || tx.isPaid === true) {
      status = "complete";
    } else if (isTerminalNotchpayFailureReason(reason)) {
      return "failed";
    } else {
      return "unknown";
    }
  }

  if (isTerminalNotchpayFailureReason(reason)) {
    if (
      isSuccessfulPaymentStatus(status) ||
      status === "pending" ||
      status === "processing" ||
      status === "unknown"
    ) {
      return "failed";
    }
  }

  if (tx.paid === false || tx.is_paid === false || tx.isPaid === false) {
    if (isSuccessfulPaymentStatus(status)) return "failed";
  }

  if (
    (tx.paid === true || tx.is_paid === true || tx.isPaid === true) &&
    !isSuccessfulPaymentStatus(status) &&
    status !== "failed" &&
    status !== "canceled"
  ) {
    return "complete";
  }

  if (
    !isSuccessfulPaymentStatus(status) &&
    notchpayStatusCandidates(tx).some(
      (value) => NOTCHPAY_FAILURE_STATUS.test(value) && !isNotchpayApiWrapperStatus(value)
    )
  ) {
    return status === "unknown" ? "failed" : status;
  }

  return status;
}

export function getPaymentStatusMessage(
  provider: "notchpay" | "stripe",
  status: PaymentStatus,
  reason?: string
): string {
  const lowerReason = reason?.toLowerCase() ?? "";

  if (status === "complete") {
    return "Paiement confirmé.";
  }

  if (status === "pending" || status === "processing") {
    return provider === "notchpay"
      ? "Paiement en cours. Validez la demande sur votre téléphone ou attendez quelques instants."
      : "Paiement en cours de traitement.";
  }

  if (status === "failed" || status === "unpaid") {
    if (/insufficient|fonds|balance|solde/.test(lowerReason)) {
      return "Paiement refusé : fonds insuffisants. Aucun montant n'a été débité.";
    }
    if (/timeout|délai|delai|expir/.test(lowerReason)) {
      return "Délai dépassé : le paiement n'a pas été validé à temps.";
    }
    if (/cancel|annul|rejected|refus/.test(lowerReason)) {
      return "Paiement annulé. Aucun montant n'a été débité.";
    }
    if (reason) return reason;
    return "Le paiement a échoué. Aucun montant n'a été débité.";
  }

  if (status === "canceled") {
    return "Paiement annulé. Aucun montant n'a été débité.";
  }

  if (status === "expired") {
    return "Le délai de paiement a expiré. Veuillez relancer la réservation.";
  }

  return "Paiement non confirmé. Aucun montant n'a été débité.";
}

export function isSuccessfulPaymentStatus(status: PaymentStatus): boolean {
  return status === "complete";
}

export function isPendingPaymentStatus(status: PaymentStatus): boolean {
  return status === "pending" || status === "processing";
}

/** Échec définitif même si NotchPay renvoie encore `pending` (ex. fonds insuffisants). */
export function isTerminalNotchpayFailureReason(reason?: string): boolean {
  const lower = reason?.toLowerCase() ?? "";
  if (!lower) return false;
  return (
    /insufficient|fonds\s*insuff|solde\s*insuff/.test(lower) ||
    /\b(refus\w*|declin\w*|reject\w*|denied)\b/.test(lower) ||
    /\b(cancel\w*|annul\w*)\b/.test(lower) ||
    /\b(échou\w*|echou\w*)\b/.test(lower) ||
    /\b(fail\w*|failure)\b/.test(lower)
  );
}
