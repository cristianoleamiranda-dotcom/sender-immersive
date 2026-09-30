/**
 * SENDER — rutas con base configurable.
 *
 * El mismo árbol tiene que funcionar en tres sitios distintos sin recompilar
 * lógica:
 *
 *  1. La raíz de un dominio          → base "/"
 *  2. Un subdirectorio de GitHub     → base "/sender-immersive/"
 *  3. Un servidor local de pruebas   → base "/"
 *
 * `import.meta.env.BASE_URL` la fija Vite a partir de `VITE_BASE_PATH`. Todo
 * enlace interno del sitio pasa por aquí: sin esto, `/es/` apunta a la raíz del
 * dominio en vez de a la del proyecto, y la navegación se sale del sitio.
 */

/** Base sin barra final: "" en raíz, "/sender-immersive" en subdirectorio. */
export const BASE_CRUDO = (import.meta.env.BASE_URL ?? "/").replace(/\/+$/, "");

/** Base con barra final, tal como la espera GitHub Pages: "/sender-immersive/". */
export const BASE = `${BASE_CRUDO}/`;

/**
 * Ruta interna del sitio → URL servible, con la base aplicada.
 *
 *   withBase("/es/")                     → "/es/"
 *   withBase("/es/")  (base /sender-immersive/) → "/sender-immersive/es/"
 */
export function withBase(ruta: string): string {
  const limpia = ruta.startsWith("/") ? ruta : `/${ruta}`;
  return `${BASE_CRUDO}${limpia}` || "/";
}

/**
 * Quita la base de una ruta del navegador.
 *
 *   stripBase("/sender-immersive/es/") → "/es/"
 *   stripBase("/es/")                  → "/es/"
 */
export function stripBase(pathname: string): string {
  if (!BASE_CRUDO) return pathname || "/";
  if (pathname === BASE_CRUDO) return "/";
  if (pathname.startsWith(`${BASE_CRUDO}/`)) {
    return pathname.slice(BASE_CRUDO.length);
  }
  return pathname || "/";
}

/** ¿Estamos sirviendo desde un subdirectorio? */
export const EN_SUBDIRECTORIO = BASE_CRUDO !== "";
