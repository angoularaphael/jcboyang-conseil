import { createHmac, timingSafeEqual } from "node:crypto";

/** Vérifie la signature HMAC SHA-256 (header x-notch-signature). */
export function verifyNotchpayWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
  hashKey: string
): boolean {
  if (!signature?.trim() || !hashKey.trim()) return false;
  const expected = createHmac("sha256", hashKey.trim()).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature.trim()), Buffer.from(expected));
  } catch {
    return false;
  }
}
