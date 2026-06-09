/** Plafond NotchPay par transaction (sandbox et compte standard). */
export const NOTCHPAY_MAX_XAF = 500_000;

export const SESSION_CATALOG = {
  diagnostic: { label: "Diagnostic Stratégique", priceEur: 490, priceXaf: 320_000 },
  coaching: { label: "Coaching Stratégique", priceEur: 250, priceXaf: 150_000 },
  pack3: { label: "Pack 3 séances Coaching", priceEur: 650, priceXaf: 420_000 },
  premium: { label: "Accompagnement Premium 3 mois", priceEur: 2400, priceXaf: 1_500_000 },
} as const;

export type SessionId = keyof typeof SESSION_CATALOG;

export function isNotchpayAmountAllowed(amountXaf: number): boolean {
  return amountXaf > 0 && amountXaf <= NOTCHPAY_MAX_XAF;
}

export function notchpayLimitMessage(amountXaf: number): string {
  const formatted = amountXaf.toLocaleString("fr-FR");
  return (
    `Le montant de cette prestation (${formatted} FCFA) dépasse la limite Mobile Money NotchPay ` +
    `(max. ${NOTCHPAY_MAX_XAF.toLocaleString("fr-FR")} FCFA par transaction). ` +
    `Contactez-nous à contact@jcbo-conseil.com pour un paiement en plusieurs fois.`
  );
}
