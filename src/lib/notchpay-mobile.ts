const NOTCHPAY_BASE = "https://api.notchpay.co";

/** Numéro E.164 (+237…) requis par NotchPay. */
export function normalizePhoneE164(phone: string): string {
  const cleaned = phone.replace(/[\s\-().]/g, "");
  if (!cleaned) return "";
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

/** Canal Mobile Money NotchPay déduit de l'indicatif / préfixe opérateur. */
export function resolveMobileMoneyChannel(phone: string): string | null {
  const p = normalizePhoneE164(phone);
  if (!p) return null;
  if (/^\+23767/.test(p)) return "cm.mtn";
  if (/^\+23769/.test(p)) return "cm.orange";
  if (/^\+23768/.test(p)) return "cm.mobile";
  if (/^\+23766/.test(p)) return "cm.yoomee";
  if (/^\+22507/.test(p)) return "ci.mtn";
  if (/^\+2250[157]/.test(p)) return "ci.orange";
  if (/^\+2217/.test(p)) return "sn.orange";
  if (/^\+22176/.test(p)) return "sn.wave";
  if (/^\+254/.test(p)) return "ke.mpesa";
  if (/^\+256/.test(p)) return "ug.airtel";
  if (/^\+233/.test(p)) return "gh.mtn";
  if (/^\+237/.test(p)) return "cm.mobile";
  return null;
}

export function buildNotchpayPollingUrl(origin: string, reference: string): string {
  return `${origin}/reservation/succes?provider=notchpay&ref=${encodeURIComponent(reference)}`;
}

/**
 * Étape 2 du flux NotchPay : déclenche le débit Mobile Money sur le numéro indiqué.
 * Sans cet appel, NotchPay peut réutiliser le numéro de la 1ʳᵉ échéance.
 */
export async function processNotchpayMobileMoney(
  reference: string,
  phone: string,
  notchPayKey: string
): Promise<{ ok: true } | { error: string }> {
  const normalized = normalizePhoneE164(phone);
  const channel = resolveMobileMoneyChannel(normalized);
  if (!channel) {
    return {
      error:
        "Numéro Mobile Money non reconnu. Utilisez l'indicatif pays (ex. +237670000000 pour MTN Cameroun).",
    };
  }

  try {
    const res = await fetch(`${NOTCHPAY_BASE}/payments/${encodeURIComponent(reference)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: notchPayKey,
      },
      body: JSON.stringify({
        channel,
        data: { phone: normalized },
      }),
    });

    if (!res.ok) {
      let message = "Impossible de lancer le paiement Mobile Money.";
      try {
        const data = (await res.json()) as { message?: string };
        if (data.message) message = data.message;
      } catch {
        /* corps non JSON */
      }
      return { error: message };
    }

    return { ok: true };
  } catch (err) {
    console.error("[notchpay] process Mobile Money échoué :", err);
    return { error: "Connexion au service Mobile Money impossible." };
  }
}
