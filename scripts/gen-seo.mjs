/**
 * Genera sitemap.xml y robots.txt en `public/`, derivados del catálogo real.
 * Uso: node scripts/gen-seo.mjs
 */
import { writeFileSync } from "node:fs";

// El dominio lo inyecta el build. Sin la variable, cae al de producción.
const SITIO = (process.env.VITE_SITE_URL || "https://www.sender.cl").replace(/\/+$/, "");
const hoy = new Date().toISOString().slice(0, 10);

const rutas = [
  { p: "", prio: "1.0" },
  { p: "#senal", prio: "0.9" },
  { p: "#empresa", prio: "0.8" },
  { p: "#ingenieria", prio: "0.8" },
  { p: "#transmision", prio: "0.8" },
  { p: "#proyectos", prio: "0.9" },
  { p: "#productos", prio: "0.9" },
  { p: "#proceso", prio: "0.7" },
  { p: "#contacto", prio: "0.9" },
];

const bloques = rutas
  .map(({ p, prio }) => {
    const es = `${SITIO}/es/${p}`;
    const en = `${SITIO}/en/${p}`;
    return [es, en]
      .map(
        (u) => `  <url>
    <loc>${u}</loc>
    <lastmod>${hoy}</lastmod>
    <priority>${prio}</priority>
    <xhtml:link rel="alternate" hreflang="es-CL" href="${es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${es}"/>
  </url>`,
      )
      .join("\n");
  })
  .join("\n");

writeFileSync(
  "public/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${bloques}
</urlset>
`,
);

writeFileSync(
  "public/robots.txt",
  `# Sender — https://www.sender.cl
User-agent: *
Allow: /
Disallow: /shots/
Disallow: /*?*

Sitemap: ${SITIO}/sitemap.xml
`,
);

console.log(`  sitemap.xml  ${rutas.length * 2} URLs con hreflang`);
console.log("  robots.txt");
