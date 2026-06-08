import type { APIRoute } from "astro";
import { z } from "zod";
import { bankDetails } from "../../../data/bank-details";
import {
  sendAdminVirementEmail,
  sendCustomerVirementEmail,
  type VirementPayload,
} from "../../../lib/email";
import { getSupabase, isSupabaseConfigured } from "../../../lib/supabase";

const SESSION_CATALOG = {
  diagnostic: { label: "Diagnostic Stratégique", priceEur: 490 },
  coaching: { label: "Coaching Stratégique", priceEur: 250 },
  pack3: { label: "Pack 3 séances Coaching", priceEur: 650 },
  premium: { label: "Accompagnement Premium 3 mois", priceEur: 2400 },
} as const;

const bodySchema = z.object({
  sessionId: z.enum(["diagnostic", "coaching", "pack3", "premium"]),
  name: z.string().min(2).max(120).trim(),
  email: z.string().email().max(200).trim().toLowerCase(),
  phone: z.string().min(4).max(40).trim(),
  company: z.string().max(120).trim().optional().default(""),
  date: z.string().max(40).trim().optional().default(""),
  message: z.string().max(2000).trim().optional().default(""),
});

function makeReference(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  return `JCBO-VIR-${stamp}`;
}

export const POST: APIRoute = async ({ request }) => {
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
  const sessionInfo = SESSION_CATALOG[data.sessionId];
  const reference = makeReference();

  const payload: VirementPayload = {
    customerName: data.name,
    customerEmail: data.email,
    customerPhone: data.phone,
    company: data.company,
    sessionLabel: sessionInfo.label,
    date: data.date,
    message: data.message,
    amount: sessionInfo.priceEur,
    currency: "eur",
    reference,
  };

  const [adminRes, customerRes] = await Promise.all([
    sendAdminVirementEmail(payload),
    sendCustomerVirementEmail(payload),
  ]);

  if (!customerRes.ok) {
    return new Response(
      JSON.stringify({ error: customerRes.error ?? "Envoi e-mail échoué" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!adminRes.ok) {
    console.error("[virement] E-mail admin :", adminRes.error);
  }

  if (isSupabaseConfigured()) {
    try {
      const supa = getSupabase();
      await supa.from("admin_notifications").insert({
        id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: "paiement_vitrine",
        titre: `Virement en attente — ${payload.sessionLabel}`,
        message:
          `${payload.customerName} (${payload.customerEmail}) a réservé par virement ` +
          `${payload.amount.toFixed(2)} EUR. Réf. ${reference}.`,
        metadata: {
          paymentMethod: "virement",
          reference,
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
      console.error("[virement] Notification admin échouée :", err);
    }
  }

  const origin = new URL(request.url).origin;
  const redirectUrl =
    `${origin}/reservation/virement?ref=${encodeURIComponent(reference)}` +
    `&amount=${payload.amount}&session=${encodeURIComponent(payload.sessionLabel)}`;

  return new Response(
    JSON.stringify({
      ok: true,
      reference,
      redirectUrl,
      bank: bankDetails,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
