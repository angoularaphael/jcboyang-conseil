export const BASE_SESSION_CATALOG = {
  diagnostic: { label: "Diagnostic Stratégique", priceEur: 490, duration: "2h", priceCfa: "320 000" },
  coaching: { label: "Coaching Stratégique", priceEur: 250, duration: "1h30", priceCfa: "150 000" },
  pack3: { label: "Pack 3 séances Coaching", priceEur: 650, duration: "3 x 1h30", priceCfa: "420 000" },
  premium: { label: "Accompagnement Premium 3 mois", priceEur: 2400, duration: "6 séances", priceCfa: "1 500 000" },
} as const;

export type SessionKey = keyof typeof BASE_SESSION_CATALOG;

export function getSessionCatalog() {
  return BASE_SESSION_CATALOG;
}

export function getSessionKeys(): SessionKey[] {
  return Object.keys(BASE_SESSION_CATALOG) as SessionKey[];
}

export function getReserverSessions() {
  return (Object.entries(BASE_SESSION_CATALOG) as [SessionKey, (typeof BASE_SESSION_CATALOG)[SessionKey]][]).map(
    ([id, info]) => ({
      id,
      title: info.label,
      duration: info.duration,
      priceEur: info.priceEur,
      priceCfa: info.priceCfa,
    })
  );
}
