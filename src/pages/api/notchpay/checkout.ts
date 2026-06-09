import type { APIRoute } from "astro";
import { z } from "zod";
import {
  needsInstallments,
  SESSION_CATALOG,
  type SessionId,
} from "../../../data/session-catalog";
import {
  createInstallmentPlan,
  getInstallmentPlan,
  getNextInstallmentAmount,
  getNextInstallmentNumber,
} from "../../../lib/installment-plans";

const BASE_URL = "https://api.notchpay.co";

const bodySchema = z.object({
  sessionId: z.enum(["diagnostic", "coaching", "pack3", "premium"]),
  name: z.string().min(2).max(120).trim(),
  email: z.string().email().max(200).trim().toLowerCase(),
  phone: z.string().min(4).max(40).trim(),
  company: z.string().max(120).trim().optional().default(""),
  date: z.string().max(40).trim().optional().default(""),
  message: z.string().max(2000).trim().optional().default(""),
  planId: z.string().max(80).trim().optional(),
});

function parseNotchpayError(raw: string): string {
  try {
    const data = JSON.parse(raw) as { message?: string; errors?: { amount?: string[] } };
    if (data.errors?.amount?.[0]) {
      return "Montant trop élevé pour Mobile Money (maximum 500 000 FCFA par paiement).";
    }
    if (data.message) return data.message;
  } catch {
    /* texte brut */
  }
  return "Impossible d'initialiser le paiement Mobile Money.";
}

async function initNotchpayPayment(params: {
  amountXaf: number;
  reference: string;
  origin: string;
  customer: { name: string; email: string; phone: string };
  description: string;
  metadata: Record<string, string>;
  notchPayKey: string;
  connectedAccountId?: string;
}): Promise<{ url: string; reference: string } | { error: string }> {
  const applicationFee = Math.round(params.amountXaf * 0.2);
  const paymentBody: Record<string, unknown> = {
    amount: params.amountXaf,
    currency: "XAF",
    customer: params.customer,
    description: params.description,
    reference: params.reference,
    callback: `${params.origin}/reservation/succes?provider=notchpay&reference=${encodeURIComponent(params.reference)}`,
    metadata: params.metadata,
  };

  if (applicationFee && params.connectedAccountId) {
    paymentBody.application_fee = applicationFee;
    paymentBody.destination = {
      account: params.connectedAccountId,
      amount: params.amountXaf - applicationFee,
    };
  }

  const res = await fetch(`${BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: params.notchPayKey,
    },
    body: JSON.stringify(paymentBody),
  });

  if (!res.ok) {
    return { error: parseNotchpayError(await res.text()) };
  }

  const result = await res.json();
  const authUrl = result.authorization_url ?? result.transaction?.authorization_url ?? "";
  if (!authUrl) return { error: "URL de paiement introuvable" };
  return { url: authUrl, reference: params.reference };
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
  const origin = new URL(request.url).origin;
  const connectedAccountId = import.meta.env.NOTCHPAY_CONNECTED_ACCOUNT_ID;
  const customer = { name: data.name, email: data.email, phone: data.phone };

  const baseMeta = {
    source: "vitrine",
    customerName: data.name,
    customerEmail: data.email,
    customerPhone: data.phone,
    customerCompany: data.company,
    desiredDate: data.date,
    customerMessage: data.message,
  };

  // ── Paiement d'une échéance suivante ─────────────────────────────
  if (data.planId) {
    const plan = await getInstallmentPlan(data.planId);
    if (!plan) {
      return new Response(JSON.stringify({ error: "Plan de paiement introuvable." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (plan.status === "complete") {
      return new Response(JSON.stringify({ error: "Toutes les échéances sont déjà payées." }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (plan.customerEmail.toLowerCase() !== data.email.toLowerCase()) {
      return new Response(JSON.stringify({ error: "E-mail non reconnu pour ce plan." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const installmentNumber = getNextInstallmentNumber(plan);
    const amountXaf = getNextInstallmentAmount(plan);
    if (!installmentNumber || amountXaf == null) {
      return new Response(JSON.stringify({ error: "Aucune échéance en attente." }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    const reference = `vitrine-${plan.id}-e${installmentNumber}-${Date.now()}`;
    const result = await initNotchpayPayment({
      amountXaf,
      reference,
      origin,
      customer,
      description: `${plan.sessionLabel} — échéance ${installmentNumber}/${plan.installmentAmounts.length}`,
      notchPayKey,
      connectedAccountId,
      metadata: {
        ...baseMeta,
        sessionId: plan.sessionId,
        sessionLabel: plan.sessionLabel,
        amountXaf: String(amountXaf),
        planId: plan.id,
        installmentNumber: String(installmentNumber),
        installmentTotal: String(plan.installmentAmounts.length),
        totalXaf: String(plan.totalXaf),
      },
    });

    if ("error" in result) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        url: result.url,
        reference: result.reference,
        planId: plan.id,
        installmentNumber,
        installmentTotal: plan.installmentAmounts.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Nouveau paiement ─────────────────────────────────────────────
  const sessionInfo = SESSION_CATALOG[data.sessionId as SessionId];
  const totalXaf = sessionInfo.priceXaf;

  if (needsInstallments(totalXaf)) {
    const plan = await createInstallmentPlan({
      customerEmail: data.email,
      customerName: data.name,
      customerPhone: data.phone,
      company: data.company,
      desiredDate: data.date,
      customerMessage: data.message,
      sessionId: data.sessionId,
      sessionLabel: sessionInfo.label,
      totalXaf,
    });

    if (!plan) {
      return new Response(
        JSON.stringify({ error: "Impossible de créer le plan de paiement en plusieurs fois." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const installmentNumber = 1;
    const amountXaf = plan.installmentAmounts[0];
    const reference = `vitrine-${plan.id}-e1-${Date.now()}`;

    const result = await initNotchpayPayment({
      amountXaf,
      reference,
      origin,
      customer,
      description: `${sessionInfo.label} — échéance 1/${plan.installmentAmounts.length}`,
      notchPayKey,
      connectedAccountId,
      metadata: {
        ...baseMeta,
        sessionId: data.sessionId,
        sessionLabel: sessionInfo.label,
        amountXaf: String(amountXaf),
        planId: plan.id,
        installmentNumber: "1",
        installmentTotal: String(plan.installmentAmounts.length),
        totalXaf: String(totalXaf),
      },
    });

    if ("error" in result) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        url: result.url,
        reference: result.reference,
        planId: plan.id,
        installmentNumber: 1,
        installmentTotal: plan.installmentAmounts.length,
        installments: true,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Paiement unique ──────────────────────────────────────────────
  const reference = `vitrine-${data.sessionId}-${Date.now()}`;
  const result = await initNotchpayPayment({
    amountXaf: totalXaf,
    reference,
    origin,
    customer,
    description: `${sessionInfo.label} — JCBO Conseil`,
    notchPayKey,
    connectedAccountId,
    metadata: {
      ...baseMeta,
      sessionId: data.sessionId,
      sessionLabel: sessionInfo.label,
      amountXaf: String(totalXaf),
    },
  });

  if ("error" in result) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ url: result.url, reference }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
