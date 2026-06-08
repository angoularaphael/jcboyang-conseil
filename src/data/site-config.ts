/** Domaines de production (plus de liens vercel.app côté frontend). */
const PRODUCTION_ADHESION = "https://www.adhesion-jcbo-conseil.com";
const PRODUCTION_VITRINE = "https://www.jcbo-conseil.com";

function resolvePublicUrl(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.includes("vercel.app")) return fallback;
  return trimmed;
}

/** Liens utilisateur vers l'espace adhérent / marketplace */
export const adhesionUrl = resolvePublicUrl(
  import.meta.env.PUBLIC_ADHESION_URL ?? import.meta.env.PUBLIC_API_URL,
  PRODUCTION_ADHESION
);

/** Appels API backend (actualités, ressources, maintenance…) */
export const apiUrl = resolvePublicUrl(
  import.meta.env.PUBLIC_API_URL,
  PRODUCTION_ADHESION
);

/** URL canonique de la vitrine */
export const vitrineUrl = resolvePublicUrl(
  import.meta.env.PUBLIC_VITRINE_URL,
  PRODUCTION_VITRINE
);

/** Lien marketplace adhérent */
export const marketplaceUrl = `${adhesionUrl}/adherent/marketplace`;
