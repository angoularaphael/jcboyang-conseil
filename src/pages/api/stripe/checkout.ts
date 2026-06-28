import type { APIRoute } from "astro";
import Stripe from "stripe";
import { z } from "zod";
import { getSessionCatalog } from "../../../lib/session-catalog";
import { hasDevBypass } from "../../../lib/dev-bypass";
import { PAYMENT_STRIPE_EUR_ONLY } from "../../../lib/payment-display";
import { splitPaymentAmount } from "../../../lib/payment-split";

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const devBypass = hasDevBypass(request.headers.get("cookie"));
  const sessionCatalog = getSessionCatalog({ devBypass });

  const bodySchema = z.object({
    sessionId: z
      .string()
      .trim()
      .refine((id) => id in sessionCatalog, { message: "Prestation inconnue" }),
    zone: z.enum(["euro", "afrique"]).optional().default("euro"),
    name: z.string().min(2).max(120).trim(),
    email: z.string().email().max(200).trim().toLowerCase(),
    phone: z.string().min(4).max(40).trim(),
    company: z.string().max(120).trim().optional().default(""),
    date: z.string().max(40).trim().optional().default(""),
    message: z.string().max(2000).trim().optional().default(""),
  });

  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey.includes("REMPLACER")) {
    return jsonResponse({ error: "Paiement non configuré (clé Stripe absente)." }, 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Corps invalide" }, 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: parsed.error.issues[0].message }, 400);
  }

  const data = parsed.data;
  const zone = PAYMENT_STRIPE_EUR_ONLY ? "euro" : data.zone;
  const sessionInfo = sessionCatalog[data.sessionId as keyof typeof sessionCatalog];
  if (!sessionInfo) {
    return jsonResponse({ error: "Prestation inconnue" }, 400);
  }

  const stripe = new Stripe(stripeKey);
  const origin = new URL(request.url).origin;

  const connectedAccountId = import.meta.env.STRIPE_CONNECTED_ACCOUNT_ID?.trim();
  const amountCents = sessionInfo.priceEur * 100;
  const { platformAmount: platformFee } = splitPaymentAmount(amountCents);
  const isTestLive = data.sessionId === "test1e";

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: data.email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: sessionInfo.label,
            description: isTestLive
              ? "Vérification du split 80/20 — montant remboursable"
              : "JCBO Conseil — Réservation en ligne",
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      source: "vitrine",
      zone: zone,
      sessionKey: data.sessionId,
      sessionLabel: sessionInfo.label,
      customerName: data.name,
      customerEmail: data.email,
      customerPhone: data.phone,
      customerCompany: data.company,
      desiredDate: data.date,
      customerMessage: data.message,
      ...(isTestLive ? { testLive: "true" } : {}),
    },
    success_url: `${origin}/reservation/succes?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/reservation/echec?provider=stripe&status=canceled`,
  };

  // Facture Stripe : uniquement sans Connect (évite conflits destination charge).
  if (!connectedAccountId && !isTestLive) {
    sessionParams.invoice_creation = {
      enabled: true,
      invoice_data: {
        description: `Réservation — ${sessionInfo.label}`,
        metadata: {
          source: "vitrine",
          customerName: data.name,
        },
      },
    };
  }

  if (connectedAccountId) {
    sessionParams.payment_intent_data = {
      receipt_email: data.email,
      application_fee_amount: platformFee,
      transfer_data: { destination: connectedAccountId },
    };
  } else {
    sessionParams.payment_intent_data = {
      receipt_email: data.email,
    };
  }

  try {
    const checkout = await stripe.checkout.sessions.create(sessionParams);
    return jsonResponse({ url: checkout.url }, 200);
  } catch (err) {
    const detail =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Erreur Stripe inconnue";
    console.error("[stripe/checkout]", detail);
    return jsonResponse(
      { error: "Impossible de créer le paiement Stripe.", detail },
      502
    );
  }
};
