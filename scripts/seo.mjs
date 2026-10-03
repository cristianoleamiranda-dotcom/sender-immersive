/**
 * SENDER — Generador de shells estáticas (49 rutas) y sitemap bilingüe (50 URLs).
 *
 * Cumple AGENTS.md:
 * - ES en `/`, EN en `/en`
 * - Rutas: `/`, `/en`, `/productos`, `/en/productos`, `/productos/:slug`, `/producto/:slug` + espejos EN
 * - `/soluciones` -> redirect (ruta SPA + 404.html estático)
 * - 49 shells estáticas en `dist/` + `es/index.html` de compatibilidad + `404.html` + `.nojekyll`
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const DIST = "dist";
const BASE = (process.env.VITE_BASE_PATH || "/").replace(/\/+$/, "") + "/";
const SITIO = (
  process.env.VITE_SITE_URL || "https://cristianoleamiranda-dotcom.github.io/sender-immersive"
).replace(/\/+$/, "");

const ESTATICO = JSON.parse(readFileSync(join("src", "seo", "estatico.json"), "utf8"));
const catalog = readFileSync(join("src", "content", "catalog.ts"), "utf8");
const [catPart, prodPart] = catalog.split("export const products");
const slugs = (part) => [...part.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
const categories = slugs(catPart);
const products = slugs(prodPart);

const esc = (t) => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// 1. Construir las rutas canónicas del sitemap (ES en `/`, EN en `/en`)
const paths = ["/", "/en", "/productos", "/en/productos"];

/** Escenas de la página única: deep links → shell 200 + scroll al ancla. */
const ESCENAS = [
  ["senal", "Señal", "Signal"],
  ["ingenieria", "Ingeniería", "Engineering"],
  ["proyectos", "Proyectos", "Projects"],
  ["proceso", "Proceso", "Process"],
  ["contacto", "Contacto", "Contact"],
];
ESCENAS.forEach(([slug]) => {
  paths.push(`/${slug}`, `/en/${slug}`);
});
categories.forEach((slug) => {
  paths.push(`/productos/${slug}`, `/en/productos/${slug}`);
});
products.forEach((slug) => {
  paths.push(`/producto/${slug}`, `/en/producto/${slug}`);
});

