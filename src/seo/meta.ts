/**
 * SENDER — metadatos, idioma y datos estructurados.
 *
 * El bilingüismo es de URL: `/es/` y `/en/` son documentos distintos, con su
 * propio `<title>`, su descripción, su `canonical` y su JSON-LD. El `hreflang`
 * es recíproco y declara `x-default` sobre español, que es el idioma de origen.
 *
 * Limitación conocida y documentada: al ser una SPA, estas etiquetas se
 * escriben en el cliente. Los rastreadores que ejecutan JavaScript las ven
 * completas; para los que no, el plan de prerender está en el hito 09 del
 * DESIGN-REVIEW. El contenido esencial nunca depende de esto.
 */

import type { Lang } from "@/content/types";
import { company, specializations } from "@/content/company";
import { categories, products } from "@/content/catalog";
import { projects } from "@/content/projects";
import { bands } from "@/content/bands";
import { resolve } from "@/content/resolve";
import { LANG_META, hrefFor } from "@/i18n/language";
import { withBase } from "@/lib/base";
import ESTATICO from "./estatico.json";

/**
 * ORIGEN del sitio, sin ruta.
 *
 * Ojo con la diferencia, porque es una trampa fácil:
 *
 *   `VITE_SITE_URL` puede traer RUTA además del origen
 *   ("https://usuario.github.io/sender-immersive"), y `hrefFor()` ya aplica el
 *   prefijo de despliegue. Concatenar los dos produce una canónica duplicada:
 *   ".../sender-immersive/sender-immersive/es/".
 *
 * Por eso aquí se guarda SOLO el origen, y la ruta la compone `absoluta()`.
 * Así funciona igual en la raíz de un dominio que bajo un subdirectorio.
 */
const ORIGEN = (() => {
  const declarado = import.meta.env.VITE_SITE_URL as string | undefined;
  if (declarado) {
    try {
      return new URL(declarado).origin;
    } catch {
      /* valor inválido: se cae al dominio de producción */
    }
  }
  return "https://www.sender.cl";
})();

/**
 * URL absoluta a partir de una ruta que YA lleva la base.
 *
 * `hrefFor()` y `withBase()` ya aplican el prefijo de despliegue. Volver a
 * aplicarlo aquí produce una canónica duplicada —".../sender-immersive/
 * sender-immersive/es/"— que es exactamente el error que este comentario
 * existe para que no se repita. Esta función sólo antepone el origen.
 */
function absoluta(rutaConBase: string): string {
  return `${ORIGEN}${rutaConBase}`;
}

export interface MetaDoc {
  title: string;
  description: string;
  canonical: string;
  ogLocale: string;
  jsonLd: unknown[];
}

/**
 * Título y descripción por idioma, en `estatico.json`.
 *
 * Vive en JSON y no escrito aquí porque el HTML servido también los necesita:
 * `scripts/postbuild.mjs` los escribe en `es/` y `en/` para que un rastreador
 * que no ejecuta JavaScript vea el mismo título y la misma descripción que el
 * visitante. Con dos copias acaban divergiendo.
 */
const COPY: Record<Lang, { title: string; description: string }> = {
  es: { title: ESTATICO.es.title, description: ESTATICO.es.description },
  en: { title: ESTATICO.en.title, description: ESTATICO.en.description },
};

