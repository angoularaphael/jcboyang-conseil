/* empty css                                    */
import { c as createComponent, m as maybeRenderHead, d as addAttribute, r as renderTemplate, u as unescapeHTML, f as renderComponent } from '../chunks/astro/server_D4iU0DsB.mjs';
import 'kleur/colors';
import { $ as $$Layout, a as $$Header, b as $$Footer } from '../chunks/Footer_bCwkQopd.mjs';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Method = createComponent(($$result, $$props, $$slots) => {
  const steps = [
    { num: "01", title: "Appel D\xE9couverte", desc: "30 minutes pour comprendre votre situation, vos objectifs et identifier les premiers leviers de croissance. <strong>Sans engagement.</strong>", badge: "Gratuit" },
    { num: "02", title: "Audit Strat\xE9gique", desc: "Analyse approfondie de votre positionnement, processus commerciaux, march\xE9 et concurrence. Diagnostic chiffr\xE9 avec recommandations prioritaires." },
    { num: "03", title: "Plan d'Action Sur Mesure", desc: "Feuille de route op\xE9rationnelle avec objectifs SMART, actions prioritaires, calendrier de d\xE9ploiement et KPIs." },
    { num: "04", title: "Accompagnement & R\xE9sultats", desc: "Ex\xE9cution terrain avec vous. Formation des \xE9quipes, coaching du dirigeant, suivi des KPIs et ajustements en continu. <strong>On mesure tout.</strong>" }
  ];
  return renderTemplate`${maybeRenderHead()}<section class="py-20 md:py-28 bg-navy text-white" id="methode"> <div class="max-w-[1200px] mx-auto px-6"> <div class="text-center mb-14" data-animate="fade-up"> <span class="inline-block font-accent italic text-gold text-sm uppercase tracking-[0.1em] mb-2">Notre approche</span> <h2 class="font-heading text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-white mb-4">Une méthode en <span class="text-gold">4 étapes</span> éprouvée</h2> <div class="w-14 h-0.5 bg-gold mx-auto mb-5"></div> <p class="text-white/50 max-w-lg mx-auto">Pas de bla-bla. Un processus clair, des livrables concrets, des résultats mesurables.</p> </div> <div class="relative max-w-3xl mx-auto"> <!-- Vertical line --> <div class="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gold/20 hidden md:block"></div> ${steps.map((step, i) => renderTemplate`<div class="relative flex gap-5 md:gap-8 mb-10 last:mb-0" data-animate="fade-up"${addAttribute(String(i * 150), "data-delay")}> <div class="relative z-10 flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full bg-navy-light border-2 border-gold/40 flex items-center justify-center"> <span class="font-heading text-gold font-bold text-lg md:text-xl">${step.num}</span> </div> <div class="bg-navy-light border border-gold/10 rounded-2xl p-6 md:p-8 flex-1 hover:border-gold/30 transition-colors"> ${step.badge && renderTemplate`<span class="inline-block bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">${step.badge}</span>`} <h3 class="font-heading text-xl font-semibold text-gold mb-2">${step.title}</h3> <p class="text-white/60 text-sm leading-relaxed">${unescapeHTML(step.desc)}</p> </div> </div>`)} </div> <div class="text-center mt-14" data-animate="fade-up"> <a href="/reserver" class="inline-flex items-center gap-2 bg-gold text-navy font-bold py-4 px-10 rounded-full text-base hover:bg-gold-light hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(212,167,98,0.3)] transition-all">
Commencer par l'étape 1 — C'est gratuit
</a> </div> </div> </section>`;
}, "D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/components/Method.astro", void 0);

