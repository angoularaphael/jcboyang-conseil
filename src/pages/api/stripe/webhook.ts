import type { APIRoute } from "astro";
import Stripe from "stripe";
import { fulfillReservation } from "../../../lib/reservation-fulfill";

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (
    !stripeKey || stripeKey.includes("REMPLACER") ||
    !webhookSecret || webhookSecret.includes("REMPLACER")
  ) {
    return new Response("Webhook non configuré", { status: 503 });
  }

  const stripe = new Stripe(stripeKey);
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Signature manquante", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return new Response(`Webhook invalide: ${msg}`, { status: 400 });
  }

  if (
    event.type === "checkout.session.async_payment_failed" ||
    event.type === "checkout.session.expired"
  ) {
    console.info(`[stripe webhook] ${event.type} ignoré`);
    return new Response(JSON.stringify({ recu: true, ignored: event.type }), { status: 200 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ recu: true, ignored: event.type }), { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata ?? {};

  if (meta.source !== "vitrine") {
    // Cet événement appartient probablement à l'app d'adhésion : on ignore proprement.
    return new Response(JSON.stringify({ recu: true, ignored: "non-vitrine" }), { status: 200 });
  }

  const result = await fulfillReservation(stripe, session.id);
  if (!result.ok) {
    console.error("[webhook] Fulfillment échoué :", result.error);
  }

  return new Response(JSON.stringify({ recu: true, ...result }), { status: 200 });
};
