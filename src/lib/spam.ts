/** Champ honeypot : les bots le remplissent, pas les humains. */
export function isHoneypotFilled(raw: Record<string, unknown>): boolean {
  const trap = raw.website ?? raw.url ?? raw.company_url;
  return typeof trap === "string" && trap.trim().length > 0;
}

/** Détecte les chaînes aléatoires typiques des spam bots (ex. JuwiQYfJQhxVneiHjIanRisi). */
export function isGibberishText(value: string): boolean {
  const t = value.trim();
  if (t.length < 12 || /\s/.test(t)) return false;
  if (!/^[A-Za-z0-9]+$/.test(t)) return false;

  const vowels = (t.match(/[aeiouAEIOUàâéèêëîïôùûü]/gi) ?? []).length;
  if (vowels / t.length < 0.18) return true;

  let caseChanges = 0;
  for (let i = 1; i < t.length; i++) {
    const prevUpper = t[i - 1] === t[i - 1].toUpperCase();
    const currUpper = t[i] === t[i].toUpperCase();
    if (prevUpper !== currUpper) caseChanges++;
  }
  return caseChanges >= 4;
}

export function looksLikeBotSubmission(
  name: string,
  extraFields: Record<string, string>
): boolean {
  if (isGibberishText(name)) return true;

  const gibberishFields = Object.values(extraFields).filter((v) => isGibberishText(v));
  return gibberishFields.length >= 2;
}
