/* empty css                                    */
import { c as createComponent, m as maybeRenderHead, d as addAttribute, r as renderTemplate, f as renderComponent } from '../chunks/astro/server_D4iU0DsB.mjs';
import 'kleur/colors';
import { $ as $$Layout, a as $$Header, b as $$Footer } from '../chunks/Footer_bCwkQopd.mjs';
import 'clsx';
import { $ as $$Testimonials } from '../chunks/Testimonials_QXac1tRw.mjs';
export { renderers } from '../renderers.mjs';

const $$Results = createComponent(($$result, $$props, $$slots) => {
  const images = [
    { src: "/images/2019/Forum AKOMCA 2019_1.jpg", alt: "Forum AKOMCA 2019", label: "Forum AKOMCA 2019", cat: "2019" },
    { src: "/images/2019/Forum AKOMCA 2019_2.jpeg", alt: "Forum AKOMCA 2019 - Networking", label: "Networking AKOMCA", cat: "2019" },
    { src: "/images/2019/Forum AKOMCA 2019_3.jpeg", alt: "Forum AKOMCA 2019 - Business", label: "Business Development", cat: "2019" },
    { src: "/images/aout2025/S\xE9minaire ao\xFBt 2025 3.jpeg", alt: "S\xE9minaire international ao\xFBt 2025", label: "S\xE9minaire Ao\xFBt 2025", cat: "aout25", large: true },
    { src: "/images/aout2025/S\xE9minaire ao\xFBt 2025 1.jpeg", alt: "Session de formation ao\xFBt 2025", label: "Formation", cat: "aout25" },
    { src: "/images/aout2025/P1160890.JPG", alt: "Moments forts s\xE9minaire ao\xFBt 2025", label: "Team Building", cat: "aout25" },
    { src: "/images/dec2025/P1170148.JPG", alt: "\xC9v\xE9nement d\xE9cembre 2025", label: "\xC9v\xE9nement D\xE9c 2025", cat: "dec25", large: true },
    { src: "/images/dec2025/P1170240.JPG", alt: "Networking d\xE9cembre 2025", label: "Networking", cat: "dec25" },
    { src: "/images/dec2025/P1170274.JPG", alt: "Conf\xE9rences d\xE9cembre 2025", label: "Conf\xE9rences", cat: "dec25" },
    { src: "/images/dec2025/P1170329.JPG", alt: "Cl\xF4ture \xE9v\xE9nement d\xE9cembre 2025", label: "Cl\xF4ture annuelle", cat: "dec25" },
    { src: "/images/dec2025/P1170344.JPG", alt: "\xC9quipe d\xE9cembre 2025", label: "Coh\xE9sion", cat: "dec25" },
    { src: "/images/2022/1744134541505.jpg", alt: "\xC9v\xE9nement JCBO 2022", label: "\xC9v\xE9nement 2022", cat: "2022" }
  ];
  return renderTemplate`${maybeRenderHead()}<section class="py-20 md:py-28 bg-navy text-white" id="resultats"> <div class="max-w-[1200px] mx-auto px-6"> <div class="text-center mb-14" data-animate="fade-up"> <span class="inline-block font-accent italic text-gold text-sm uppercase tracking-[0.1em] mb-2">Preuves terrain</span> <h2 class="font-heading text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-white mb-4">Nos <span class="text-gold">Résultats</span> en images</h2> <div class="w-14 h-0.5 bg-gold mx-auto mb-5"></div> <p class="text-white/50 max-w-lg mx-auto">Séminaires, formations et événements internationaux — la preuve par l'action.</p> </div> <!-- Filters --> <div class="flex justify-center gap-3 flex-wrap mb-10" data-animate="fade-up"> <button class="filter-btn active bg-gold text-navy px-5 py-2 rounded-full text-xs font-semibold transition-all" data-filter="all">Tous</button> <button class="filter-btn border border-gold/30 text-white/50 px-5 py-2 rounded-full text-xs font-semibold hover:bg-gold hover:text-navy transition-all" data-filter="2019">AKOMCA 2019</button> <button class="filter-btn border border-gold/30 text-white/50 px-5 py-2 rounded-full text-xs font-semibold hover:bg-gold hover:text-navy transition-all" data-filter="aout25">Août 2025</button> <button class="filter-btn border border-gold/30 text-white/50 px-5 py-2 rounded-full text-xs font-semibold hover:bg-gold hover:text-navy transition-all" data-filter="dec25">Déc 2025</button> </div> <!-- Gallery Grid --> <div class="grid grid-cols-2 md:grid-cols-4 gap-3" id="galleryGrid"> ${images.map((img, i) => renderTemplate`<div${addAttribute([
    "gallery-item group relative rounded-xl overflow-hidden cursor-pointer aspect-square",
    img.large && "md:col-span-2 md:row-span-2"
  ], "class:list")}${addAttribute(img.cat, "data-category")}> <img${addAttribute(img.src, "src")}${addAttribute(img.alt, "alt")} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"> <div class="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4"> <span class="text-gold text-xs font-bold uppercase tracking-wider">${img.cat.replace("25", "")}</span> <span class="text-white text-sm font-heading">${img.label}</span> </div> </div>`)} </div> </div> <!-- Lightbox --> <div id="lightbox" class="fixed inset-0 bg-navy/95 z-[10000] flex items-center justify-center opacity-0 invisible transition-all"> <button class="lightbox-close absolute top-5 right-5 text-white text-4xl hover:text-gold transition-colors" aria-label="Fermer">&times;</button> <button class="lightbox-prev absolute left-5 top-1/2 -translate-y-1/2 text-white text-3xl hover:text-gold transition-colors" aria-label="Précédent">&#10094;</button> <button class="lightbox-next absolute right-5 top-1/2 -translate-y-1/2 text-white text-3xl hover:text-gold transition-colors" aria-label="Suivant">&#10095;</button> <img id="lightboxImg" src="" alt="" class="max-w-[90%] max-h-[85vh] rounded-xl object-contain"> </div> </section>`;
}, "D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/components/Results.astro", void 0);

const $$Resultats = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Nos R\xE9sultats \u2014 JCBO Conseil | Preuves Terrain", "description": "S\xE9minaires, formations et \xE9v\xE9nements internationaux. D\xE9couvrez nos r\xE9sultats en images et les t\xE9moignages de nos clients." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<div class="pt-24"></div> ${renderComponent($$result2, "Results", $$Results, {})} ${renderComponent($$result2, "Testimonials", $$Testimonials, {})}  <section class="py-16 bg-offwhite text-center"> <div class="max-w-[700px] mx-auto px-6"> <h2 class="font-heading text-2xl font-bold text-navy mb-4">Rejoignez nos <span class="text-gold">clients satisfaits</span></h2> <p class="text-gray-500 mb-8">Vous aussi, transformez votre activité avec un accompagnement expert.</p> <a href="/contact" class="inline-flex items-center gap-2 bg-gold text-navy font-bold py-3.5 px-8 rounded-full hover:bg-gold-light transition-all">Être recontacté</a> </div> </section> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/resultats.astro", void 0);

const $$file = "D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/resultats.astro";
const $$url = "/resultats";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Resultats,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
