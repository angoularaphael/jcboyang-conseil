import type { APIRoute } from "astro";
import { checkNotchpayPaymentStatus } from "../../../lib/reservation-fulfill";
import {
  pickNotchpayTrxIdFromUrl,
  pickVitrineReferenceFromUrl,
} from "../../../lib/notchpay-reference";

const JSON_HEADERS = { "Content-Type": "application/json" };

export const GET: APIRoute = async ({ url }) => {
  const vitrineRef = pickVitrineReferenceFromUrl(url.searchParams);
  const trxId = pickNotchpayTrxIdFromUrl(url.searchParams);
  if (!vitrineRef && !trxId) {
    return new Response(JSON.stringify({ error: "reference manquante" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const result = await checkNotchpayPaymentStatus(vitrineRef || trxId, trxId || undefined);
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: JSON_HEADERS,
  });
};
