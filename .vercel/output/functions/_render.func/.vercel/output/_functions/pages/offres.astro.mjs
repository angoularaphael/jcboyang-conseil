/* empty css                                    */
import { c as createComponent, f as renderComponent, r as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_D4iU0DsB.mjs';
import 'kleur/colors';
import { $ as $$Layout, a as $$Header, b as $$Footer } from '../chunks/Footer_bCwkQopd.mjs';
export { renderers } from '../renderers.mjs';

const $$Offres = createComponent(($$result, $$props, $$slots) => {
  const offers = [
    {
      title: "Diagnostic Strat\xE9gique",
      subtitle: "Audit & Recommandations",
      desc: "Analyse compl\xE8te de votre positionnement, march\xE9 et concurrence. Diagnostic chiffr\xE9 avec recommandations prioritaires.",
      features: ["Audit commercial complet", "Analyse concurrentielle", "Plan d'action prioritaire", "Rapport d\xE9taill\xE9"],
      cta: "Demander un diagnostic"
    },
    {
      title: "Accompagnement Premium",
      subtitle: "Conseil & Suivi personnalis\xE9",
      desc: "Programme d'accompagnement sur-mesure pour structurer et acc\xE9l\xE9rer votre d\xE9veloppement commercial.",
      features: ["Strat\xE9gie commerciale", "Suivi mensuel personnalis\xE9", "Acc\xE8s direct consultant", "KPIs & tableaux de bord"],
      cta: "En savoir plus",
      featured: true
    },
    {
      title: "Formation \xC9quipes",
      subtitle: "Mont\xE9e en comp\xE9tences",
      desc: "Formations sur-mesure pour vos \xE9quipes commerciales. Techniques de vente, n\xE9gociation, management.",
      features: ["Programme personnalis\xE9", "Mises en situation", "Supports & outils", "Suivi post-formation"],
      cta: "Demander un programme"
    }
  ];
  const coachingModules = [
    {
      title: "Mindset Entrepreneurial",
      desc: "D\xE9veloppez la posture mentale du leader. Vision, discipline, r\xE9silience.",
      icon: "\u{1F9E0}"
    },
    {
      title: "Strat\xE9gie Commerciale",
      desc: "Structurez votre offre, d\xE9finissez vos cibles et votre plan d'acquisition.",
      icon: "\u{1F3AF}"
    },
    {
      title: "N\xE9gociation & Closing",
      desc: "Ma\xEEtrisez l'art de conclure. Techniques avanc\xE9es de n\xE9gociation.",
      icon: "\u{1F91D}"
    },
    {
      title: "Leadership & Management",
      desc: "Construisez et pilotez une \xE9quipe performante orient\xE9e r\xE9sultats.",
      icon: "\u{1F451}"
    }
  ];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Nos Offres \u2014 JCBO Conseil | Conseil, Formation, Coaching", "description": "D\xE9couvrez nos offres de conseil strat\xE9gique, formation professionnelle et coaching en ligne pour entrepreneurs et dirigeants PME." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<div class="pt-24"></div>  <section class="py-20 bg-offwhite"> <div class="max-w-[1200px] mx-auto px-6 text-center"> <span class="inline-block font-accent italic text-gold text-sm uppercase tracking-[0.1em] mb-2">Solutions sur mesure</span> <h1 class="font-heading text-[clamp(2rem,4.5vw,3rem)] font-bold text-navy mb-4">Nos <span class="text-gold">Offres</span></h1> <div class="w-14 h-0.5 bg-gold mx-auto mb-5"></div> <p class="text-gray-500 max-w-2xl mx-auto">Des solutions concrètes et orientées résultats pour chaque étape de votre développement.</p> </div> </section>  <section class="py-20 bg-white"> <div class="max-w-[1200px] mx-auto px-6"> <div class="grid grid-cols-1 md:grid-cols-3 gap-8"> ${offers.map((o) => renderTemplate`<div${addAttribute(["service-card relative rounded-2xl p-8 transition-all hover:-translate-y-1", o.featured ? "bg-navy text-white border-2 border-gold shadow-2xl scale-[1.03]" : "bg-offwhite border border-gold/10 hover:border-gold/30"], "class:list")}> ${o.featured && renderTemplate`<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-navy text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Populaire</div>`} <h3${addAttribute(["font-heading text-xl font-bold mb-1", o.featured ? "text-white" : "text-navy"], "class:list")}>${o.title}</h3> <p${addAttribute(["font-accent italic text-sm mb-4", o.featured ? "text-gold" : "text-gold-dark"], "class:list")}>${o.subtitle}</p> <p${addAttribute(["text-sm mb-6 leading-relaxed", o.featured ? "text-white/70" : "text-gray-500"], "class:list")}>${o.desc}</p> <ul class="space-y-2 mb-8"> ${o.features.map((f) => renderTemplate`<li class="flex items-center gap-2 text-sm"> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a762" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span${addAttribute(o.featured ? "text-white/80" : "text-gray-600", "class")}>${f}</span> </li>`)} </ul> <a href="/contact"${addAttribute(["block text-center font-bold py-3 rounded-full transition-all", o.featured ? "bg-gold text-navy hover:bg-gold-light" : "border-2 border-gold text-gold hover:bg-gold hover:text-navy"], "class:list")}>${o.cta}</a> </div>`)} </div> </div> </section>  <section class="py-20 bg-navy text-white" id="coaching"> <div class="max-w-[1200px] mx-auto px-6"> <div class="text-center mb-14"> <span class="inline-block font-accent italic text-gold text-sm uppercase tracking-[0.1em] mb-2">Nouveau</span> <h2 class="font-heading text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-white mb-4">Nos <span class="text-gold">Coaching en Ligne</span></h2> <div class="w-14 h-0.5 bg-gold mx-auto mb-5"></div> <p class="text-white/50 max-w-2xl mx-auto">Accédez à nos modules de coaching où que vous soyez. Des programmes structurés pour développer vos compétences entrepreneuriales.</p> </div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14"> ${coachingModules.map((m) => renderTemplate`<div class="bg-white/5 border border-gold/10 rounded-2xl p-6 hover:border-gold/30 transition-all"> <span class="text-3xl mb-4 block">${m.icon}</span> <h3 class="font-heading text-lg font-bold text-white mb-2">${m.title}</h3> <p class="text-white/50 text-sm">${m.desc}</p> </div>`)} </div> <!-- Double tarification --> <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto"> <!-- Zone Euro --> <div class="bg-white/5 border border-gold/20 rounded-2xl p-8 text-center hover:border-gold/50 transition-all"> <div class="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4"> <span class="text-gold text-xl font-bold">€</span> </div> <h3 class="font-heading text-lg font-bold text-white mb-1">Zone Euro</h3> <p class="text-white/40 text-sm mb-4">France, Europe & international</p> <p class="font-heading text-4xl font-bold text-gold mb-1">Sur devis</p> <p class="text-white/40 text-xs mb-6">Tarif adapté au module choisi</p> <a href="/contact" class="block bg-gold text-navy font-bold py-3 rounded-full hover:bg-gold-light transition-all">Demander un tarif</a> </div> <!-- Zone Afrique --> <div class="bg-white/5 border border-gold/20 rounded-2xl p-8 text-center hover:border-gold/50 transition-all"> <div class="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4"> <span class="text-gold text-xl font-bold">XAF</span> </div> <h3 class="font-heading text-lg font-bold text-white mb-1">Zone Afrique</h3> <p class="text-white/40 text-sm mb-4">Cameroun & pays africains</p> <p class="font-heading text-4xl font-bold text-gold mb-1">Sur devis</p> <p class="text-white/40 text-xs mb-6">Tarif adapté en FCFA</p> <a href="/contact" class="block bg-gold text-navy font-bold py-3 rounded-full hover:bg-gold-light transition-all">Demander un tarif</a> </div> </div> </div> </section>  <section class="py-16 bg-offwhite text-center"> <div class="max-w-[700px] mx-auto px-6"> <h2 class="font-heading text-2xl font-bold text-navy mb-4">Une question sur nos <span class="text-gold">offres</span> ?</h2> <p class="text-gray-500 mb-8">Contactez-nous pour un échange personnalisé et sans engagement.</p> <a href="/contact" class="inline-flex items-center gap-2 bg-gold text-navy font-bold py-3.5 px-8 rounded-full hover:bg-gold-light transition-all">Être recontacté</a> </div> </section> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/offres.astro", void 0);

const $$file = "D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/offres.astro";
const $$url = "/offres";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Offres,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
