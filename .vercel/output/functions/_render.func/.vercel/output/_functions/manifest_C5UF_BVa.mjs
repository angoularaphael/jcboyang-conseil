import 'cookie';
import 'kleur/colors';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_BSyr_Mkz.mjs';
import 'es-module-lexer';
import { j as decodeKey } from './chunks/astro/server_D4iU0DsB.mjs';
import 'clsx';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///D:/PROBOOK%20445%20G7/Desktop/JCBOYANG/jcbo-vitrine/","adapterName":"@astrojs/vercel/serverless","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BGXD8lUX.js"}],"styles":[{"type":"external","src":"/_astro/a-propos.BS_BVlAD.css"}],"routeData":{"route":"/a-propos","isIndex":false,"type":"page","pattern":"^\\/a-propos\\/?$","segments":[[{"content":"a-propos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/a-propos.astro","pathname":"/a-propos","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BGXD8lUX.js"}],"styles":[{"type":"external","src":"/_astro/a-propos.BS_BVlAD.css"}],"routeData":{"route":"/actualites/[slug]","isIndex":false,"type":"page","pattern":"^\\/actualites\\/([^/]+?)\\/?$","segments":[[{"content":"actualites","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/actualites/[slug].astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BGXD8lUX.js"}],"styles":[{"type":"external","src":"/_astro/a-propos.BS_BVlAD.css"}],"routeData":{"route":"/actualites","isIndex":false,"type":"page","pattern":"^\\/actualites\\/?$","segments":[[{"content":"actualites","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/actualites.astro","pathname":"/actualites","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BGXD8lUX.js"}],"styles":[{"type":"external","src":"/_astro/a-propos.BS_BVlAD.css"}],"routeData":{"route":"/contact","isIndex":false,"type":"page","pattern":"^\\/contact\\/?$","segments":[[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contact.astro","pathname":"/contact","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BGXD8lUX.js"}],"styles":[{"type":"external","src":"/_astro/a-propos.BS_BVlAD.css"}],"routeData":{"route":"/faq","isIndex":false,"type":"page","pattern":"^\\/faq\\/?$","segments":[[{"content":"faq","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/faq.astro","pathname":"/faq","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BGXD8lUX.js"}],"styles":[{"type":"external","src":"/_astro/a-propos.BS_BVlAD.css"}],"routeData":{"route":"/mentions-legales","isIndex":false,"type":"page","pattern":"^\\/mentions-legales\\/?$","segments":[[{"content":"mentions-legales","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/mentions-legales.astro","pathname":"/mentions-legales","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BGXD8lUX.js"}],"styles":[{"type":"external","src":"/_astro/a-propos.BS_BVlAD.css"}],"routeData":{"route":"/methode","isIndex":false,"type":"page","pattern":"^\\/methode\\/?$","segments":[[{"content":"methode","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/methode.astro","pathname":"/methode","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BGXD8lUX.js"}],"styles":[{"type":"external","src":"/_astro/a-propos.BS_BVlAD.css"}],"routeData":{"route":"/offres","isIndex":false,"type":"page","pattern":"^\\/offres\\/?$","segments":[[{"content":"offres","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/offres.astro","pathname":"/offres","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BGXD8lUX.js"}],"styles":[{"type":"external","src":"/_astro/a-propos.BS_BVlAD.css"}],"routeData":{"route":"/prestations","isIndex":false,"type":"page","pattern":"^\\/prestations\\/?$","segments":[[{"content":"prestations","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/prestations.astro","pathname":"/prestations","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.CJ8O_DtA.js"}],"styles":[{"type":"external","src":"/_astro/a-propos.BS_BVlAD.css"}],"routeData":{"route":"/reserver","isIndex":false,"type":"page","pattern":"^\\/reserver\\/?$","segments":[[{"content":"reserver","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/reserver.astro","pathname":"/reserver","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DMq0UPS2.js"}],"styles":[{"type":"external","src":"/_astro/a-propos.BS_BVlAD.css"}],"routeData":{"route":"/ressources","isIndex":false,"type":"page","pattern":"^\\/ressources\\/?$","segments":[[{"content":"ressources","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/ressources.astro","pathname":"/ressources","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BGXD8lUX.js"}],"styles":[{"type":"external","src":"/_astro/a-propos.BS_BVlAD.css"}],"routeData":{"route":"/resultats","isIndex":false,"type":"page","pattern":"^\\/resultats\\/?$","segments":[[{"content":"resultats","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/resultats.astro","pathname":"/resultats","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BGXD8lUX.js"}],"styles":[{"type":"external","src":"/_astro/a-propos.BS_BVlAD.css"}],"routeData":{"route":"/seminaires","isIndex":false,"type":"page","pattern":"^\\/seminaires\\/?$","segments":[[{"content":"seminaires","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/seminaires.astro","pathname":"/seminaires","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BGXD8lUX.js"}],"styles":[{"type":"external","src":"/_astro/a-propos.BS_BVlAD.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"site":"https://jcboyang-conseil.vercel.app","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/a-propos.astro",{"propagation":"none","containsHead":true}],["D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/actualites.astro",{"propagation":"none","containsHead":true}],["D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/actualites/[slug].astro",{"propagation":"none","containsHead":true}],["D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/contact.astro",{"propagation":"none","containsHead":true}],["D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/faq.astro",{"propagation":"none","containsHead":true}],["D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/index.astro",{"propagation":"none","containsHead":true}],["D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/mentions-legales.astro",{"propagation":"none","containsHead":true}],["D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/methode.astro",{"propagation":"none","containsHead":true}],["D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/offres.astro",{"propagation":"none","containsHead":true}],["D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/prestations.astro",{"propagation":"none","containsHead":true}],["D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/reserver.astro",{"propagation":"none","containsHead":true}],["D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/ressources.astro",{"propagation":"none","containsHead":true}],["D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/resultats.astro",{"propagation":"none","containsHead":true}],["D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/src/pages/seminaires.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:src/pages/actualites/[slug]@_@astro":"pages/actualites/_slug_.astro.mjs","\u0000@astro-page:src/pages/actualites@_@astro":"pages/actualites.astro.mjs","\u0000@astro-page:src/pages/contact@_@astro":"pages/contact.astro.mjs","\u0000@astro-page:src/pages/mentions-legales@_@astro":"pages/mentions-legales.astro.mjs","\u0000@astro-page:src/pages/methode@_@astro":"pages/methode.astro.mjs","\u0000@astro-page:src/pages/offres@_@astro":"pages/offres.astro.mjs","\u0000@astro-page:src/pages/prestations@_@astro":"pages/prestations.astro.mjs","\u0000@astro-page:src/pages/reserver@_@astro":"pages/reserver.astro.mjs","\u0000@astro-page:src/pages/ressources@_@astro":"pages/ressources.astro.mjs","\u0000@astro-page:src/pages/seminaires@_@astro":"pages/seminaires.astro.mjs","\u0000@astro-page:src/pages/a-propos@_@astro":"pages/a-propos.astro.mjs","\u0000@astro-page:src/pages/faq@_@astro":"pages/faq.astro.mjs","\u0000@astro-page:src/pages/resultats@_@astro":"pages/resultats.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","D:/PROBOOK 445 G7/Desktop/JCBOYANG/jcbo-vitrine/node_modules/astro/dist/env/setup.js":"chunks/astro/env-setup_Cr6XTFvb.mjs","\u0000@astrojs-manifest":"manifest_C5UF_BVa.mjs","/astro/hoisted.js?q=0":"_astro/hoisted.CJ8O_DtA.js","/astro/hoisted.js?q=1":"_astro/hoisted.DMq0UPS2.js","/astro/hoisted.js?q=2":"_astro/hoisted.BGXD8lUX.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/a-propos.BS_BVlAD.css","/robots.txt","/images/logo.png","/_astro/hoisted.BGXD8lUX.js","/_astro/hoisted.CJ8O_DtA.js","/_astro/hoisted.DMq0UPS2.js","/images/2019/Forum AKOMCA 2019_1.jpg","/images/2019/Forum AKOMCA 2019_2.jpeg","/images/2019/Forum AKOMCA 2019_3.jpeg","/images/2022/1744134541505.jpg","/images/2022/IMG-20240503-WA0065.jpg","/images/aout2025/P1160886.MP4","/images/aout2025/P1160890.JPG","/images/aout2025/P1160908.MP4","/images/aout2025/Séminaire août 2025 1.jpeg","/images/aout2025/Séminaire août 2025 2.jpeg","/images/aout2025/Séminaire août 2025 3.jpeg","/images/dec2025/P1170148.JPG","/images/dec2025/P1170161.JPG","/images/dec2025/P1170172.JPG","/images/dec2025/P1170176.MP4","/images/dec2025/P1170240.JPG","/images/dec2025/P1170249.JPG","/images/dec2025/P1170274.JPG","/images/dec2025/P1170277.JPG","/images/dec2025/P1170279.JPG","/images/dec2025/P1170281.JPG","/images/dec2025/P1170294.JPG","/images/dec2025/P1170306.MP4","/images/dec2025/P1170329.JPG","/images/dec2025/P1170344.JPG","/images/dec2025/P1170349.JPG","/images/dec2025/P1170371.JPG","/images/dec2025/P1170373.JPG","/images/dec2025/P1170378.MP4","/images/dec2025/P1170386.JPG","/images/dec2025/P1170387.JPG","/images/ressources/WhatsApp Image 2026-04-26 at 12.48.36.jpeg","/images/ressources/WhatsApp Image 2026-04-26 at 12.49.10 (1).jpeg","/images/ressources/WhatsApp Image 2026-04-26 at 12.49.10 (2).jpeg","/images/ressources/WhatsApp Image 2026-04-26 at 12.49.10.jpeg","/images/ressources/WhatsApp Image 2026-04-26 at 12.49.11 (1).jpeg","/images/ressources/WhatsApp Image 2026-04-26 at 12.49.11.jpeg"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"cVkgy3O9W1SYL02GZGJNR5iNLojwJtqGbcVJbM6Fxrs=","experimentalEnvGetSecretEnabled":false});

export { manifest };
