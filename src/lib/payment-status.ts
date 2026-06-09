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
  if (value === "complete" || value === "completed" || value === "success") return "complete";
  if (value === "pending") return "pending";
  if (value === "processing") return "processing";
  if (value === "failed" || value === "failure") return "failed";
  if (value === "canceled" || value === "cancelled") return "canceled";
  if (value === "expired") return "expired";
  return "unknown";
}

export function normalizeStripePaymentStatus(status: unknown): PaymentStatus {
  const value = String(status ?? "").toLowerCase();
  if (value === "paid" || value === "no_payment_required") return "complete";
  if (value === "unpaid") return "unpaid";
  return "unknown";
}

export function getNotchpayFailureReason(tx: Record<string, unknown>): string | undefined {
  const nestedError = tx.error as Record<string, unknown> | undefined;
  const raw =
    tx.failure_reason ??
    tx.reason ??
    tx.message ??
    nestedError?.message ??
    nestedError?.description;
  const text = String(raw ?? "").trim();
  return text || undefined;
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
