import type { APIRoute } from "astro";
import Stripe from "stripe";
import { getSupabase, isSupabaseConfigured } from "../../../lib/supabase";
import {
  sendAdminReservationEmail,
  sendCustomerReservationEmail,
  type ReservationPayload,
} from "../../../lib/email";

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

  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ recu: true, ignored: event.type }), { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata ?? {};

  if (meta.source !== "vitrine") {
    // Cet événement appartient probablement à l'app d'adhésion : on ignore proprement.
    return new Response(JSON.stringify({ recu: true, ignored: "non-vitrine" }), { status: 200 });
  }

  const amount = (session.amount_total ?? 0) / 100;
  const currency = session.currency ?? "eur";

  const payload: ReservationPayload = {
    customerName: meta.customerName ?? "Client",
    customerEmail: session.customer_email ?? meta.customerEmail ?? "",
    customerPhone: meta.customerPhone ?? "",
    company: meta.customerCompany ?? "",
    sessionLabel: meta.sessionLabel ?? "Réservation",
    date: meta.desiredDate ?? "",
    message: meta.customerMessage ?? "",
    amount,
    currency,
    stripeSessionId: session.id,
  };

  // 1) Notification admin dans Supabase (dashboard)
  if (isSupabaseConfigured()) {
    try {
      const supa = getSupabase();
      await supa.from("admin_notifications").insert({
        id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: "paiement_vitrine",
        titre: `Paiement reçu — ${payload.sessionLabel}`,
        message:
          `${payload.customerName} (${payload.customerEmail}) a payé ${payload.amount.toFixed(2)} ` +
          `${payload.currency.toUpperCase()} pour « ${payload.sessionLabel} ».`,
        metadata: {
          stripeSessionId: payload.stripeSessionId,
          amount: payload.amount,
          currency: payload.currency,
          customer: {
            name: payload.customerName,
            email: payload.customerEmail,
            phone: payload.customerPhone,
            company: payload.company,
          },
          sessionLabel: payload.sessionLabel,
          desiredDate: payload.date,
          message: payload.message,
        },
        lue: false,
      });
    } catch (err) {
      // On loggue mais on ne fait pas échouer le webhook : Stripe retenterait sinon.
      console.error("[webhook] Insertion admin_notifications échouée :", err);
    }
  }

  // 2) Emails (admin + client)
  try {
    await Promise.all([
      sendAdminReservationEmail(payload),
      sendCustomerReservationEmail(payload),
    ]);
  } catch (err) {
    console.error("[webhook] Envoi des e-mails échoué :", err);
  }

  return new Response(JSON.stringify({ recu: true }), { status: 200 });
};
