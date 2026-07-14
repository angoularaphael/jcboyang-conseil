import { createHmac, timingSafeEqual } from "node:crypto";

export const DEV_BYPASS_COOKIE = "jcbo_vitrine_dev";

export function isDevBypassConfigured(): boolean {
  if (!import.meta.env.PROD) return true;
  return Boolean(
    import.meta.env.DEV_BYPASS_PASSWORD?.trim() &&
      import.meta.env.DEV_BYPASS_SECRET?.trim()
  );
}

function getBypassSecret(): string {
  const secret = import.meta.env.DEV_BYPASS_SECRET?.trim();
  if (secret) return secret;
  if (import.meta.env.PROD) {
    throw new Error("DEV_BYPASS_SECRET manquant en production.");
  }
  return "jcbo-vitrine-dev-local-only";
}

export function getDevBypassPassword(): string | null {
  const password = import.meta.env.DEV_BYPASS_PASSWORD?.trim();
  if (password) return password;
  if (import.meta.env.PROD) return null;
  return "dev-local-only";
}

export function createDevBypassToken(): string {
  return createHmac("sha256", getBypassSecret()).update("granted").digest("hex");
}

export function isValidDevBypassToken(token: string | undefined | null): boolean {
  if (!token?.trim()) return false;
  if (import.meta.env.PROD && !isDevBypassConfigured()) return false;
  const expected = createDevBypassToken();
  try {
    return timingSafeEqual(Buffer.from(token.trim()), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function readDevBypassCookie(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${DEV_BYPASS_COOKIE}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

export function hasDevBypass(cookieHeader: string | null): boolean {
  return isValidDevBypassToken(readDevBypassCookie(cookieHeader));
}
