import { createHmac, timingSafeEqual } from "node:crypto";

function getInstallmentSecret(): string {
  const secret =
    import.meta.env.INSTALLMENT_PLAN_SECRET?.trim() ||
    import.meta.env.DEV_BYPASS_SECRET?.trim();
  if (secret) return secret;
  if (import.meta.env.PROD) {
    throw new Error("INSTALLMENT_PLAN_SECRET manquant en production.");
  }
  return "jcbo-installment-dev-local-only";
}

export function signInstallmentPlanToken(planId: string): string {
  const normalized = planId.trim();
  return createHmac("sha256", getInstallmentSecret()).update(normalized).digest("hex");
}

export function verifyInstallmentPlanToken(
  planId: string,
  token: string | null | undefined
): boolean {
  if (!token?.trim() || !planId.trim()) return false;
  const expected = signInstallmentPlanToken(planId);
  try {
    return timingSafeEqual(Buffer.from(token.trim()), Buffer.from(expected));
  } catch {
    return false;
  }
}
