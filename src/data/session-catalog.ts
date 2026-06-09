/** Plafond NotchPay par transaction (sandbox et compte standard). */
export const NOTCHPAY_MAX_XAF = 500_000;

export const SESSION_CATALOG = {
  diagnostic: { label: "Diagnostic Stratégique", priceEur: 490, priceXaf: 320_000 },
  coaching: { label: "Coaching Stratégique", priceEur: 250, priceXaf: 150_000 },
  pack3: { label: "Pack 3 séances Coaching", priceEur: 650, priceXaf: 420_000 },
  premium: { label: "Accompagnement Premium 3 mois", priceEur: 2400, priceXaf: 1_500_000 },
} as const;

export type SessionId = keyof typeof SESSION_CATALOG;

/** Découpe un montant XAF en échéances ≤ plafond NotchPay. */
export function computeInstallmentAmounts(totalXaf: number): number[] {
  const amounts: number[] = [];
  let remaining = totalXaf;
  while (remaining > 0) {
    const chunk = Math.min(remaining, NOTCHPAY_MAX_XAF);
    amounts.push(chunk);
    remaining -= chunk;
  }
  return amounts;
}

export function needsInstallments(totalXaf: number): boolean {
  return totalXaf > NOTCHPAY_MAX_XAF;
}

export function isNotchpayAmountAllowed(amountXaf: number): boolean {
  return amountXaf > 0 && amountXaf <= NOTCHPAY_MAX_XAF;
}
