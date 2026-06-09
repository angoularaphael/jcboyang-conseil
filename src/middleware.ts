import { defineMiddleware } from "astro:middleware";

import { apiUrl as API_URL } from "./data/site-config";
import { hasDevBypass } from "./lib/dev-bypass";

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
  const devBypass = hasDevBypass(context.request.headers.get("cookie"));
  context.locals.devBypass = devBypass;

  if (
    path.startsWith("/api/maintenance-status") ||
    path.startsWith("/api/dev-bypass") ||
    path.startsWith("/api/installment-plan") ||
    path.startsWith("/api/notchpay/") ||
    path.startsWith("/reservation/succes") ||
    path.startsWith("/reservation/echec") ||
    path.startsWith("/reservation/echeances")
  ) {
    return next();
  }
  const inMaintenance = await isVitrineInMaintenance();

  if (path.startsWith("/maintenance")) {
    if (!inMaintenance || devBypass) {
      return context.redirect("/");
    }
    return next();
  }

  if (inMaintenance && !devBypass) {
    return context.redirect("/maintenance");
  }

  return next();
});