const hoy = new Date().toISOString().slice(0, 10);
const urls = paths
  .map((path) => {
    const loc = `${SITIO}${path === "/" ? "/" : `${path}/`}`;
    const esPath = path.startsWith("/en") ? path.replace(/^\/en/, "") || "/" : path;
    const enPath = esPath === "/" ? "/en" : `/en${esPath}`;
    const esHref = `${SITIO}${esPath === "/" ? "/" : `${esPath}/`}`;
    const enHref = `${SITIO}${enPath}/`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${hoy}</lastmod>
    <xhtml:link rel="alternate" hreflang="es-CL" href="${esHref}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${enHref}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${esHref}"/>
  </url>`;
  })
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

writeFileSync(join("public", "sitemap.xml"), sitemap);

if (!existsSync(DIST) || !existsSync(join(DIST, "index.html"))) {
  console.log(`seo: ${paths.length} urls (dist/ no compilado aún)`);
  process.exit(0);
}

writeFileSync(join(DIST, "sitemap.xml"), sitemap);

const htmlTemplate = readFileSync(join(DIST, "index.html"), "utf8");

function renderHtml({ idioma = "es", route = "", title, description }) {
  const c = ESTATICO[idioma];
  const cleanRoute = route.replace(/^\/+|\/+$/g, "");
  const esRoute = cleanRoute.replace(/^en(\/|$)/, "").replace(/^\/+/, "");
  const enRoute = esRoute ? `en/${esRoute}` : "en";

  const urlEs = esRoute ? `${SITIO}/${esRoute}/` : `${SITIO}/`;
  const urlEn = `${SITIO}/${enRoute}/`;
  const canonica = idioma === "en" ? urlEn : urlEs;

  const valores = {
    __IDIOMA__: idioma,
    __LANG__: idioma === "es" ? "es-CL" : "en",
    __SITIO__: SITIO,
    __CANONICA__: canonica,
    __URL_ES__: urlEs,
    __URL_EN__: urlEn,
    __TITULO__: esc(title || c.title),
    __DESCRIPCION__: esc(description || c.description),
    __OG_LOCALE__: c.ogLocale,
    __OG_LOCALE_ALT__: c.ogLocaleAlt,
  };

  let out = htmlTemplate;
  for (const [marcador, valor] of Object.entries(valores)) {
    out = out.split(marcador).join(valor);
  }
  return out;
}

function conRebote404(html) {
  const rebote = `
    <script>
      (function () {
        var BASE = ${JSON.stringify(BASE)};
        var l = window.location;
        var rel = l.pathname.indexOf(BASE) === 0 ? "/" + l.pathname.slice(BASE.length) : l.pathname;
        var clean = rel.replace(/\\/+$/, "") || "/";
        if (clean === "/soluciones") {
          l.replace(BASE + "productos/" + l.search + l.hash);
          return;
        }
        if (clean === "/en/soluciones") {
          l.replace(BASE + "en/productos/" + l.search + l.hash);
          return;
        }
        var isEn = /^\\/en(\\/|$)/.test(clean);
        l.replace(BASE + (isEn ? "en/" : "") + l.search + l.hash);
      })();
    </script>`;
  return html.replace("</body>", `${rebote}\n  </body>`);
}

// 2. Escribir la raíz `/` (ES)
writeFileSync(
  join(DIST, "index.html"),
  renderHtml({ idioma: "es", route: "", title: ESTATICO.es.title }),
);

// 3. Generar las 49 shells estáticas requeridas por AGENTS.md
const shells = [
  ...categories.map((slug) => [`productos/${slug}`, "es", `SENDER Chile | ${slug}`]),
  ...products.map((slug) => [`producto/${slug}`, "es", `SENDER Chile | ${slug}`]),
  ...categories.map((slug) => [`en/productos/${slug}`, "en", `SENDER Chile | ${slug}`]),
  ...products.map((slug) => [`en/producto/${slug}`, "en", `SENDER Chile | ${slug}`]),
  ["productos", "es", "SENDER Chile | Catálogo"],
  ["en", "en", ESTATICO.en.title],
  ["en/productos", "en", "SENDER Chile | RF Engineering, Broadcasting & Transmission Systems"],
  ...ESCENAS.map(([slug, es]) => [slug, "es", `SENDER Chile | ${es}`]),
  ...ESCENAS.map(([slug, , en]) => [`en/${slug}`, "en", `SENDER Chile | ${en}`]),
];

shells.forEach(([route, idioma, title]) => {
  const file = join(DIST, route, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, renderHtml({ idioma, route, title }));
});

// 3b. Las escenas son anclas de la página única: cada shell mantiene su URL,
// deja renderizar el SPA y desplaza al ancla (deep links funcionan en GH Pages).
for (const [slug] of ESCENAS) {
  for (const [route, baseRel] of [[slug, ""], [`en/${slug}`, "en/"]]) {
    const file = join(DIST, route, "index.html");
    const destino = JSON.stringify(BASE + baseRel);
    const script = `<script>(function(){var id=${JSON.stringify(slug)};function ir(){var t=document.getElementById(id);if(t){t.scrollIntoView();history.replaceState(null,"",${destino}+"#"+id)}else{setTimeout(ir,200)}}if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",ir)}else{ir()}})();</script>`;
    writeFileSync(file, readFileSync(file, "utf8").replace("</head>", `  ${script}\n  </head>`));
  }
}

// 4. Shell de compatibilidad `/es/` y redirects estáticos `/soluciones` + `/en/soluciones`
mkdirSync(join(DIST, "es"), { recursive: true });
writeFileSync(
  join(DIST, "es", "index.html"),
  renderHtml({ idioma: "es", route: "", title: ESTATICO.es.title }),
);

for (const [legacyRoute, targetRel, idioma] of [
  ["soluciones", "productos/", "es"],
  ["en/soluciones", "en/productos/", "en"],
]) {
  const file = join(DIST, legacyRoute, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  const baseHtml = renderHtml({
    idioma,
    route: targetRel.replace(/\/$/, ""),
    title: "SENDER Chile | Catálogo",
  });
  const redirectScript = `<script>window.location.replace(${JSON.stringify(BASE + targetRel)} + window.location.search + window.location.hash);</script>`;
  writeFileSync(file, baseHtml.replace("</head>", `  ${redirectScript}\n  </head>`));
}

// 5. 404.html y .nojekyll
writeFileSync(
  join(DIST, "404.html"),
  conRebote404(renderHtml({ idioma: "es", route: "", title: ESTATICO.es.title })),
);
writeFileSync(join(DIST, ".nojekyll"), "");

// 6. Verificar que ningún marcador haya quedado sin sustituir
const checkFiles = [
  "index.html",
  "404.html",
  "es/index.html",
  ...shells.map(([route]) => `${route}/index.html`),
];
const restos = [];
for (const rel of checkFiles) {
  const html = readFileSync(join(DIST, rel), "utf8");
  const encontrados = [...new Set(html.match(/__[A-Z_]+__/g) || [])];
  if (encontrados.length) restos.push(`${rel}: ${encontrados.join(", ")}`);
}
if (restos.length) {
  console.error("✗ marcadores sin sustituir:", restos);
  process.exit(1);
}

console.log(`seo: ${paths.length} urls, ${shells.length} route shells`);
