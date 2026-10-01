/**
 * SENDER — post-compilado para GitHub Pages.
 *
 * Hace tres cosas, y las tres son necesarias para que el sitio funcione
 * publicado bajo un subdirectorio:
 *
 * 1. RUTAS DE IDIOMA REALES. Pages sirve archivos, no rutas. `/es/` sólo
 *    funciona si existe `es/index.html`; si no, Pages devuelve su 404 y quien
 *    llega por un enlace directo ve una página de error. Se duplica el
 *    documento en las dos rutas de idioma.
 *
 * 2. METADATOS ESCRITOS. El HTML que se sirve lleva su canónica, su `hreflang`
 *    y sus etiquetas Open Graph ESCRITAS, con los valores del idioma que
 *    corresponde. Antes sólo existían en tiempo de ejecución, así que un
 *    rastreador que no ejecuta JavaScript —el de casi todas las redes
 *    sociales— veía la canónica de un documento y la real de otro.
 *
 * 3. RESPALDO. Un `404.html` rebota a la ruta correcta, y `.nojekyll` evita
 *    que Pages ignore lo que empieza por guion bajo.
 *
 * Se ejecuta después de `vite build`. Uso:  node scripts/postbuild.mjs
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const IDIOMAS = ["es", "en"];

/** La misma base que usó el compilador. Sin ella, los rebotes apuntan mal. */
const BASE = (process.env.VITE_BASE_PATH || "/").replace(/\/+$/, "") + "/";

/**
 * URL absoluta del sitio, SIN barra final.
 *
 * `VITE_SITE_URL` la trae puesta en CI y en `npm run build:pages`. El valor por
 * defecto es la dirección de producción: si falta la variable, la canónica
 * sigue apuntando al sitio y no a un dominio ajeno, que es justo el fallo que
 * esto viene a corregir.
 */
const SITIO = (
  process.env.VITE_SITE_URL || "https://cristianoleamiranda-dotcom.github.io/sender-immersive"
).replace(/\/+$/, "");

if (!existsSync(DIST)) {
  console.error("  ✗ no hay dist/: ejecuta `vite build` antes");
  process.exit(1);
}

const origen = join(DIST, "index.html");
if (!existsSync(origen)) {
  console.error("  ✗ falta dist/index.html");
  process.exit(1);
}

const htmlBase = readFileSync(origen, "utf8");

/** Título, descripción y locale por idioma. La misma fuente que usa el runtime. */
const ESTATICO = JSON.parse(readFileSync(join("src", "seo", "estatico.json"), "utf8"));

/** `&` y `"` tienen que ir escapados: el título inglés lleva «AM & FM». */
const esc = (t) => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * Sustituye los marcadores del documento por los valores de un idioma.
 *
 * Todo son reemplazos literales sobre marcadores únicos. Nada de expresiones
 * regulares sobre etiquetas ya rellenadas: así no hay forma de que una
 * sustitución muerda dentro del resultado de otra.
 */
function conMeta(html, idioma, { canonica = `/${idioma}/` } = {}) {
  const c = ESTATICO[idioma];
  const valores = {
    __IDIOMA__: idioma,
    __LANG__: idioma === "es" ? "es-CL" : "en",
    __SITIO__: SITIO,
    __CANONICA__: SITIO + canonica,
    __URL_ES__: `${SITIO}/es/`,
    __URL_EN__: `${SITIO}/en/`,
    __TITULO__: esc(c.title),
    __DESCRIPCION__: esc(c.description),
    __OG_LOCALE__: c.ogLocale,
    __OG_LOCALE_ALT__: c.ogLocaleAlt,
  };
  let out = html;
  for (const [marcador, valor] of Object.entries(valores)) {
    out = out.split(marcador).join(valor);
  }
  return out;
}

/** El documento con el rebote añadido, útil para rutas que no existen. */
function conRebote(html) {
  const rebote = `
    <script>
      // Rebote desde una ruta desconocida: se restituye el idioma y el ancla.
      (function () {
        var BASE = ${JSON.stringify(BASE)};
        var ruta = window.location.pathname;
        var rel = ruta.indexOf(BASE) === 0 ? ruta.slice(BASE.length) : ruta;
        var idioma = /^en(\\/|$)/.test(rel.replace(/^\\/+/, "")) ? "en" : "es";
        window.location.replace(BASE + idioma + "/" + window.location.hash);
      })();
    </script>`;
  return html.replace("</body>", `${rebote}\n  </body>`);
}

// ── Rutas de idioma reales, cada una con sus metadatos ──────────────────
for (const idioma of IDIOMAS) {
  const carpeta = join(DIST, idioma);
  mkdirSync(carpeta, { recursive: true });
  writeFileSync(join(carpeta, "index.html"), conMeta(htmlBase, idioma));
  console.log(`  ${idioma}/index.html  · canónica ${SITIO}/${idioma}/`);
}

// ── La raíz: sólo redirige, así que su canónica es el idioma por defecto ──
writeFileSync(join(DIST, "index.html"), conMeta(htmlBase, "es", { canonica: "/es/" }));
console.log(`  index.html         · canónica ${SITIO}/es/`);

// ── Respaldo por si alguien llega a una ruta inexistente ────────────────
writeFileSync(join(DIST, "404.html"), conRebote(conMeta(htmlBase, "es", { canonica: "/es/" })));
console.log("  404.html");

// ── Jekyll fuera ────────────────────────────────────────────────────────
// Sin esto, Pages ignora los archivos y carpetas que empiezan por guion bajo.
writeFileSync(join(DIST, ".nojekyll"), "");
console.log("  .nojekyll");

// ── Comprobación: ningún marcador debe sobrevivir ───────────────────────
const restos = [];
for (const rel of ["index.html", "404.html", "es/index.html", "en/index.html"]) {
  const html = readFileSync(join(DIST, rel), "utf8");
  const encontrados = [...new Set(html.match(/__[A-Z_]+__/g) || [])];
  if (encontrados.length) restos.push(`${rel}: ${encontrados.join(", ")}`);
}
if (restos.length) {
  console.error("\n  ✗ quedaron marcadores sin sustituir:");
  for (const r of restos) console.error(`      ${r}`);
  process.exit(1);
}
console.log("  ✓ metadatos escritos por idioma, sin marcadores pendientes");
console.log(`  base ${BASE}  ·  sitio ${SITIO}`);
