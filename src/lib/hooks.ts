/**
 * SENDER — hooks de plataforma.
 *
 * Todo lo que aquí se decide está en el DESIGN DNA §7 y §7.4:
 * el scroll es la línea de tiempo, y con `prefers-reduced-motion` el
 * movimiento desaparece sin que desaparezca la información.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Lenis from "lenis";

export const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ── Movimiento reducido ─────────────────────────────────────────────── */

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/* ── Scroll suave ────────────────────────────────────────────────────── */

let lenisSingleton: Lenis | null = null;

/**
 * Lenis con los parámetros del DNA. Se detiene por completo con
 * `prefers-reduced-motion`: el usuario recupera el scroll nativo.
 */
export function useSmoothScroll(enabled = true) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !enabled) {
      document.documentElement.classList.remove("lenis");
      return;
    }
    if (typeof window === "undefined") return;

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
      smoothWheel: true,
    });
    lenisSingleton = lenis;

    let raf = 0;
    let running = true;
    const loop = (time: number) => {
      if (!running) return;
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Fuera de pestaña, nada corre. No se anima lo que nadie mira.
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      document.body.classList.remove("lenis", "lenis-smooth");
      lenis.destroy();
      lenisSingleton = null;
    };
  }, [reduced, enabled]);
}

export function getLenis(): Lenis | null {
  return lenisSingleton;
}

/* ── Visibilidad ─────────────────────────────────────────────────────── */

/**
 * Observa un elemento y dice si ha llegado al viewport.
 *
 * Tres decisiones que evitan que el contenido se quede invisible:
 *
 *  1. `threshold: 0` — un umbral sobre la fracción del elemento es inalcanzable
 *     cuando el elemento es más alto que el viewport, que es el caso de casi
 *     todas las figuras de este sitio.
 *  2. **Estado inicial resuelto por geometría**, no por el observer. Si el
 *     elemento ya está en pantalla —o ya pasó— al montarse, se revela de
 *     inmediato. Sin esto, saltar con el índice de escenas o con el teclado
 *     deja bloques enteros invisibles para siempre.
 *  3. El observer sólo sirve para lo que aún está por llegar.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: { threshold?: number; rootMargin?: string; once?: boolean } = {},
) {
  const { threshold = 0, rootMargin = "9999px 0px -8% 0px", once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useIso(() => {
    const el = ref.current;
    if (!el) return;

    // 2. Geometría primero: ¿ya está a la vista, o ya quedó por encima?
    const r = el.getBoundingClientRect();
    const alto = window.innerHeight || 0;
    if (r.top < alto * 0.94) {
      setInView(true);
      if (once) return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView } as const;
}

/** Progreso de scroll de un elemento de 0 a 1 mientras lo atraviesas. */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = r.height + window.innerHeight;
      if (total <= 0) return;
      const passed = window.innerHeight - r.top;
      setProgress(Math.min(1, Math.max(0, passed / total)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return { ref, progress } as const;
}

/* ── Soporte de capacidades ──────────────────────────────────────────── */

/** ¿Hay WebGL? Si no, cada pieza 3D tiene su sustituto 2D (DNA §8.3). */
export function useWebGLSupport(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      setOk(Boolean(gl));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

/** Coincidencia con una media query, reactiva. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/**
 * Escena activa según el scroll, para la navegación y los títulos.
 * Devuelve el índice de la última escena cuya parte superior ya pasó el centro.
 */
export function useActiveScene(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const mid = window.innerHeight * 0.42;
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= mid) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ids]);

  return active;
}

/* ── Trampa de foco para diálogos ────────────────────────────────────── */

/**
 * Atrapa el foco dentro de un contenedor mientras está abierto y lo devuelve
 * al elemento que lo abrió al cerrarse.
 *
 * Sin esto, con `Tab` se sale a la página de detrás: quien navega con teclado
 * o con lector de pantalla acaba perdido en contenido que no puede ver.
 * El DESIGN DNA §12 declara foco gestionado; esto lo cumple.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  activo: boolean,
  onCerrar: () => void,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!activo) return;
    const contenedor = ref.current;
    if (!contenedor) return;

    // Quien abrió, para devolverle el foco al cerrar.
    const origen = document.activeElement as HTMLElement | null;

    const FOCALIZABLES = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    const visibles = () =>
      Array.from(contenedor.querySelectorAll<HTMLElement>(FOCALIZABLES)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCerrar();
        return;
      }
      if (e.key !== "Tab") return;

      const lista = visibles();
      if (lista.length === 0) {
        e.preventDefault();
        return;
      }

      const primero = lista[0];
      const ultimo = lista[lista.length - 1];
      const dentro = contenedor.contains(document.activeElement);

      if (e.shiftKey) {
        if (!dentro || document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        }
      } else if (!dentro || document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // El foco vuelve a donde estaba: la posición no se pierde.
      if (origen && document.contains(origen)) origen.focus();
    };
  }, [activo, onCerrar]);

  return ref;
}