export function buildMeta(lang: Lang): MetaDoc {
  const c = COPY[lang];
  const canonical = absoluta(hrefFor(lang, "/"));

  const org = {
    "@type": "Organization",
    "@id": `${ORIGEN}/#organizacion`,
    name: company.name,
    legalName: company.legalName,
    url: ORIGEN,
    slogan: company.claim[lang],
    foundingLocation: { "@type": "Place", name: company.city[lang] },
    telephone: company.phone,
    email: company.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.street,
      addressLocality: company.address.commune,
      addressRegion: "Región Metropolitana",
      addressCountry: "CL",
    },
    areaServed: [
      { "@type": "Country", name: "Chile" },
      { "@type": "Place", name: lang === "es" ? "Internacional" : "International" },
    ],
    knowsAbout: [...specializations],
    // Sin `award`, sin `numberOfEmployees`, sin `foundingDate`: no están
    // documentados y no se inventan. Ver DESIGN DNA §10.4.
  };

  const catalogo = products.map((p, i) => ({
    "@type": "Product",
    "@id": `${ORIGEN}/#producto-${p.slug}`,
    name: resolve(p.name, lang),
    description: resolve(p.summary, lang),
    category: resolve(categories.find((c2) => c2.id === p.categoryId)!.name, lang),
    brand: { "@type": "Brand", name: company.name },
    manufacturer: { "@id": `${ORIGEN}/#organizacion` },
    position: i + 1,
    ...(p.sourceUrl ? { url: p.sourceUrl } : {}),
  }));

  const lista = {
    "@type": "ItemList",
    "@id": `${ORIGEN}/#catalogo`,
    name: lang === "es" ? "Catálogo de productos Sender" : "Sender product catalogue",
    numberOfItems: products.length,
    itemListElement: catalogo,
  };

  const navegacion = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: lang === "es" ? "Inicio" : "Home",
        item: canonical,
      },
    ],
  };

  // Las bandas y las instalaciones documentadas, como datos consultables.
  const bandas = {
    "@type": "ItemList",
    name: lang === "es" ? "Bandas de operación" : "Operating bands",
    itemListElement: bands.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${resolve(b.code, lang)} — ${resolve(b.range, lang)}`,
      description: resolve(b.use, lang),
    })),
  };

  const instalaciones = {
    "@type": "ItemList",
    name: lang === "es" ? "Instalaciones documentadas" : "Documented installations",
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Place",
        name: resolve(p.name, lang),
        description: resolve(p.summary, lang),
        address: {
          "@type": "PostalAddress",
          addressLocality: resolve(p.location, lang),
        },
        ...(p.source ? { sameAs: p.source.url } : {}),
      },
    })),
  };

  return {
    title: c.title,
    description: c.description,
    canonical,
    ogLocale: LANG_META[lang].htmlLang.replace("-", "_"),
    jsonLd: [
      { "@context": "https://schema.org", "@graph": [org, navegacion] },
      { "@context": "https://schema.org", ...lista },
      { "@context": "https://schema.org", ...bandas },
      { "@context": "https://schema.org", ...instalaciones },
    ],
  };
}

/** Escribe el documento: título, descripción, canónicas, hreflang y JSON-LD. */
export function applyMeta(lang: Lang): void {
  if (typeof document === "undefined") return;
  const meta = buildMeta(lang);
  const head = document.head;

  document.title = meta.title;

  const set = (
    selector: string,
    attrs: Record<string, string>,
    tag = "meta",
  ) => {
    let el = head.querySelector(selector) as HTMLElement | null;
    if (!el) {
      el = document.createElement(tag);
      const id = selector.match(/\[(name|property|rel)="([^"]+)"\]/);
      if (id) el.setAttribute(id[1], id[2]);
      head.appendChild(el);
    }
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  };

  set('meta[name="description"]', { content: meta.description });
  set('link[rel="canonical"]', { href: meta.canonical }, "link");

  /**
   * hreflang recíproco y `x-default`.
   *
   * Se construye la lista entera y se reemplaza de una vez. Hacerlo con
   * selectores por atributo era frágil: el `hreflang` del HTML estático es
   * "es-CL" mientras que el código buscaba "es", así que no encontraba el
   * elemento, creaba uno nuevo **sin el atributo hreflang** y dejaba en el
   * documento un `<link rel="alternate">` vacío.
   */
  head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((n) => n.remove());
  const alternos: [string, string][] = [
    [LANG_META.es.htmlLang, absoluta(hrefFor("es", "/"))],
    [LANG_META.en.htmlLang, absoluta(hrefFor("en", "/"))],
    ["x-default", absoluta(hrefFor("es", "/"))],
  ];
  for (const [hreflang, href] of alternos) {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = hreflang;
    link.href = href;
    head.appendChild(link);
  }

  set('meta[property="og:title"]', { content: meta.title });
  set('meta[property="og:description"]', { content: meta.description });
  set('meta[property="og:url"]', { content: meta.canonical });
  set('meta[property="og:type"]', { content: "website" });
  set('meta[property="og:locale"]', { content: meta.ogLocale });
  set('meta[property="og:locale:alternate"]', {
    content: LANG_META[lang === "es" ? "en" : "es"].htmlLang.replace("-", "_"),
  });
  set('meta[property="og:site_name"]', { content: company.name });
  set('meta[property="og:image"]', { content: `${ORIGEN}${withBase(`/og/${lang}.jpg`)}` });
  set('meta[property="og:image:width"]', { content: "1200" });
  set('meta[property="og:image:height"]', { content: "630" });

  set('meta[name="twitter:card"]', { content: "summary_large_image" });
  set('meta[name="twitter:title"]', { content: meta.title });
  set('meta[name="twitter:description"]', { content: meta.description });
  set('meta[name="twitter:image"]', { content: `${ORIGEN}${withBase(`/og/${lang}.jpg`)}` });

  // JSON-LD independiente por idioma.
  head.querySelectorAll('script[data-sender-jsonld]').forEach((n) => n.remove());
  for (const bloque of meta.jsonLd) {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-sender-jsonld", "");
    s.textContent = JSON.stringify(bloque);
    head.appendChild(s);
  }
}

/** Sitemap con anotaciones hreflang, para generar en el build. */
export function buildSitemap(): string {
  const urls = ["/", "/#senal", "/#proyectos", "/#productos", "/#contacto"];
  const hoy = new Date().toISOString().slice(0, 10);
  const entradas = urls
    .map((u) => {
      const es = absoluta(hrefFor("es", u.replace(/^\//, "/")));
      const en = absoluta(hrefFor("en", u.replace(/^\//, "/")));
      return `  <url>
    <loc>${es}</loc>
    <lastmod>${hoy}</lastmod>
    <xhtml:link rel="alternate" hreflang="es-CL" href="${es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${es}"/>
  </url>
  <url>
    <loc>${en}</loc>
    <lastmod>${hoy}</lastmod>
    <xhtml:link rel="alternate" hreflang="es-CL" href="${es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${es}"/>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entradas}
</urlset>
`;
}
