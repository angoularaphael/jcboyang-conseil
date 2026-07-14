import type { APIRoute } from "astro";
import { verifyNotchpayWebhookSignature } from "../../../lib/notchpay-webhook";
import {
  fulfillNotchpayReservation,
  verifyNotchpayPaymentIsComplete,
} from "../../../lib/reservation-fulfill";
import { readServerEnv } from "../../../lib/supabase";

/** Webhook serveur-à-serveur NotchPay (à configurer dans le dashboard, pas comme URL de retour client). */
export const POST: APIRoute = async ({ request }) => {
  const rawBody = await request.text();
  const webhookHash = readServerEnv("NOTCHPAY_WEBHOOK_SECRET");
  if (!webhookHash || webhookHash.includes("REMPLACER")) {
    console.error("[notchpay webhook] NOTCHPAY_WEBHOOK_SECRET non configuré — requête rejetée");
    return new Response("Webhook non configuré", { status: 503 });
  }
  const signature = request.headers.get("x-notch-signature");
  if (!verifyNotchpayWebhookSignature(rawBody, signature, webhookHash)) {
    return new Response("Signature webhook invalide", { status: 403 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return new Response("JSON invalide", { status: 400 });
  }

  const event = String(payload.event ?? "");
  if (event === "payment.failed" || event === "payment.canceled" || event === "payment.expired") {
    console.info(`[notchpay webhook] ${event} ignoré (aucune confirmation envoyée)`);
    return new Response(JSON.stringify({ ignored: true, event }), { status: 200 });
  }

  if (event !== "payment.complete") {
    return new Response(JSON.stringify({ ignored: true, event }), { status: 200 });
  }

  const txData = (payload.data ?? payload) as Record<string, unknown>;
  const reference = String(txData.reference ?? txData.trxref ?? "");
  const trxId = String(txData.id ?? txData.trx ?? "").trim();
  if (!reference && !trxId) return new Response("Référence manquante", { status: 400 });

  const verification = await verifyNotchpayPaymentIsComplete(
    reference || trxId,
    reference && trxId && reference !== trxId ? trxId : undefined
  );
  if (!verification.complete) {
    console.info(
      `[notchpay webhook] payment.complete ignoré (statut API: ${verification.paymentStatus})`
    );
    return new Response(
      JSON.stringify({ ignored: true, paymentStatus: verification.paymentStatus }),
      { status: 200 }
    );
  }

  const result = await fulfillNotchpayReservation(
    verification.reference,
    trxId && trxId !== verification.reference ? trxId : undefined
  );
  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error, paymentStatus: result.paymentStatus }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ recu: true }), { status: 200 });
};
