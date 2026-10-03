/**
 * SENDER — interruptor del rig §17 (SCROLL = CAMERA).
 *
 * El rig r3f-scroll-rig sólo entra cuando TODO esto se cumple:
 *  - VITE_RIG=r3f (opt-in explícito por entorno)
 *  - WebGL disponible
 *  - escritorio con puntero fino (el móvil conserva su camino propio, §26)
 *  - sin prefers-reduced-motion
 *
 * Si algo falla, el sitio funciona exactamente como hoy: canvas por escena
 * con su sustituto 2D. El rig es una mejora, no una dependencia dura.
 */

import { useMediaQuery, useReducedMotion, useWebGLSupport } from "@/lib/hooks";

export const RIG_R3F: boolean =
  typeof window !== "undefined" &&
  String(import.meta.env.VITE_RIG ?? "") === "r3f";

/** ¿Este cliente puede usar el rig global? Evalúa capacidades, no deseos. */
export function useRigDisponible(): boolean {
  const hayWebGL = useWebGLSupport();
  const esMovil = useMediaQuery("(max-width: 820px)");
  const punteroFino = useMediaQuery("(pointer: fine)");
  const reduced = useReducedMotion();
  return RIG_R3F && hayWebGL && !esMovil && punteroFino && !reduced;
}
