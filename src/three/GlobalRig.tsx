/**
 * GLOBAL RIG — el canvas WebGL único del sitio (§17.1).
 *
 * Un solo contexto WebGL fijo (position: fixed; inset: 0) cuya cámara vive
 * mientras el DOM editorial fluye encima. Se monta SOLO cuando el cliente
 * puede sostenerlo (src/three/rig.ts); en cualquier otro caso devuelve null
 * y cada escena sigue usando su canvas propio con su fallback 2D.
 *
 * La carga del paquete es diferida: si el flag está apagado, la librería
 * ni siquiera se descarga (presupuesto de bundle, §15).
 */

import { useEffect, useState, type ComponentType } from "react";
import { useRigDisponible } from "./rig";

type GlobalCanvasProps = {
  children?: React.ReactNode;
  camera?: Record<string, unknown>;
  gl?: Record<string, unknown>;
};

/**
 * La niebla y el encuadre replican los de SignalCanvas: el campo de señal
 * no debe verse distinto por el hecho de haber cambiado de host.
 */
const FOGO = ["#061424", 40, 190] as const;

export default function GlobalRig() {
  const disponible = useRigDisponible();
  const [GlobalCanvas, setGlobalCanvas] = useState<ComponentType<GlobalCanvasProps> | null>(null);

  useEffect(() => {
    if (!disponible) return;
    let vivo = true;
    import("@14islands/r3f-scroll-rig")
      .then((m) => {
        if (vivo) setGlobalCanvas(() => m.GlobalCanvas);
      })
      .catch(() => {
        /* Sin rig, sin drama: queda el camino por escena. */
      });
    return () => {
      vivo = false;
    };
  }, [disponible]);

  if (!disponible || !GlobalCanvas) return null;

  return (
    <GlobalCanvas
      camera={{ position: [0, 13, 24], fov: 50, near: 0.1, far: 420 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      }}
    >
      <fog attach="fog" args={[...FOGO] as unknown as [string, number, number]} />
    </GlobalCanvas>
  );
}
