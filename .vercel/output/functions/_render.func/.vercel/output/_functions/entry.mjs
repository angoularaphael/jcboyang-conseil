import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_Dq-OV78N.mjs';
import { manifest } from './manifest_C5UF_BVa.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/a-propos.astro.mjs');
const _page2 = () => import('./pages/actualites/_slug_.astro.mjs');
const _page3 = () => import('./pages/actualites.astro.mjs');
const _page4 = () => import('./pages/contact.astro.mjs');
const _page5 = () => import('./pages/faq.astro.mjs');
const _page6 = () => import('./pages/mentions-legales.astro.mjs');
const _page7 = () => import('./pages/methode.astro.mjs');
const _page8 = () => import('./pages/offres.astro.mjs');
const _page9 = () => import('./pages/prestations.astro.mjs');
const _page10 = () => import('./pages/reserver.astro.mjs');
const _page11 = () => import('./pages/ressources.astro.mjs');
const _page12 = () => import('./pages/resultats.astro.mjs');
const _page13 = () => import('./pages/seminaires.astro.mjs');
const _page14 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/a-propos.astro", _page1],
    ["src/pages/actualites/[slug].astro", _page2],
    ["src/pages/actualites.astro", _page3],
    ["src/pages/contact.astro", _page4],
    ["src/pages/faq.astro", _page5],
    ["src/pages/mentions-legales.astro", _page6],
    ["src/pages/methode.astro", _page7],
    ["src/pages/offres.astro", _page8],
    ["src/pages/prestations.astro", _page9],
    ["src/pages/reserver.astro", _page10],
    ["src/pages/ressources.astro", _page11],
    ["src/pages/resultats.astro", _page12],
    ["src/pages/seminaires.astro", _page13],
    ["src/pages/index.astro", _page14]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "e55845d8-08f2-4e55-ab54-9267b74ebde6",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
