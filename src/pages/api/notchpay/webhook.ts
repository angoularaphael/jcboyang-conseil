import type { APIRoute } from "astro";
import { getSupabase, isSupabaseConfigured } from "../../../lib/supabase";
import {
  sendAdminReservationEmail,
  sendCustomerReservationEmail,
  type ReservationPayload,
} from "../../../lib/email";

const NOTCHPAY_BASE = "https://api.notchpay.co";

export const POST: APIRoute = async ({ request }) => {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return new Response("JSON invalide", { status: 400 });
  }

  const event = String(payload.event ?? "");
  if (event !== "payment.complete") {
    return new Response(JSON.stringify({ ignored: true, event }), { status: 200 });
  }

  const txData = (payload.data ?? payload) as Record<string, unknown>;
  const reference = String(txData.reference ?? "");
  if (!reference) return new Response("Référence manquante", { status: 400 });

  // Vérifier le paiement
  const notchPayKey = import.meta.env.NOTCHPAY_PUBLIC_KEY;
  if (notchPayKey) {
    try {
      const verifyRes = await fetch(`${NOTCHPAY_BASE}/payments/${reference}`, {
        headers: { "Authorization": notchPayKey },
      });
      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        const status = verifyData.transaction?.status ?? verifyData.status ?? "";
        if (status !== "complete") {
          return new Response(JSON.stringify({ error: "Non complété" }), { status: 400 });
        }
      }
    } catch { /* on continue */ }
  }

  const customer = (txData.customer ?? {}) as Record<string, string>;
  const amount = Number(txData.amount ?? 0);
  const currency = String(txData.currency ?? "XAF");

  const reservationPayload: ReservationPayload = {
    customerName: customer.name ?? "Client",
    customerEmail: customer.email ?? "",
    customerPhone: customer.phone ?? "",
    company: "",
    sessionLabel: String(txData.description ?? "Réservation JCBO"),
    date: "",
    message: "",
    amount: currency === "XAF" ? Math.round(amount / 655) : amount,
    currency: "eur",
    stripeSessionId: reference,
  };

  if (isSupabaseConfigured()) {
    try {
      const supa = getSupabase();
      await supa.from("admin_notifications").insert({
        id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: "paiement_vitrine_mobile",
        titre: `Paiement Mobile Money — ${reservationPayload.sessionLabel}`,
        message:
          `${reservationPayload.customerName} (${reservationPayload.customerEmail}) a payé ${amount} ${currency} ` +
          `via Mobile Money pour « ${reservationPayload.sessionLabel} ».`,
        metadata: {
          reference,
          amount,
          currency,
          customer,
          description: txData.description,
        },
        lue: false,
      });
    } catch (err) {
      console.error("[notchpay webhook] Insertion notification échouée :", err);
    }
  }

  try {
    await Promise.all([
      sendAdminReservationEmail(reservationPayload),
      sendCustomerReservationEmail(reservationPayload),
    ]);
  } catch (err) {
    console.error("[notchpay webhook] Envoi emails échoué :", err);
  }

  return new Response(JSON.stringify({ recu: true }), { status: 200 });
};
