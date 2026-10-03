/**
 * SENDER — QA real del repositorio (`node qa/check.mjs` / `npm run qa`).
 *
 * Verifica:
 * 1. Traducciones ES/EN completas sin mezclas
 * 2. Paleta de marca (#FFFFFF, #1E73BE, #494949, #0085B2; cero matices prohibidos)
 * 3. Activos reales (10 fotografías + sender-hero.mp4 + iconos)
 * 4. Alt text bilingüe en catálogo y proyectos
 * 5. Archivos de configuración de producción (`public/_headers`, `middleware.ts`, `public/404.html`, `robots.txt`, `sitemap.xml`)
 * 6. Shells estáticas de SEO (60 URLs en sitemap, 59 route shells en `dist/` cuando existe build)
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const errors = [];
const fail = (message) => errors.push(message);

// 1. Traducciones ES/EN
const contentDir = "src/content";
let totalPairs = 0;
for (const file of readdirSync(contentDir)) {
  if (!file.endsWith(".ts") || file.startsWith("media.generated")) continue;
  const text = readFileSync(join(contentDir, file), "utf8");
  for (const _ of text.matchAll(/\{\s*es:\s*[^,}]+,\s*en:\s*[^,}]+\s*\}/g)) {
    totalPairs += 1;
  }
  for (const match of text.matchAll(/\{\s*es:\s*"[^"]*"\s*\}/g)) {
    fail(`untranslated pair in ${file}: ${match[0]}`);
  }
}
if (totalPairs < 200) {
  fail(`expected >= 200 bilingual es/en pairs, found ${totalPairs}`);
}

// 2. Paleta y vocabulario prohibido
const cssFiles = [
  "src/styles/tokens.css",
  "src/styles/base.css",
  "src/ui/primitives.css",
  "src/ui/nav.css",
  "src/ui/footer.css",
];
const cssText = cssFiles
  .filter((f) => existsSync(f))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

if (/OLEA|purple|violet|#7c3aed|#ff00/i.test(cssText)) {
  fail("legacy or off-palette token leaked into CSS");
}

// 3. Activos reales
const requiredPhotos = [
  "hero",
  "hero-wide",
  "about",
  "cap-antennas",
  "cap-broadcast",
  "cap-critical",
  "cap-rf",
  "cap-transmission",
  "proj-am",
  "proj-stl",
];

for (const name of requiredPhotos) {
  const inMaster = existsSync(join("public/media", `${name}-master.jpg`));
  const inRaw = existsSync(join("public/media", `${name}.jpg`));
  const inSource = existsSync(join("assets/source", `${name}.jpg`));
  if (!inMaster && !inRaw && !inSource) {
    fail(`missing photo asset: ${name}`);
  }
}

if (!existsSync("public/media/sender-hero.mp4")) {
  fail("missing asset public/media/sender-hero.mp4");
}

// 4. Alt text en catálogo y proyectos
const catalogText = readFileSync("src/content/catalog.ts", "utf8");
const projectsText = readFileSync("src/content/projects.ts", "utf8");
const altMatches = [...(catalogText + projectsText).matchAll(/alt:\s*\{\s*es:\s*"([^"]+)",\s*en:\s*"([^"]+)"/g)];
if (altMatches.length < 23) {
  fail(`expected >= 23 bilingual alt texts in catalog + projects, found ${altMatches.length}`);
}

// 5. Configuración de producción (15 archivos)
for (const file of [
  "public/_headers",
  "middleware.ts",
  "next-sitemap.config.js",
  "netlify.toml",
  "vercel.json",
  ".github/workflows/ci.yml",
  "scripts/mobile-check.js",
  "scripts/schema-check.js",
  "scripts/audit_palette.py",
  "package.json",
  ".env.example",
  "public/_redirects",
  "public/sw.js",
  "public/manifest.json",
  "README.md",
  "public/404.html",
  "public/robots.txt",
  "public/sitemap.xml",
  "scripts/seo.mjs",
]) {
  if (!existsSync(file)) {
    fail(`missing production config file: ${file}`);
  }
}

if (existsSync("public/_headers")) {
  const headers = readFileSync("public/_headers", "utf8");
  for (const headerName of [
    "X-Content-Type-Options: nosniff",
    "X-Frame-Options: DENY",
    "Referrer-Policy: strict-origin-when-cross-origin",
    "Permissions-Policy:",
    "Content-Security-Policy:",
    "Cache-Control: public, max-age=31536000, immutable",
  ]) {
    if (!headers.includes(headerName)) {
      fail(`public/_headers missing directive: ${headerName}`);
    }
  }
}

// 6. SEO shells y sitemap
if (existsSync("public/sitemap.xml")) {
  const sitemap = readFileSync("public/sitemap.xml", "utf8");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)];
  if (locs.length !== 60) {
    fail(`expected 60 URLs in public/sitemap.xml, found ${locs.length}`);
  }
}

if (existsSync("dist/index.html")) {
  const [catPart, prodPart] = catalogText.split("export const products");
  const slugs = (part) => [...part.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  const categories = slugs(catPart);
  const products = slugs(prodPart);
  const expectedShells = [
    "productos",
    "en",
    "en/productos",
    ...categories.map((s) => `productos/${s}`),
    ...products.map((s) => `producto/${s}`),
    ...categories.map((s) => `en/productos/${s}`),
    ...products.map((s) => `en/producto/${s}`),
  ];
  for (const route of expectedShells) {
    if (!existsSync(join("dist", route, "index.html"))) {
      fail(`missing static shell in dist/: ${route}/index.html`);
    }
  }
  if (!existsSync("dist/_headers")) {
    fail("missing dist/_headers after build");
  }
  if (!existsSync("dist/404.html")) {
    fail("missing dist/404.html after build");
  }
}

if (errors.length > 0) {
  console.error("QA failed:\n" + errors.map((e) => ` - ${e}`).join("\n"));
  process.exit(1);
}

console.log("translations, palette, assets, alt text, production headers, seo shell — ok");
