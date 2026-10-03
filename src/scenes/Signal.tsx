/**
 * 01 — SIGNAL
 *
 * «La señal no se ve. Se experimenta.» Es el texto que Sender ya tenía, y es
 * literalmente la tesis del sitio: por eso la escena no *describe* una onda,
 * la pone delante. El campo 3D es la propagación; el recorrido A–E es el viaje
 * de la señal desde que nace hasta que se irradia.
 *
 * Dos caminos, una sola narrativa (§17.6):
 *  - Rig activo (VITE_RIG=r3f + capacidades): el campo vive en el canvas
 *    global, trackeado a este lienzo vía ScrollScene.
 *  - Camino por defecto: canvas propio (SignalCanvas) con su sustituto 2D.
 *
 * Plantilla L3 (rail lateral) + fondo a sangre. DNA §5, §8.
 */

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { Lead, Kicker, Reveal } from "@/ui/Primitives";
import { useLang } from "@/i18n/language";
import { useReducedMotion } from "@/lib/hooks";
import { useRigDisponible } from "@/three/rig";
import SignalCanvas from "@/three/SignalCanvas";
import "./signal.css";

export default function Signal() {
  const { t } = useLang();
  const reduced = useReducedMotion();
  const usaRig = useRigDisponible();
  const seccion = useRef<HTMLElement>(null);
  const lienzo = useRef<HTMLDivElement>(null);
  const [progreso, setProgreso] = useState(0);
  const [etapa, setEtapa] = useState(0);
  const [Rig, setRig] = useState<
    ComponentType<{ track: React.RefObject<HTMLDivElement | null>; energia: number }> | null
  >(null);

  const etapas = t.signal.stages as unknown as {
    index: string;
    name: string;
    text: string;
  }[];

  /** El módulo del rig sólo se descarga si el rig va a usarse. */
  useEffect(() => {
    if (!usaRig) return;
    let vivo = true;
    import("@/three/SignalRig")
      .then((m) => {
        if (vivo) setRig(() => m.default);
      })
      .catch(() => {
        /* Sin rig, sin drama: queda SignalCanvas. */
      });
    return () => {
      vivo = false;
    };
  }, [usaRig]);

  /**
   * El progreso dentro de la escena gobierna la energía del campo y la etapa
   * activa. Es el mismo número para las dos cosas: una sola causa.
   */
  useEffect(() => {
    const el = seccion.current;
    if (!el) return;
    let raf = 0;
    const medir = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, -r.top / total));
      setProgreso(p);
      setEtapa(Math.min(etapas.length - 1, Math.floor(p * etapas.length * 0.999)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [etapas.length]);

  const lineas = useMemo(() => t.signal.title as unknown as string[], [t]);
  const energia = reduced ? 0.4 : progreso;

  return (
    <section
      className="senal"
      id="senal"
      data-escena="senal"
      ref={seccion}
      aria-label={t.signal.kicker}
    >
      <div
        className="senal__lienzo"
        ref={lienzo}
        data-3d="signal-field"
        aria-hidden="true"
      >
        {usaRig && Rig ? (
          <Rig track={lienzo} energia={energia} />
        ) : (
          <SignalCanvas energia={energia} activo />
        )}
      </div>

      <div className="senal__intro">
        <div className="reticula">
          <div className="col-7">
            <Kicker>{t.signal.kicker}</Kicker>
            <h2 className="senal__titulo display-l">
              {lineas.map((l, i) => (
                <span key={i} className="senal__titulo-linea">
                  {l}
                </span>
              ))}
            </h2>
          </div>
          <div className="col-5">
            <div className="senal__cuerpo">
              {t.signal.body.map((p, i) => (
                <p key={i} className="senal__parrafo cuerpo-l medida">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* El recorrido de la señal: cinco etapas, un solo trayecto. */}
      <ol className="senal__etapas" aria-label={t.signal.kicker}>
        {etapas.map((e, i) => (
          <li
            key={e.index}
            className="senal__etapa"
            data-activa={!reduced && i === etapa}
            data-cumplida={!reduced && i < etapa}
          >
            <span className="senal__etapa-indice mono">{e.index}</span>
            <div className="senal__etapa-texto">
              <h3 className="senal__etapa-nombre etiqueta">{e.name}</h3>
              <p className="senal__etapa-dicho cuerpo-l">{e.text}</p>
            </div>
            <span className="senal__etapa-regla" aria-hidden="true" />
          </li>
        ))}
      </ol>

      <div className="senal__cierre">
        <Reveal>
          <Lead className="senal__nota">{t.experience.note}</Lead>
        </Reveal>
      </div>
    </section>
  );
}
