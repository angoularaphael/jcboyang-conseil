import type { APIRoute } from "astro";
import Stripe from "stripe";
import { fulfillReservation } from "../../../lib/reservation-fulfill";

/** Déclenche l'envoi de la facture après retour Checkout (secours si webhook absent). */
export const POST: APIRoute = async ({ request, url }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey.includes("REMPLACER")) {
    return new Response(JSON.stringify({ error: "Stripe non configuré" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  let sessionId = url.searchParams.get("session_id")?.trim();
  if (!sessionId && request.headers.get("content-type")?.includes("application/json")) {
    try {
      const body = (await request.json()) as { session_id?: string };
      sessionId = body.session_id?.trim();
    } catch {
      /* ignore */
    }
  }

  if (!sessionId) {
    return new Response(JSON.stringify({ error: "session_id manquant" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(stripeKey);
  const result = await fulfillReservation(stripe, sessionId);

  return new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 400,
    headers: { "Content-Type": "application/json" },
  });
};

export const GET: APIRoute = POST;
