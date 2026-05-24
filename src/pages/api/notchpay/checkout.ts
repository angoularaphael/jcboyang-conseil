import type { APIRoute } from "astro";
import { z } from "zod";

const BASE_URL = "https://api.notchpay.co";

const SESSION_CATALOG = {
  diagnostic: { label: "Diagnostic Stratégique", priceEur: 490, priceXaf: 320000 },
  coaching: { label: "Coaching Stratégique", priceEur: 250, priceXaf: 150000 },
  pack3: { label: "Pack 3 séances Coaching", priceEur: 650, priceXaf: 420000 },
  premium: { label: "Accompagnement Premium 3 mois", priceEur: 2400, priceXaf: 1500000 },
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
  const notchPayKey = import.meta.env.NOTCHPAY_PUBLIC_KEY;
  if (!notchPayKey) {
    return new Response(
      JSON.stringify({ error: "Paiement Mobile Money non configuré (NotchPay)." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 }); }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.issues[0].message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const data = parsed.data;
  const sessionInfo = SESSION_CATALOG[data.sessionId as SessionKey];
  const origin = new URL(request.url).origin;
  const reference = `vitrine-${data.sessionId}-${Date.now()}`;

  const amountXaf = sessionInfo.priceXaf;
  const applicationFee = Math.round(amountXaf * 0.20); // 20% plateforme
  const connectedAccountId = import.meta.env.NOTCHPAY_CONNECTED_ACCOUNT_ID;

  const paymentBody: Record<string, unknown> = {
    amount: amountXaf,
    currency: "XAF",
    customer: {
      name: data.name,
      email: data.email,
      phone: data.phone,
    },
    description: `${sessionInfo.label} — JCBO Conseil`,
    reference,
    callback: `${origin}/api/notchpay/webhook`,
  };

  if (applicationFee && connectedAccountId) {
    paymentBody.application_fee = applicationFee;
    paymentBody.destination = {
      account: connectedAccountId,
      amount: amountXaf - applicationFee,
    };
  }

  try {
    const res = await fetch(`${BASE_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": notchPayKey,
      },
      body: JSON.stringify(paymentBody),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(
        JSON.stringify({ error: `Erreur NotchPay: ${err}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await res.json();
    const authUrl = result.authorization_url ?? result.transaction?.authorization_url ?? "";

    return new Response(JSON.stringify({ url: authUrl, reference }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur réseau NotchPay";
    return new Response(JSON.stringify({ error: msg }), { status: 502 });
  }
};
