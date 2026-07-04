import type { APIRoute } from "astro";
import { SITE_URL } from "../lib/seo";

import { apiUrl as API_URL } from "../data/site-config";

const STATIC_PATHS = [
  "/",
  "/a-propos",
  "/methode",
  "/prestations",
  "/offres",
  "/seminaires",
  "/reserver",
  "/actualites",
  "/livres",
  "/ressources",
  "/contact",
  "/faq",
  "/resultats",
  "/mentions-legales",
];

async function getArticleSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/api/public/actualites`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { articles?: { slug: string }[] };
    return (data.articles ?? []).map((a) => a.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split("T")[0];
  const slugs = await getArticleSlugs();
  const paths = [...STATIC_PATHS, ...slugs.map((s) => `/actualites/${s}`)];

  const urls = paths
    .map(
      (path) =>
        `<url><loc>${SITE_URL}${path}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${path === "/" ? "1.0" : path.startsWith("/actualites/") ? "0.7" : "0.8"}</priority></url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
