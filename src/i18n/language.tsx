/**
 * SENDER — IDIOMA
 *
 * Español e inglés completos y equivalentes. Cero mezcla.
 *
 * El idioma NO es un estado de React: es la URL. `/es/` y `/en/` son rutas
 * distintas, con su propio `<html lang>`, su `<title>`, su descripción y su
 * JSON-LD. Cambiar de idioma cambia de ruta, no de string. Eso es lo que hace
 * que el bilingüismo sea real y no un conmutador de cliente.
 *
 * Excepción única y explícita (DNA §10.2): la nomenclatura técnica
 * internacional viaja idéntica en los dos idiomas, porque es un código.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { Lang } from "@/content/types";
import { siteContent } from "@/content/site";
import { company } from "@/content/company";
import { categories, products } from "@/content/catalog";
import { projects } from "@/content/projects";
import { bands } from "@/content/bands";
import { resolve } from "@/content/resolve";
import { stripBase, withBase } from "@/lib/base";

export const LANGS: Lang[] = ["es", "en"];
export const DEFAULT_LANG: Lang = "es";

/** Etiqueta de cada idioma, escrita SIEMPRE en su propio idioma. */
export const LANG_META: Record<Lang, { code: string; label: string; htmlLang: string; short: string }> = {
  es: { code: "es", label: "Español", htmlLang: "es-CL", short: "ES" },
  en: { code: "en", label: "English", htmlLang: "en", short: "EN" },
};

export type Route = { lang: Lang; path: string; hash: string };

/**
 * Lee la ruta actual quitando primero la base.
 *
 * Bajo `/sender-immersive/` la primera carpeta de la URL es el nombre del
 * proyecto, no el idioma: sin quitar la base, el sitio no reconocería `/es/` y
 * caería siempre al idioma por defecto.
 *
 *   /es/senal                    → { lang: "es", path: "/senal" }
 *   /sender-immersive/en/senal   → { lang: "en", path: "/senal" }
 */
export function parseLocation(): Route {
  if (typeof window === "undefined") {
    return { lang: DEFAULT_LANG, path: "/", hash: "" };
  }
  const raw = stripBase(window.location.pathname);
  const segments = raw.split("/").filter(Boolean);

  let lang: Lang = DEFAULT_LANG;
  if (segments[0] === "en") {
    lang = "en";
    segments.shift();
  } else if (segments[0] === "es") {
    lang = "es";
    segments.shift();
  }

  return {
    lang,
    path: "/" + segments.join("/"),
    hash: window.location.hash,
  };
}

/**
 * Construye la ruta de un idioma, con la base aplicada.
 * La ruta interna es la misma en ambos idiomas; sólo cambia el prefijo.
 */
export function hrefFor(lang: Lang, path = "/", hash = ""): string {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  return withBase(`/${lang}${clean}/${hash}`);
}

interface LanguageValue {
  lang: Lang;
  other: Lang;
  /** Contenido del sitio resuelto al idioma activo. */
  t: ReturnType<typeof resolve<typeof siteContent>>;
  route: Route;
}

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const route = useMemo(parseLocation, []);
  const lang = route.lang;

  // El documento declara su idioma. Es una obligación de accesibilidad y SEO.
  useEffect(() => {
    document.documentElement.lang = LANG_META[lang].htmlLang;
    document.documentElement.dataset.lang = lang;
  }, [lang]);

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      other: lang === "es" ? "en" : "es",
      t: resolve(siteContent, lang),
      route,
    }),
    [lang, route],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLang(): LanguageValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang se usó fuera de <LanguageProvider>");
  return ctx;
}

/** Contenido resuelto del catálogo, los proyectos y las bandas. */
export function useCatalog() {
  const { lang } = useLang();
  return useMemo(
    () => ({
      categories: resolve(categories, lang),
      products: resolve(products, lang),
      projects: resolve(projects, lang),
      bands: resolve(bands, lang),
      company,
    }),
    [lang],
  );
}

/** Navegación entre idiomas preservando la ruta interna. */
export function useLangSwitch() {
  const { lang, other, route } = useLang();
  return useCallback(() => {
    const target = hrefFor(other, route.path, route.hash);
    window.location.assign(target);
  }, [lang, other, route]);
}
