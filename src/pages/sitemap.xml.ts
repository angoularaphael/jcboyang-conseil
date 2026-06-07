import type { APIRoute } from "astro";

const SITE = "https://www.jcbo-conseil.com";

const STATIC_PATHS = [
  "/",
  "/a-propos",
  "/methode",
  "/prestations",
  "/offres",
  "/seminaires",
  "/reserver",
  "/actualites",
  "/ressources",
  "/contact",
  "/faq",
  "/resultats",
  "/mentions-legales",
];

export const GET: APIRoute = async () => {
  const urls = STATIC_PATHS.map(
    (path) =>
      `<url><loc>${SITE}${path}</loc><changefreq>weekly</changefreq><priority>${path === "/" ? "1.0" : "0.8"}</priority></url>`
  ).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
