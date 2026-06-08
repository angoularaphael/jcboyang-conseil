import type { APIRoute } from "astro";

import { apiUrl as API_URL } from "../../data/site-config";

const NO_CACHE = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

export const GET: APIRoute = async () => {
  try {
    const res = await fetch(`${API_URL}/api/public/maintenance`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      return new Response(JSON.stringify({ vitrine: false, adherent: false }), {
        status: 200,
        headers: NO_CACHE,
      });
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200, headers: NO_CACHE });
  } catch {
    return new Response(JSON.stringify({ vitrine: false, adherent: false }), {
      status: 200,
      headers: NO_CACHE,
    });
  }
};
