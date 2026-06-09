import type { APIRoute } from "astro";
import { fulfillNotchpayReservation } from "../../../lib/reservation-fulfill";

/** Déclenche confirmation + e-mails après retour NotchPay (secours si webhook absent). */
export const POST: APIRoute = async ({ request, url }) => {
  let reference = url.searchParams.get("reference")?.trim();
  if (!reference && request.headers.get("content-type")?.includes("application/json")) {
    try {
      const body = (await request.json()) as { reference?: string };
      reference = body.reference?.trim();
    } catch {
      /* ignore */
    }
  }

  if (!reference) {
    return new Response(JSON.stringify({ error: "reference manquante" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await fulfillNotchpayReservation(reference);

  return new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 400,
    headers: { "Content-Type": "application/json" },
  });
};

export const GET: APIRoute = POST;
