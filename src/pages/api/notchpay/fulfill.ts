import type { APIRoute } from "astro";
import { fulfillNotchpayReservation } from "../../../lib/reservation-fulfill";
import {
  pickNotchpayTrxIdFromUrl,
  pickVitrineReferenceFromUrl,
} from "../../../lib/notchpay-reference";

/** Déclenche confirmation + e-mails après retour NotchPay (secours si webhook absent). */
export const POST: APIRoute = async ({ request, url }) => {
  let vitrineRef = pickVitrineReferenceFromUrl(url.searchParams);
  let trxId = pickNotchpayTrxIdFromUrl(url.searchParams);

  if (!vitrineRef && request.headers.get("content-type")?.includes("application/json")) {
    try {
      const body = (await request.json()) as { reference?: string; ref?: string; trx?: string };
      vitrineRef = body.ref?.trim() || pickVitrineReferenceFromUrl(new URLSearchParams({ reference: body.reference ?? "" }));
      trxId = body.trx?.trim() || pickNotchpayTrxIdFromUrl(new URLSearchParams({ reference: body.reference ?? "" }));
    } catch {
      /* ignore */
    }
  }

  if (!vitrineRef && !trxId) {
    return new Response(JSON.stringify({ error: "reference manquante" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await fulfillNotchpayReservation(vitrineRef || trxId, trxId || undefined);

  return new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 400,
    headers: { "Content-Type": "application/json" },
  });
};

export const GET: APIRoute = POST;
