/** Référence métier vitrine (évite le conflit avec `reference=trx…` ajouté par NotchPay). */
export function pickVitrineReferenceFromUrl(searchParams: URLSearchParams): string {
  const fromRef = searchParams.get("ref")?.trim();
  if (fromRef?.startsWith("vitrine-")) return fromRef;

  const all = searchParams.getAll("reference");
  const vitrine = all.find((r) => r.startsWith("vitrine-"));
  if (vitrine) return vitrine;

  return fromRef ?? all[0] ?? searchParams.get("trxref")?.trim() ?? "";
}

export function extractPlanIdFromVitrineReference(reference: string): string | null {
  const match = /^vitrine-(INST-[A-Z0-9]+-[A-Z0-9]+)-e\d+-/i.exec(reference);
  return match?.[1] ?? null;
}

export function buildNotchpayCallbackUrl(origin: string, reference: string): string {
  return `${origin}/reservation/succes?provider=notchpay&ref=${encodeURIComponent(reference)}`;
}
