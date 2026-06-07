import { defineMiddleware } from "astro:middleware";

const API_URL = import.meta.env.PUBLIC_API_URL ?? "https://adhesion-jcbo.vercel.app";

const MAINTENANCE_ALLOW = ["/maintenance"];

let cachedMaintenance: { vitrine: boolean; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 30_000;

async function isVitrineInMaintenance(): Promise<boolean> {
  const now = Date.now();
  if (cachedMaintenance && now - cachedMaintenance.fetchedAt < CACHE_TTL_MS) {
    return cachedMaintenance.vitrine;
  }

  try {
    const res = await fetch(`${API_URL}/api/public/maintenance`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { vitrine?: boolean };
    cachedMaintenance = { vitrine: !!data.vitrine, fetchedAt: now };
    return cachedMaintenance.vitrine;
  } catch {
    return false;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const path = new URL(context.request.url).pathname;

  if (MAINTENANCE_ALLOW.some((p) => path.startsWith(p))) {
    return next();
  }

  if (await isVitrineInMaintenance()) {
    return context.redirect("/maintenance");
  }

  return next();
});
