/* empty css                                    */
import { c as createComponent, m as maybeRenderHead, d as addAttribute, u as unescapeHTML, r as renderTemplate, f as renderComponent } from '../chunks/astro/server_D4iU0DsB.mjs';
import 'kleur/colors';
import { $ as $$Layout, a as $$Header, b as $$Footer } from '../chunks/Footer_bCwkQopd.mjs';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$FAQ = createComponent(($$result, $$props, $$slots) => {
  const faqs = [
    {
      q: "Combien de temps pour voir des r\xE9sultats concrets ?",
      a: "Les premiers r\xE9sultats sont visibles <strong>d\xE8s les 30 premiers jours</strong> gr\xE2ce \xE0 notre m\xE9thode d'audit-action. En moyenne, nos clients constatent +35% de CA dans les 12 mois suivant l'accompagnement."
    },
    {
      q: "L'audit strat\xE9gique est-il vraiment gratuit ?",
      a: "Oui, le premier appel de 30 minutes est <strong>100% gratuit et sans engagement</strong>. Il permet d'identifier vos leviers de croissance et de d\xE9terminer si un accompagnement JCBO Conseil r\xE9pond \xE0 vos enjeux."
    },
    {
      q: "\xC0 qui s'adresse JCBO Conseil ?",
      a: "Aux <strong>dirigeants de PME/TPE</strong>, responsables commerciaux et entrepreneurs qui veulent structurer leur strat\xE9gie commerciale et acc\xE9l\xE9rer leur croissance. Nos clients op\xE8rent en France et \xE0 l'international."
    },
    {
      q: "Quelle diff\xE9rence entre conseil, formation et coaching ?",
      a: "Le <strong>conseil</strong> vous apporte une strat\xE9gie cl\xE9 en main. La <strong>formation</strong> transmet des comp\xE9tences concr\xE8tes \xE0 vos \xE9quipes. Le <strong>coaching</strong> accompagne individuellement le dirigeant. Les trois peuvent se combiner."
    },
    {
      q: "Intervenez-vous en dehors de Toulouse ?",
      a: "Oui \u2014 toute la France, Cameroun, Afrique. Nous organisons des s\xE9minaires \xE0 l'international et proposons un <strong>accompagnement en visioconf\xE9rence</strong> pour les clients distants."
    },
    {
      q: "Comment se d\xE9roule un accompagnement type ?",
      a: "4 \xE9tapes : 1) Appel d\xE9couverte gratuit, 2) Audit strat\xE9gique, 3) Plan d'action personnalis\xE9 avec objectifs mesurables, 4) <strong>Accompagnement terrain</strong> et suivi des r\xE9sultats."
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section class="py-20 md:py-28 bg-offwhite" id="faq"> <div class="max-w-[800px] mx-auto px-6"> <div class="text-center mb-14" data-animate="fade-up"> <span class="inline-block font-accent italic text-gold text-sm uppercase tracking-[0.1em] mb-2">Vos questions</span> <h2 class="font-heading text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-navy mb-4">Questions <span class="text-gold">fréquentes</span></h2> <div class="w-14 h-0.5 bg-gold mx-auto"></div> </div> <div class="space-y-3"> ${faqs.map((faq, i) => renderTemplate`<div class="faq-item border border-gold/15 rounded-xl overflow-hidden bg-white hover:border-gold/30 transition-all" data-animate="fade-up"${addAttribute(String(i * 80), "data-delay")}> <button class="faq-question w-full flex items-center justify-between p-5 md:p-6 text-left font-semibold text-navy text-[0.95rem] hover:text-gold-dark transition-colors" aria-expanded="false"> <span>${faq.q}</span> <svg class="faq-chevron w-5 h-5 text-gold flex-shrink-0 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg> </button> <div class="faq-answer max-h-0 overflow-hidden transition-[max-height] duration-400"> <p class="px-5 md:px-6 pb-5 md:pb-6 text-sm text-gray-500 leading-relaxed">${unescapeHTML(faq.a)}</p> </div> </div>`)} </div> </div> </section>`;
}, "D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/components/FAQ.astro", void 0);

const $$Faq = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "FAQ \u2014 JCBO Conseil | Questions Fr\xE9quentes", "description": "Retrouvez les r\xE9ponses aux questions fr\xE9quentes sur nos services de conseil, coaching et formation." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<div class="pt-24"></div> ${renderComponent($$result2, "FAQ", $$FAQ, {})}  <section class="py-16 bg-offwhite text-center"> <div class="max-w-[700px] mx-auto px-6"> <h2 class="font-heading text-2xl font-bold text-navy mb-4">D'autres <span class="text-gold">questions</span> ?</h2> <p class="text-gray-500 mb-8">Notre équipe est à votre disposition pour répondre à toutes vos interrogations.</p> <a href="/contact" class="inline-flex items-center gap-2 bg-gold text-navy font-bold py-3.5 px-8 rounded-full hover:bg-gold-light transition-all">Être recontacté</a> </div> </section> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/faq.astro", void 0);

const $$file = "D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/faq.astro";
const $$url = "/faq";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Faq,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
