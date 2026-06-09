import type { APIRoute } from "astro";
import {
  getInstallmentPaymentUrl,
  getInstallmentPlan,
  getNextInstallmentAmount,
  getNextInstallmentNumber,
} from "../../lib/installment-plans";

export const GET: APIRoute = async ({ url, request }) => {
  const planId = url.searchParams.get("plan")?.trim();
  if (!planId) {
    return new Response(JSON.stringify({ error: "plan manquant" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const plan = await getInstallmentPlan(planId);
  if (!plan) {
    return new Response(JSON.stringify({ error: "Plan introuvable" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const origin = new URL(request.url).origin;
  const nextNumber = getNextInstallmentNumber(plan);
  const nextAmount = getNextInstallmentAmount(plan);

  return new Response(
    JSON.stringify({
      id: plan.id,
      sessionLabel: plan.sessionLabel,
      totalXaf: plan.totalXaf,
      installmentAmounts: plan.installmentAmounts,
      paidCount: plan.paidCount,
      totalInstallments: plan.installmentAmounts.length,
      status: plan.status,
      complete: plan.status === "complete",
      nextInstallmentNumber: nextNumber,
      nextInstallmentAmount: nextAmount,
      paymentUrl: getInstallmentPaymentUrl(plan.id, origin),
      customerEmail: plan.customerEmail,
      customerName: plan.customerName,
      customerPhone: plan.customerPhone,
      sessionId: plan.sessionId,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
