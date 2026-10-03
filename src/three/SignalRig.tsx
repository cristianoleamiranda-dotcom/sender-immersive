/**
 * SIGNAL en el rig global — 01 SIGNAL sobre ScrollScene (§17.3).
 *
 * El lienzo DOM (data-3d="signal-field") es el elemento trackeado: el campo
 * 3D queda sincronizado con su posición y tamaño en el documento. El GLSL
 * de SignalField NO cambia: es la pieza propia del sitio y no se toca.
 *
 * Carga condicional: este módulo sólo se importa cuando el rig está activo.
 */

import type { MutableRefObject, RefObject } from "react";
import { ScrollScene } from "@14islands/r3f-scroll-rig";
import SignalField from "./SignalField";

export default function SignalRig({
  track,
  energia = 0,
}: {
  /**
   * El DOM lo crea React con useRef<HTMLDivElement>(null): llega como
   * RefObject<HTMLDivElement | null>. ScrollScene (v8) declara
   * MutableRefObject<HTMLElement>: es el mismo objeto en runtime (el ref
   * del div), distinta firma en los tipos. El cast vive sólo en esta
   * frontera y no filtra al resto del sitio.
   */
  track: RefObject<HTMLDivElement | null>;
  energia?: number;
}) {
  const tracked = track as unknown as MutableRefObject<HTMLElement>;

  return (
    <ScrollScene track={tracked} inViewport>
      {() => <SignalField energia={energia} />}
    </ScrollScene>
  );
}
