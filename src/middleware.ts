import { defineMiddleware } from "astro:middleware";

import { apiUrl as API_URL } from "./data/site-config";

async function isVitrineInMaintenance(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/public/maintenance`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { vitrine?: boolean };
    return !!data.vitrine;
  } catch {
    return false;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const path = new URL(context.request.url).pathname;

  if (path.startsWith("/api/maintenance-status")) {
    return next();
  }

  const inMaintenance = await isVitrineInMaintenance();

  if (path.startsWith("/maintenance")) {
    if (!inMaintenance) {
      return context.redirect("/");
    }
    return next();
  }

  if (inMaintenance) {
    return context.redirect("/maintenance");
  }

  return next();
});
