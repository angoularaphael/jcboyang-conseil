/** Référence métier vitrine (évite le conflit avec `reference=trx…` ajouté par NotchPay). */
export function pickVitrineReferenceFromUrl(searchParams: URLSearchParams): string {
  const fromRef = searchParams.get("ref")?.trim();
  if (fromRef?.startsWith("vitrine-")) return fromRef;

  const all = searchParams.getAll("reference");
  const vitrine = all.find((r) => r.startsWith("vitrine-"));
  if (vitrine) return vitrine;

  return fromRef ?? all[0] ?? searchParams.get("trxref")?.trim() ?? "";
}

/** Identifiant transaction NotchPay (`trx.test_*`…) ajouté en query par NotchPay. */
export function pickNotchpayTrxIdFromUrl(searchParams: URLSearchParams): string {
  const fromTrx = searchParams.get("trx")?.trim();
  if (fromTrx && !fromTrx.startsWith("vitrine-")) return fromTrx;

  const candidates = [
    ...searchParams.getAll("reference"),
    searchParams.get("trxref")?.trim() ?? "",
  ];
  return candidates.find((r) => r.trim() && !r.startsWith("vitrine-"))?.trim() ?? "";
}

export function extractPlanIdFromVitrineReference(reference: string): string | null {
  const match = /^vitrine-(INST-[A-Z0-9]+-[A-Z0-9]+)-e\d+-/i.exec(reference);
  return match?.[1] ?? null;
}

/** Normalise un identifiant de plan (référence NotchPay tronquée, métadonnées, etc.). */
export function normalizeInstallmentPlanId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fromVitrine = extractPlanIdFromVitrineReference(
    trimmed.startsWith("vitrine-") ? trimmed : `vitrine-${trimmed}`
  );
  if (fromVitrine) return fromVitrine;

  const direct = /^(INST-[A-Z0-9]+-[A-Z0-9]+)$/i.exec(trimmed);
  return direct ? direct[1].toUpperCase() : null;
}

export function extractInstallmentNumberFromVitrineReference(reference: string): number | null {
  const match = /-e(\d+)-/i.exec(reference);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function buildNotchpayLookupKeys(vitrineRef: string, trxId?: string): string[] {
  const keys: string[] = [];
  const add = (key: string) => {
    const trimmed = key.trim();
    if (trimmed && !keys.includes(trimmed)) keys.push(trimmed);
  };
  add(vitrineRef);
  if (trxId) add(trxId);
  return keys;
}

export function buildNotchpayCallbackUrl(origin: string, reference: string): string {
  return `${origin}/reservation/succes?provider=notchpay&ref=${encodeURIComponent(reference)}`;
}
