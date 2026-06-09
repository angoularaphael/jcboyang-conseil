import type { APIRoute } from "astro";
import { z } from "zod";
import {
  isNotchpayAmountAllowed,
  notchpayLimitMessage,
  SESSION_CATALOG,
  type SessionId,
} from "../../../data/session-catalog";

const BASE_URL = "https://api.notchpay.co";

const bodySchema = z.object({
  sessionId: z.enum(["diagnostic", "coaching", "pack3", "premium"]),
  name: z.string().min(2).max(120).trim(),
  email: z.string().email().max(200).trim().toLowerCase(),
  phone: z.string().min(4).max(40).trim(),
  company: z.string().max(120).trim().optional().default(""),
  date: z.string().max(40).trim().optional().default(""),
  message: z.string().max(2000).trim().optional().default(""),
});

function parseNotchpayError(raw: string): string {
  try {
    const data = JSON.parse(raw) as {
      message?: string;
      errors?: { amount?: string[] };
    };
    if (data.errors?.amount?.[0]) {
      return `Montant trop élevé pour Mobile Money (maximum 500 000 FCFA par paiement). Contactez-nous pour un arrangement.`;
    }
    if (data.message) return data.message;
  } catch {
    /* texte brut */
  }
  return "Impossible d'initialiser le paiement Mobile Money.";
}

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
  const sessionInfo = SESSION_CATALOG[data.sessionId as SessionId];
  const amountXaf = sessionInfo.priceXaf;

  if (!isNotchpayAmountAllowed(amountXaf)) {
    return new Response(JSON.stringify({ error: notchpayLimitMessage(amountXaf) }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const origin = new URL(request.url).origin;
  const reference = `vitrine-${data.sessionId}-${Date.now()}`;
  const applicationFee = Math.round(amountXaf * 0.20);
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
    callback: `${origin}/reservation/succes?provider=notchpay&reference=${encodeURIComponent(reference)}`,
    metadata: {
      source: "vitrine",
      sessionId: data.sessionId,
      sessionLabel: sessionInfo.label,
      customerName: data.name,
      customerEmail: data.email,
      customerPhone: data.phone,
      customerCompany: data.company,
      desiredDate: data.date,
      customerMessage: data.message,
      amountXaf: String(amountXaf),
    },
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
        JSON.stringify({ error: parseNotchpayError(err) }),
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
