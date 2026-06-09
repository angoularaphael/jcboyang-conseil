import { createHmac, timingSafeEqual } from "node:crypto";

export const DEV_BYPASS_COOKIE = "jcbo_vitrine_dev";

const BYPASS_SECRET =
  import.meta.env.DEV_BYPASS_SECRET ?? "jcbo-vitrine-maintenance-bypass";

export function getDevBypassPassword(): string {
  return import.meta.env.DEV_BYPASS_PASSWORD?.trim() || "302006";
}

export function createDevBypassToken(): string {
  return createHmac("sha256", BYPASS_SECRET).update("granted").digest("hex");
}

export function isValidDevBypassToken(token: string | undefined | null): boolean {
  if (!token?.trim()) return false;
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
