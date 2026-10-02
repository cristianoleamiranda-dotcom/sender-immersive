/**
 * Genera `public/sitemap.xml` (50 URLs con hreflang) y `public/robots.txt`.
 * Uso: node scripts/gen-seo.mjs
 */
import { writeFileSync } from "node:fs";
import "./seo.mjs";

const SITIO = (process.env.VITE_SITE_URL || "https://www.sender.cl").replace(/\/+$/, "");

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
