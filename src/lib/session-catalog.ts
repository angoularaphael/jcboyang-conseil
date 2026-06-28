export const BASE_SESSION_CATALOG = {
  diagnostic: { label: "Diagnostic Stratégique", priceEur: 490, duration: "2h", priceCfa: "320 000" },
  coaching: { label: "Coaching Stratégique", priceEur: 250, duration: "1h30", priceCfa: "150 000" },
  pack3: { label: "Pack 3 séances Coaching", priceEur: 650, duration: "3 x 1h30", priceCfa: "420 000" },
  premium: { label: "Accompagnement Premium 3 mois", priceEur: 2400, duration: "6 séances", priceCfa: "1 500 000" },
} as const;

export const TEST_SESSION = {
  test1e: { label: "Test paiement live 1 €", priceEur: 1, duration: "Test", priceCfa: "655" },
} as const;

export type BaseSessionKey = keyof typeof BASE_SESSION_CATALOG;
export type TestSessionKey = keyof typeof TEST_SESSION;
export type SessionKey = BaseSessionKey | TestSessionKey;

export type TestCheckoutOptions = {
  /** Cookie mode développeur (bypass maintenance vitrine). */
  devBypass?: boolean;
};

export function isTestCheckoutEnabled(options: TestCheckoutOptions = {}): boolean {
  return options.devBypass === true;
}

export function getSessionCatalog(options: TestCheckoutOptions = {}) {
  if (!isTestCheckoutEnabled(options)) return BASE_SESSION_CATALOG;
  return { ...BASE_SESSION_CATALOG, ...TEST_SESSION };
}

export function getSessionKeys(options: TestCheckoutOptions = {}): SessionKey[] {
  return Object.keys(getSessionCatalog(options)) as SessionKey[];
}

export function getReserverSessions(options: TestCheckoutOptions = {}) {
  const catalog = getSessionCatalog(options);
  const entries = Object.entries(catalog) as [SessionKey, (typeof catalog)[SessionKey]][];
  const sorted = isTestCheckoutEnabled(options)
    ? [...entries].sort(([a], [b]) => {
        if (a === "test1e") return -1;
        if (b === "test1e") return 1;
        return 0;
      })
    : entries;

  return sorted.map(([id, info]) => ({
    id,
    title: info.label,
    duration: info.duration,
    priceEur: info.priceEur,
    priceCfa: info.priceCfa,
    isTest: id === "test1e",
  }));
}
