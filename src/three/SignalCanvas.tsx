/**
 * Host del canvas 3D.
 *
 * Reglas que se cumplen aquí (§8.3):
 *  - `dpr` acotado: [1, 1.75]; en móvil, 1. Nunca se renderiza a 3× en un teléfono.
 *  - El canvas se monta sólo cuando la escena entra en pantalla.
 *  - Si no hay WebGL, NO se monta: la escena entrega su sustituto 2D.
 *  - Al desmontar, three libera geometría, materiales y el contexto.
 */

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import SignalField from "./SignalField";
import { useMediaQuery, useWebGLSupport } from "@/lib/hooks";

/** Vigila el paso del tiempo dentro de la escena, nada más. */
function Latido({ activo }: { activo: boolean }) {
  useFrame(() => {
    void activo;
  });
  return null;
}

export default function SignalCanvas({
  energia = 0,
  activo = true,
}: {
  energia?: number;
  activo?: boolean;
}) {
  const hayWebGL = useWebGLSupport();
  const esMovil = useMediaQuery("(max-width: 820px)");
  const contenedor = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [roto, setRoto] = useState(false);

  /**
   * Sólo se monta cuando está a la vista: no se gasta GPU en lo que no se mira.
   * Depende de `hayWebGL` porque el contenedor NO existe en el primer render
   * —hasta que el efecto de detección resuelve— y el observer tiene que
   * volver a engancharse cuando el div aparece de verdad.
   */
  useEffect(() => {
    if (!hayWebGL || roto) return;
    const el = contenedor.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hayWebGL, roto]);

  if (!hayWebGL || roto) {
    // Sustituto 2D declarado en el DNA §8.3: la onda, en canvas plano.
    return <Onda2D energia={energia} />;
  }

  return (
    <div className="senal__canvas" ref={contenedor} aria-hidden="true">
      {visible && activo ? (
        <Canvas
          dpr={esMovil ? 1 : [1, 1.75]}
          gl={{
            antialias: !esMovil,
            alpha: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          camera={{ position: [0, 13, 24], fov: 50, near: 0.1, far: 420 }}
          onCreated={({ gl, camera }) => {
            gl.setClearColor(new THREE.Color("#061424"), 0);
            // La cámara mira por encima del campo, hacia el horizonte: así el
            // frente de onda se aleja en perspectiva en vez de llenar el plano.
            camera.lookAt(0, -1.5, -20);
            // Sin contexto, se degrada en vez de quedarse en negro.
            gl.domElement.addEventListener("webglcontextlost", (ev) => {
              ev.preventDefault();
              setRoto(true);
            });
          }}
          onError={() => setRoto(true)}
        >
          <Suspense fallback={null}>
            <Latido activo={visible} />
            <SignalField energia={energia} />
            <fog attach="fog" args={["#061424", 40, 190]} />
          </Suspense>
        </Canvas>
      ) : null}
    </div>
  );
}

/** Onda en 2D. Sin WebGL, la señal sigue siendo legible. */
function Onda2D({ energia = 0 }: { energia?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let t = 0;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
    };
    resize();
    window.addEventListener("resize", resize);

    const dibujar = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      const medio = h * 0.5;
      const trazos = 7;

      for (let i = 0; i < trazos; i++) {
        const p = i / trazos;
        ctx.beginPath();
        ctx.lineWidth = (i === 3 ? 1.6 : 0.7) * dpr;
        ctx.strokeStyle =
          i === 3
            ? `rgba(51,163,204,${0.5 + energia * 0.3})`
            : `rgba(30,115,190,${0.34 - p * 0.28})`;

        for (let x = 0; x <= w; x += 3 * dpr) {
          const u = x / w;
          const d = Math.abs(u - 0.5) * 2;
          const amp = (1 - d) ** 2 * (0.5 + energia * 0.5);
          const y =
            medio +
            Math.sin(u * 26 - t * 1.9) * h * 0.16 * amp * (1 - p * 0.07) +
            (p - 0.5) * h * 0.05;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      t += 0.016;
      raf = requestAnimationFrame(dibujar);
    };
    dibujar();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [energia]);

  return (
    <div className="senal__canvas senal__canvas--2d" aria-hidden="true">
      <canvas ref={ref} className="senal__onda2d" />
    </div>
  );
}
