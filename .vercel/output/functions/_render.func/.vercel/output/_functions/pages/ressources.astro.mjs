/* empty css                                    */
import { c as createComponent, f as renderComponent, r as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_D4iU0DsB.mjs';
import 'kleur/colors';
import { $ as $$Layout, a as $$Header, b as $$Footer } from '../chunks/Footer_bCwkQopd.mjs';
export { renderers } from '../renderers.mjs';

const $$Ressources = createComponent(($$result, $$props, $$slots) => {
  const resources = [
    {
      title: "Guide : Les 7 leviers pour doubler votre CA",
      desc: "Un guide complet de 25 pages avec les strat\xE9gies concr\xE8tes utilis\xE9es par nos clients pour multiplier leur chiffre d'affaires.",
      category: "Strat\xE9gie",
      pages: "25 pages",
      icon: "M22 12h-4l-3 9L9 3l-3 9H2"
    },
    {
      title: "Checklist : Structurer une offre irr\xE9sistible",
      desc: "La checklist pas-\xE0-pas pour construire une offre qui convertit. Format actionnable et imm\xE9diat.",
      category: "Vente",
      pages: "8 pages",
      icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2|M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2|M9 14l2 2 4-4"
    },
    {
      title: "Mindset Entrepreneurial : Les 5 piliers",
      desc: "D\xE9couvrez les 5 piliers du mindset qui distinguent les entrepreneurs qui r\xE9ussissent de ceux qui stagnent.",
      category: "Mindset",
      pages: "18 pages",
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    },
    {
      title: "Vendeur Attitude : Le manifeste",
      desc: "Les principes fondamentaux de la m\xE9thode Vendeur Attitude. La posture, les techniques, l'\xE9tat d'esprit du vendeur d'\xE9lite.",
      category: "Vendeur Attitude",
      pages: "15 pages",
      icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z"
    },
    {
      title: "Template : Plan d'action commercial 90 jours",
      desc: "Le template Excel/PDF utilis\xE9 par JCBO Conseil pour planifier les 90 premiers jours d'une strat\xE9gie commerciale.",
      category: "Strat\xE9gie",
      pages: "12 pages + template",
      icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"
    },
    {
      title: "Guide : N\xE9gociation pour dirigeants PME",
      desc: "Techniques de n\xE9gociation \xE9prouv\xE9es adapt\xE9es aux r\xE9alit\xE9s des PME/TPE. Cas pratiques inclus.",
      category: "Vente",
      pages: "20 pages",
      icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M23 21v-2a4 4 0 0 0-3-3.87|M16 3.13a4 4 0 0 1 0 7.75"
    }
  ];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Ressources Gratuites \u2014 JCBO Conseil | Guides PDF & Outils", "description": "T\xE9l\xE9chargez gratuitement nos guides PDF, checklists et templates pour d\xE9velopper votre activit\xE9. Strat\xE9gie, mindset, vente." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<div class="pt-24"></div>  <section class="py-16 bg-navy text-white text-center"> <div class="max-w-[800px] mx-auto px-6"> <span class="inline-block font-accent italic text-gold text-sm uppercase tracking-[0.1em] mb-3">Bibliothèque gratuite</span> <h1 class="font-heading text-[clamp(1.8rem,4vw,2.8rem)] font-bold mb-4">Nos <span class="text-gold">Ressources</span></h1> <div class="w-14 h-0.5 bg-gold mx-auto mb-5"></div> <p class="text-white/60">Guides PDF, checklists et templates pour passer à l'action. Gratuit, concret et téléchargeable immédiatement.</p> </div> </section>  <section class="py-16 bg-offwhite"> <div class="max-w-[1200px] mx-auto px-6"> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> ${resources.map((r, i) => renderTemplate`<div class="bg-white rounded-2xl border border-gold/10 p-7 hover:-translate-y-1 hover:shadow-lg transition-all group"> <div class="flex items-start gap-4 mb-5"> <div class="flex-shrink-0 w-14 h-14 bg-navy rounded-2xl flex items-center justify-center"> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4a762" stroke-width="2">${r.icon.split("|").map((d) => renderTemplate`<path${addAttribute(d, "d")}></path>`)}</svg> </div> <div> <span class="text-xs font-medium bg-gold/10 text-gold-dark px-3 py-1 rounded-full">${r.category}</span> <p class="text-xs text-gray-400 mt-1">${r.pages}</p> </div> </div> <h3 class="font-heading text-lg font-bold text-navy mb-2 group-hover:text-gold transition-colors">${r.title}</h3> <p class="text-gray-500 text-sm mb-6 leading-relaxed">${r.desc}</p> <button class="download-btn w-full flex items-center justify-center gap-2 bg-navy text-white font-bold py-3 rounded-xl hover:bg-gold hover:text-navy transition-all"${addAttribute(r.title, "data-resource")}> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
Télécharger gratuitement
</button> </div>`)} </div> </div> </section>  <div id="downloadModal" class="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 invisible transition-all duration-300"> <div class="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl"> <button id="closeModal" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-offwhite flex items-center justify-center text-gray-400 hover:text-navy transition-colors"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> </button> <div class="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-5"> <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4a762" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> </div> <h3 class="font-heading text-xl font-bold text-navy text-center mb-2">Téléchargement gratuit</h3> <p class="text-gray-500 text-sm text-center mb-1" id="modal-resource-name">—</p> <p class="text-gray-400 text-xs text-center mb-6">Entrez votre email pour recevoir le document et nos meilleurs conseils.</p> <form id="downloadForm" class="space-y-4"> <div> <label class="block text-sm font-semibold text-navy mb-1.5">Nom & Prénom</label> <input type="text" name="dl-name" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none text-sm" placeholder="Jean-Christophe Dupont"> </div> <div> <label class="block text-sm font-semibold text-navy mb-1.5">Email professionnel <span class="text-red-500">*</span></label> <input type="email" name="dl-email" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none text-sm" placeholder="email@entreprise.com"> </div> <label class="flex items-start gap-2"> <input type="checkbox" name="dl-newsletter" checked class="w-4 h-4 mt-0.5 accent-[#d4a762]"> <span class="text-xs text-gray-500">J'accepte de recevoir les conseils et actualités de JCBO Conseil</span> </label> <button type="submit" class="w-full bg-gold text-navy font-bold py-3.5 rounded-full hover:bg-gold-light transition-all">
Recevoir le document
</button> </form> <p class="text-xs text-gray-400 text-center mt-4">Vos données sont protégées. Pas de spam, désinscription en 1 clic.</p> </div> </div>  <section class="py-14 bg-navy text-center"> <div class="max-w-[700px] mx-auto px-6"> <h2 class="font-heading text-2xl font-bold text-white mb-4">Besoin d'un accompagnement <span class="text-gold">personnalisé</span> ?</h2> <p class="text-white/50 mb-8">Nos ressources gratuites sont un bon début. Pour aller plus loin, réservez une séance.</p> <div class="flex items-center justify-center gap-4 flex-wrap"> <a href="/reserver" class="inline-flex items-center gap-2 bg-gold text-navy font-bold py-3.5 px-8 rounded-full hover:bg-gold-light transition-all">Réserver une séance</a> <a href="/prestations" class="inline-flex items-center gap-2 border border-white/30 text-white font-bold py-3.5 px-8 rounded-full hover:border-gold hover:text-gold transition-all">Nos prestations</a> </div> </div> </section> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })} `;
}, "D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/ressources.astro", void 0);

const $$file = "D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/ressources.astro";
const $$url = "/ressources";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Ressources,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