const $$APropos = createComponent(($$result, $$props, $$slots) => {
  const galeryImages = [
    { src: "/images/aout2025/S\xE9minaire ao\xFBt 2025 3.jpeg", alt: "S\xE9minaire international ao\xFBt 2025", label: "S\xE9minaire Ao\xFBt 2025" },
    { src: "/images/dec2025/P1170148.JPG", alt: "\xC9v\xE9nement d\xE9cembre 2025", label: "D\xE9cembre 2025" },
    { src: "/images/2019/Forum AKOMCA 2019_1.jpg", alt: "Forum AKOMCA 2019", label: "Forum AKOMCA 2019" },
    { src: "/images/dec2025/P1170240.JPG", alt: "Networking d\xE9cembre 2025", label: "Networking" }
  ];
  const credentials = [
    "Consultant certifi\xE9",
    "Formateur en ESC",
    "Coach professionnel",
    "Partenaire AKOMCA",
    "International"
  ];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "JCBO \u2014 Expert Business Development Toulouse | Jean-Christophe Boyang-Tsang", "description": "D\xE9couvrez le parcours de Jean-Christophe Boyang-Tsang, consultant expert en business development avec 30 ans d'exp\xE9rience terrain." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<div class="pt-24"></div>  <section class="py-20 md:py-28 bg-white" id="about"> <div class="max-w-[1200px] mx-auto px-6"> <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-16 items-center"> <!-- Image principale + badge --> <div class="relative" data-animate="fade-right"> <div class="relative rounded-2xl overflow-hidden aspect-[3/4] max-w-[380px] mx-auto lg:mx-0 shadow-xl"> <img src="/images/2022/IMG-20240503-WA0065.jpg" alt="Jean-Christophe Boyang-Tsang, fondateur de JCBO Conseil" class="w-full h-full object-cover" loading="lazy"> </div> <!-- Badge expérience --> <div class="absolute -bottom-5 -right-3 lg:-right-5 bg-navy text-white py-5 px-7 rounded-xl shadow-xl text-center"> <span class="block font-heading text-3xl font-bold text-gold leading-none">30+</span> <span class="text-[0.7rem] uppercase tracking-widest text-white/60">ans d'expertise</span> </div> </div> <!-- Content --> <div data-animate="fade-left"> <span class="inline-block font-accent italic text-gold text-sm uppercase tracking-[0.1em] mb-2">Qui vous accompagne</span> <h1 class="font-heading text-[clamp(2rem,4vw,3rem)] font-bold text-navy mb-1">Jean-Christophe <span class="text-gold">Boyang-Tsang</span></h1> <p class="text-gold font-accent italic text-xl mb-8">Consultant Expert en Business Development</p> <div class="space-y-4 text-gray-600 leading-relaxed text-lg"> <p> <strong class="text-navy">JCBo</strong>, ce sont les initiales de Jean-Christophe Boyang-Tsang, fondateur et unique force motrice derrière notre entreprise. Pas un théoricien — <strong class="text-navy">un homme de terrain</strong>.
</p> <p>
Professionnel expérimenté avec <strong class="text-navy">30 années de pratique</strong> dans les domaines du consulting, de la formation et du coaching. J'interviens comme expert en développement commercial et marketing, ainsi que coach et formateur professionnel en écoles supérieures de commerce en France.
</p> <p>
Mon expérience couvre la définition et la mise en œuvre de stratégies commerciales pour de nombreuses PME et TPE, l'enseignement en écoles supérieures, et des postes de direction commerciale et marketing dans différents pays. J'organise également régulièrement des <strong class="text-navy">séminaires, formations et événements internationaux</strong>.
</p> </div> <!-- Credentials --> <div class="flex flex-wrap gap-2 mt-10 mb-10"> ${credentials.map((c) => renderTemplate`<div class="flex items-center gap-2 bg-offwhite border border-gold/10 rounded-lg px-4 py-2.5 text-sm hover:border-gold/30 transition-colors"> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a762" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span class="text-navy font-medium">${c}</span> </div>`)} </div> <div class="flex flex-wrap gap-3"> <a href="/contact" class="inline-flex items-center gap-2 bg-gold text-navy font-bold py-3.5 px-8 rounded-full hover:bg-gold-light hover:-translate-y-0.5 transition-all">Discuter de votre situation</a> </div> </div> </div> <!-- Galerie photos JC Boyang --> <div class="mt-20 pt-14 border-t border-gold/10" data-animate="fade-up"> <div class="text-center mb-10"> <span class="inline-block font-accent italic text-gold text-sm uppercase tracking-[0.1em] mb-2">En images</span> <h3 class="font-heading text-xl md:text-2xl font-bold text-navy">Séminaires, formations & <span class="text-gold">événements</span></h3> </div> <div class="grid grid-cols-2 md:grid-cols-4 gap-4"> ${galeryImages.map((img, i) => renderTemplate`<div class="relative rounded-xl overflow-hidden aspect-square group" data-animate="fade-up"${addAttribute(String(i * 100), "data-delay")}> <img${addAttribute(img.src, "src")}${addAttribute(img.alt, "alt")} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"> <div class="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4"> <span class="text-white text-xs font-semibold bg-gold/90 px-3 py-1 rounded-full">${img.label}</span> </div> </div>`)} </div> </div> </div> </section> ${renderComponent($$result2, "Method", $$Method, {})}  <section class="py-20 bg-navy text-center"> <div class="max-w-[700px] mx-auto px-6" data-animate="fade-up"> <h2 class="font-heading text-[clamp(1.6rem,3.5vw,2.4rem)] font-bold text-white mb-4">Envie d'en <span class="text-gold">discuter</span> ?</h2> <p class="text-white/50 mb-8">Chaque situation est unique. Parlons de la vôtre et structurons votre croissance.</p> <div class="flex items-center justify-center gap-4 flex-wrap"> <a href="/reserver" class="inline-flex items-center gap-2 bg-gold text-navy font-bold py-4 px-10 rounded-full text-lg hover:bg-gold-light hover:-translate-y-0.5 transition-all">Réserver une séance</a> <a href="/contact" class="inline-flex items-center gap-2 border border-white/30 text-white font-bold py-4 px-10 rounded-full text-lg hover:border-gold hover:text-gold transition-all">Nous contacter</a> </div> </div> </section> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/a-propos.astro", void 0);

const $$file = "D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/a-propos.astro";
const $$url = "/a-propos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$APropos,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
