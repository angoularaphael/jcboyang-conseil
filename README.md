# JCBO Conseil — Site Vitrine

Site professionnel de **JCBO Conseil** (Jean-Christophe Boyang-Tsang), consultant expert en Business Development basé à Toulouse.

## Stack

- **Astro** v4.16 — Static Site Generator
- **Tailwind CSS** v3.4 — Utility-first styling
- **Vanilla JS** — Interactions (cursor, lightbox, accordion, counters)

## Développement local

```bash
npm install
npm run dev
```

## Build & Déploiement

```bash
npm run build
```

Le site statique est généré dans `dist/`.

### Render

- **Build command:** `npm run build`
- **Publish directory:** `dist`

## Structure

```
src/
├── components/    # Header, Hero, PainPoints, About, Method, Offers, Results, Testimonials, FAQ, Diagnostic, Footer
├── layouts/       # Layout.astro (SEO, fonts, cursor)
├── pages/         # index.astro, mentions-legales.astro
└── scripts/       # main.js (interactions)
```
