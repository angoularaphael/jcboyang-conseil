/** Part du compte principal JCBO (plateforme) */
export const PLATFORM_SHARE = 0.8;

/** Répartition en centimes Stripe. */
export function splitPaymentAmount(totalCents: number): {
  platformAmount: number;
  connectedAmount: number;
} {
  const platformAmount = Math.round(totalCents * PLATFORM_SHARE);
  const connectedAmount = totalCents - platformAmount;
  return { platformAmount, connectedAmount };
}
