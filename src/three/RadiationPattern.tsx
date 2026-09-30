/**
 * RADIATION PATTERN — 03 ENGINEERING
 *
 * Diagrama polar de un arreglo directivo. Los lóbulos NO están dibujados a ojo:
 * se calculan con el factor de arreglo real
 *
 *     ψ(θ) = 2π · d · cos θ + β
 *     AF(θ) = | sin(N ψ / 2) / (N · sin(ψ / 2)) |
 *
 * sobre un arreglo de 5 elementos con espaciado 0.35 λ. De ahí salen el lóbulo
 * principal y los secundarios, con sus nulos exactos.
 *
 * Vectorial y no WebGL a propósito: es un instrumento de medida, y un diagrama
 * se lee mejor nítido. La pieza 3D de esta escena es el dato, no el adorno.
 */

import { useMemo } from "react";
import "./radiation.css";

const N = 5; // elementos del arreglo
const D = 0.35; // espaciado, en longitudes de onda

/** Factor de arreglo normalizado, de 0 a 1. */
function factor(theta: number): number {
  const psi = 2 * Math.PI * D * Math.cos(theta);
  const num = Math.sin((N * psi) / 2);
  const den = N * Math.sin(psi / 2);
  if (Math.abs(den) < 1e-9) return 1;
  return Math.abs(num / den);
}

export function RadiationPattern({ banda = 0 }: { banda?: number }) {
  const { lobulos, radio, cx, cy } = useMemo(() => {
    const R = 140;
    const c = 170;
    const puntos: [number, number][] = [];
    const pasos = 720;

    for (let i = 0; i <= pasos; i++) {
      const theta = (i / pasos) * Math.PI * 2;
      const r = factor(theta) * R;
      // θ se mide desde el eje del arreglo; se dibuja en el plano de elevación.
      const x = c + r * Math.sin(theta);
      const y = c - r * Math.cos(theta);
      puntos.push([x, y]);
    }

    // Máximos locales, para marcar los lóbulos.
    const lobs: { ang: number; amp: number }[] = [];
    for (let i = 1; i < pasos; i++) {
      const a0 = factor(((i - 1) / pasos) * Math.PI * 2);
      const a1 = factor((i / pasos) * Math.PI * 2);
      const a2 = factor(((i + 1) / pasos) * Math.PI * 2);
      if (a1 > a0 && a1 >= a2 && a1 > 0.12) {
        lobs.push({ ang: (i / pasos) * 360, amp: a1 });
      }
    }

    return {
      lobulos: lobs,
      radio: R,
      cx: c,
      cy: c,
    };
  }, []);

  const trazo = useMemo(() => {
    const pasos = 720;
    const R = radio;
    let d = "";
    for (let i = 0; i <= pasos; i++) {
      const theta = (i / pasos) * Math.PI * 2;
      const r = factor(theta) * R;
      const x = (cx + r * Math.sin(theta)).toFixed(2);
      const y = (cy - r * Math.cos(theta)).toFixed(2);
      d += `${i === 0 ? "M" : "L"}${x},${y} `;
    }
    return d + "Z";
  }, [radio, cx, cy]);

  return (
    <figure className="polar" role="img" aria-label={
      "Diagrama polar de radiación de un arreglo directivo de cinco elementos"
    }>
      <svg viewBox="0 0 340 340" className="polar__svg">
        {/* Retícula de medida: anillos cada 0,25 y radios cada 30°. */}
        <g className="polar__reticula" aria-hidden="true">
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <circle key={f} cx={cx} cy={cy} r={radio * f} />
          ))}
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={cx + radio * Math.sin(a)}
                y2={cy - radio * Math.cos(a)}
              />
            );
          })}
          <line className="polar__horizonte" x1={cx - radio} y1={cy} x2={cx + radio} y2={cy} />
        </g>

        {/* El patrón calculado. */}
        <path className="polar__patron" d={trazo} />
        <path className="polar__patron-linea" d={trazo} />

        {/* Los máximos se marcan: son el dato que interesa. */}
        <g className="polar__lobulos" aria-hidden="true">
          {lobulos.map((l, i) => {
            const t = (l.ang / 360) * Math.PI * 2;
            const r = l.amp * radio;
            return (
              <circle
                key={i}
                cx={cx + r * Math.sin(t)}
                cy={cy - r * Math.cos(t)}
                r={l.amp > 0.9 ? 4 : 2.5}
                data-principal={l.amp > 0.9}
              />
            );
          })}
        </g>

        {/* Eje del arreglo. */}
        <line className="polar__eje" x1={cx} y1={cy - radio - 18} x2={cx} y2={cy + radio + 18} />

        {/* La banda medida. */}
        <text className="polar__etiqueta" x={cx + radio + 8} y={cy - 6}>
          0°
        </text>
        <text className="polar__etiqueta" x={cx - 6} y={cy - radio - 22}>
          EJE
        </text>
      </svg>

      <figcaption className="polar__pie dato">
        <span>N = {N}</span>
        <span>d = {D.toFixed(2)} λ</span>
        <span>banda {String(banda + 1).padStart(2, "0")}</span>
      </figcaption>
    </figure>
  );
}
