import type { APIRoute } from "astro";
import { buildFactureHtml, formatReservationMoney } from "../../../lib/email";
import { getFacturePayload } from "../../../lib/reservation-fulfill";

/** Affiche la facture en ligne (consultation + impression PDF). */
export const GET: APIRoute = async ({ url }) => {
  const provider = url.searchParams.get("provider")?.trim() ?? "";
  const id =
    url.searchParams.get("reference")?.trim() ??
    url.searchParams.get("session_id")?.trim() ??
    url.searchParams.get("trxref")?.trim() ??
    "";

  if (!provider || !id) {
    return new Response("Paramètres manquants", { status: 400 });
  }

  const payload = await getFacturePayload(provider, id);
  if (!payload) {
    return new Response("Facture introuvable ou paiement non confirmé", { status: 404 });
  }

  const amountLabel = formatReservationMoney(payload.amount, payload.currency);
  const successBack = `/reservation/succes?provider=${encodeURIComponent(provider)}&${provider === "stripe" ? "session_id" : "reference"}=${encodeURIComponent(id)}`;

  const toolbar = `
<style>
  .jcbo-facture-toolbar {
    position: sticky; top: 0; z-index: 9999;
    display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; align-items: center;
    padding: 14px 16px; background: #0b1f3a; color: #fff;
    box-shadow: 0 2px 12px rgba(11,31,58,0.15);
    font-family: Georgia, serif;
  }
  .jcbo-facture-toolbar p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.75); }
  .jcbo-facture-toolbar a, .jcbo-facture-toolbar button {
    background: #d4a762; color: #0b1f3a; border: none; border-radius: 999px;
    padding: 10px 20px; font-weight: 700; font-size: 13px; cursor: pointer; text-decoration: none;
  }
  .jcbo-facture-toolbar a.secondary {
    background: transparent; color: #d4a762; border: 1px solid rgba(212,167,98,0.5);
  }
  @media print { .jcbo-facture-toolbar { display: none !important; } }
</style>
<div class="jcbo-facture-toolbar">
  <p>Facture — ${payload.sessionLabel} — ${amountLabel}</p>
  <button type="button" onclick="window.print()">Imprimer / Enregistrer en PDF</button>
  <a class="secondary" href="${successBack}">Retour confirmation</a>
</div>`;

  const page = buildFactureHtml(payload).replace("<body", `${toolbar}<body`);

  return new Response(page, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
};
