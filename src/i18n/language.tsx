/**
 * SENDER — IDIOMA Y ENRUTAMIENTO (ES en `/` | EN en `/en`)
 *
 * Español e inglés completos y equivalentes. Cero mezcla.
 *
 * Regla de AGENTS.md:
 * - ES vive en `/`, `/productos`, `/productos/:slug`, `/producto/:slug`
 * - EN vive en `/en`, `/en/productos`, `/en/productos/:slug`, `/en/producto/:slug`
 * - `/soluciones` redirige a `/productos` (y `/en/soluciones` a `/en/productos`)
 * - También acepta `/es/` como alias de `/` para compatibilidad hacia atrás.
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
 * Lee la ruta actual quitando primero la base (`/sender-immersive/`).
 *
 *   /                                      → { lang: "es", path: "/" }
 *   /productos/transmisores-am             → { lang: "es", path: "/productos/transmisores-am" }
 *   /producto/serie-sender-ss              → { lang: "es", path: "/producto/serie-sender-ss" }
 *   /en                                    → { lang: "en", path: "/" }
 *   /en/productos/transmisores-am          → { lang: "en", path: "/productos/transmisores-am" }
 *   /en/producto/serie-sender-ss           → { lang: "en", path: "/producto/serie-sender-ss" }
 *   /es/...                                → { lang: "es", path: "/..." } (alias compatible)
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

  let internalPath = "/" + segments.join("/");
  if (internalPath === "/soluciones") {
    internalPath = "/productos";
  }

  return {
    lang,
    path: internalPath,
    hash: window.location.hash,
  };
}

/**
 * Construye la ruta de un idioma, con la base aplicada.
 * - ES (`/`): `/` o `/productos/...` o `/producto/...`
 * - EN (`/en`): `/en/` o `/en/productos/...` o `/en/producto/...`
 */
export function hrefFor(lang: Lang, path = "/", hash = ""): string {
  const clean = path === "/" ? "" : "/" + path.replace(/^\/+|\/+$/g, "");
  if (lang === "en") {
    return withBase(`/en${clean}/${hash}`);
  }
  return withBase(`${clean}/${hash}`);
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

/** Navegación entre idiomas preservando la ruta interna (`/productos/:slug`, `/producto/:slug`, etc.). */
export function useLangSwitch() {
  const { other, route } = useLang();
  return useCallback(() => {
    const target = hrefFor(other, route.path, route.hash);
    window.location.assign(target);
  }, [other, route]);
}
