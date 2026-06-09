import type { SessionId } from "../data/session-catalog";
import { computeInstallmentAmounts } from "../data/session-catalog";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export type InstallmentPlanStatus = "pending" | "partial" | "complete";

export type InstallmentPlan = {
  id: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  company: string;
  desiredDate: string;
  customerMessage: string;
  sessionId: SessionId;
  sessionLabel: string;
  totalXaf: number;
  installmentAmounts: number[];
  paidCount: number;
  paidReferences: string[];
  status: InstallmentPlanStatus;
};

type PlanRow = {
  id: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  company: string;
  desired_date: string;
  customer_message: string;
  session_id: string;
  session_label: string;
  total_xaf: number;
  installment_amounts: number[];
  paid_count: number;
  paid_references: string[];
  status: InstallmentPlanStatus;
};

function mapRow(row: PlanRow): InstallmentPlan {
  return {
    id: row.id,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    company: row.company ?? "",
    desiredDate: row.desired_date ?? "",
    customerMessage: row.customer_message ?? "",
    sessionId: row.session_id as SessionId,
    sessionLabel: row.session_label,
    totalXaf: row.total_xaf,
    installmentAmounts: row.installment_amounts,
    paidCount: row.paid_count,
    paidReferences: row.paid_references ?? [],
    status: row.status,
  };
}

function makePlanId(): string {
  return `INST-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function getInstallmentPaymentUrl(planId: string, origin?: string): string {
  const base = origin ?? import.meta.env.SITE ?? "https://www.jcbo-conseil.com";
  return `${base}/reservation/echeances?plan=${encodeURIComponent(planId)}`;
}

function isMissingTableError(message: string): boolean {
  return /vitrine_installment_plans|relation.*does not exist|schema cache/i.test(message);
}

export async function createInstallmentPlan(input: {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  company?: string;
  desiredDate?: string;
  customerMessage?: string;
  sessionId: SessionId;
  sessionLabel: string;
  totalXaf: number;
}): Promise<{ plan: InstallmentPlan | null; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { plan: null, error: "Base de données non configurée sur le serveur." };
  }
  try {
    const installmentAmounts = computeInstallmentAmounts(input.totalXaf);
    const id = makePlanId();
    const supa = getSupabase();
    const { data, error } = await supa
      .from("vitrine_installment_plans")
      .insert({
        id,
        customer_email: input.customerEmail,
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        company: input.company ?? "",
        desired_date: input.desiredDate ?? "",
        customer_message: input.customerMessage ?? "",
        session_id: input.sessionId,
        session_label: input.sessionLabel,
        total_xaf: input.totalXaf,
        installment_amounts: installmentAmounts,
        paid_count: 0,
        paid_references: [],
        status: "pending",
      })
      .select()
      .single();

    if (error || !data) {
      console.error("[installment] création échouée :", error);
      const msg = error?.message ?? "";
      if (isMissingTableError(msg)) {
        return {
          plan: null,
          error: "Le suivi des échéances n'est pas encore activé. Contactez le support ou réessayez plus tard.",
        };
      }
      return { plan: null, error: "Impossible d'enregistrer le plan de paiement." };
    }
    return { plan: mapRow(data as PlanRow) };
  } catch (err) {
    console.error("[installment] création exception :", err);
    return { plan: null, error: "Erreur technique lors de la préparation du paiement." };
  }
}

export async function getInstallmentPlan(planId: string): Promise<InstallmentPlan | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supa = getSupabase();
    const { data, error } = await supa
      .from("vitrine_installment_plans")
      .select("*")
      .eq("id", planId)
      .maybeSingle();
    if (error || !data) return null;
    return mapRow(data as PlanRow);
  } catch {
    return null;
  }
}

export function getNextInstallmentAmount(plan: InstallmentPlan): number | null {
  if (plan.paidCount >= plan.installmentAmounts.length) return null;
  return plan.installmentAmounts[plan.paidCount];
}

export function getNextInstallmentNumber(plan: InstallmentPlan): number | null {
  if (plan.paidCount >= plan.installmentAmounts.length) return null;
  return plan.paidCount + 1;
}

export async function recordInstallmentPayment(
  planId: string,
  reference: string,
  installmentNumber: number
): Promise<InstallmentPlan | null> {
  const plan = await getInstallmentPlan(planId);
  if (!plan) return null;
  if (plan.paidReferences.includes(reference)) return plan;
  if (installmentNumber !== plan.paidCount + 1) return null;

  const newPaidCount = plan.paidCount + 1;
  const totalInstallments = plan.installmentAmounts.length;
  const status: InstallmentPlanStatus =
    newPaidCount >= totalInstallments ? "complete" : "partial";
  const paidReferences = [...plan.paidReferences, reference];

  if (!isSupabaseConfigured()) return null;
  try {
    const supa = getSupabase();
    const { data, error } = await supa
      .from("vitrine_installment_plans")
      .update({
        paid_count: newPaidCount,
        paid_references: paidReferences,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", planId)
      .select()
      .single();

    if (error || !data) {
      console.error("[installment] mise à jour échouée :", error);
      return null;
    }
    return mapRow(data as PlanRow);
  } catch {
    return null;
  }
}
