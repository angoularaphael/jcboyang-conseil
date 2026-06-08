import type { APIRoute } from "astro";
import Stripe from "stripe";
import { z } from "zod";

const SESSION_CATALOG = {
  diagnostic: { label: "Diagnostic Stratégique", priceEur: 490 },
  coaching: { label: "Coaching Stratégique", priceEur: 250 },
  pack3: { label: "Pack 3 séances Coaching", priceEur: 650 },
  premium: { label: "Accompagnement Premium 3 mois", priceEur: 2400 },
} as const;

type SessionKey = keyof typeof SESSION_CATALOG;

const bodySchema = z.object({
  sessionId: z.enum(["diagnostic", "coaching", "pack3", "premium"]),
  name: z.string().min(2).max(120).trim(),
  email: z.string().email().max(200).trim().toLowerCase(),
  phone: z.string().min(4).max(40).trim(),
  company: z.string().max(120).trim().optional().default(""),
  date: z.string().max(40).trim().optional().default(""),
  message: z.string().max(2000).trim().optional().default(""),
});

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey.includes("REMPLACER")) {
    return new Response(
      JSON.stringify({ error: "Paiement non configuré (clé Stripe absente)." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.issues[0].message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const data = parsed.data;
  const sessionInfo = SESSION_CATALOG[data.sessionId as SessionKey];

  const stripe = new Stripe(stripeKey);
  const origin = new URL(request.url).origin;

  // Stripe Connect : 80 % JCBO (plateforme), 20 % compte connecté
  const connectedAccountId = import.meta.env.STRIPE_CONNECTED_ACCOUNT_ID;
  const platformFee = Math.round(sessionInfo.priceEur * 100 * 0.8);

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: data.email,
    invoice_creation: {
      enabled: true,
      invoice_data: {
        description: `Réservation — ${sessionInfo.label}`,
        metadata: {
          source: "vitrine",
          customerName: data.name,
        },
      },
    },
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: sessionInfo.label,
            description: "JCBO Conseil — Réservation en ligne",
          },
          unit_amount: sessionInfo.priceEur * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      source: "vitrine",
      sessionKey: data.sessionId,
      sessionLabel: sessionInfo.label,
      customerName: data.name,
      customerEmail: data.email,
      customerPhone: data.phone,
      customerCompany: data.company,
      desiredDate: data.date,
      customerMessage: data.message,
    },
    success_url: `${origin}/reservation/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/reservation/echec`,
  };

  const paymentIntentData: Stripe.Checkout.SessionCreateParams.PaymentIntentData = {
    receipt_email: data.email,
  };
  if (connectedAccountId) {
    paymentIntentData.application_fee_amount = platformFee;
    paymentIntentData.transfer_data = { destination: connectedAccountId };
  }
  sessionParams.payment_intent_data = paymentIntentData;

  const checkout = await stripe.checkout.sessions.create(sessionParams);

  return new Response(JSON.stringify({ url: checkout.url }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
