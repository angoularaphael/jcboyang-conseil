/* empty css                                       */
import { e as createAstro, c as createComponent, f as renderComponent, r as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../../chunks/astro/server_D4iU0DsB.mjs';
import 'kleur/colors';
import { $ as $$Layout, a as $$Header, b as $$Footer } from '../../chunks/Footer_bCwkQopd.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://jcboyang-conseil.vercel.app");
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const apiUrl = "https://adhesion-jcbo.vercel.app";
  let article = null;
  try {
    const res = await fetch(`${apiUrl}/api/public/actualites/${slug}`);
    if (res.ok) {
      const a = await res.json();
      article = {
        title: a.title,
        category: a.category,
        date: new Date(a.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
        content: a.content,
        image: a.image
      };
    }
  } catch {
    article = null;
  }
  if (!article) return Astro2.redirect("/actualites");
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `${article.title} — JCBO Conseil`, "description": article.content.slice(0, 160) }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<div class="pt-24"></div> <article class="max-w-3xl mx-auto px-6 py-16"> <a href="/actualites" class="text-gold text-sm mb-6 inline-block">← Retour aux actualités</a> <span class="text-xs bg-gold/10 text-gold-dark px-3 py-1 rounded-full">${article.category}</span> <p class="text-gray-400 text-sm mt-4">${article.date}</p> <h1 class="font-heading text-3xl font-bold text-navy mt-4 mb-8">${article.title}</h1> ${article.image && renderTemplate`<img${addAttribute(article.image, "src")} alt="" class="w-full rounded-2xl mb-8">`} <div class="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">${article.content}</div> </article> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/actualites/[slug].astro", void 0);
const $$file = "D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/actualites/[slug].astro";
const $$url = "/actualites/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
