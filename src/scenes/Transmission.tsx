/**
 * 04 — TRANSMISSION
 *
 * «Un sistema de transmisión no es un equipo: es una cadena.» Por eso la escena
 * no es una lista de servicios: es un recorrido de seis estaciones que se
 * despliega en horizontal mientras el scroll avanza en vertical. La cámara
 * —la página— se mueve por el sistema.
 *
 * Plantilla L4 (secuencia horizontal). DNA §5.
 */

import { useEffect, useRef, useState } from "react";
import { Figure, Kicker, Lead, Reveal } from "@/ui/Primitives";
import { useLang } from "@/i18n/language";
import { useReducedMotion } from "@/lib/hooks";
import "./transmission.css";

export default function Transmission() {
  const { t, lang } = useLang();
  const reduced = useReducedMotion();
  const seccion = useRef<HTMLElement>(null);
  const riel = useRef<HTMLOListElement>(null);
  const [avance, setAvance] = useState(0);
  const [activa, setActiva] = useState(0);

  const etapas = t.transmission.stages as unknown as {
    id: string;
    index: string;
    title: string;
    text: string;
  }[];
  const titulo = t.transmission.title as unknown as string[];

  /**
   * El recorrido lateral es el scroll vertical. No hay scroll horizontal
   * secuestrado: el usuario sigue bajando, la cadena avanza.
   */
  useEffect(() => {
    const el = seccion.current;
    const r = riel.current;
    if (!el || !r || reduced) return;

    let raf = 0;
    const medir = () => {
      raf = 0;
      const box = el.getBoundingClientRect();
      const total = box.height - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, -box.top / total));
      setAvance(p);

      // Cuánto hay que desplazar el riel para que su final quede a la vista.
      const sobra = Math.max(0, r.scrollWidth - window.innerWidth + 64);
      // Topado: nunca se desplaza más de lo que sobra, para que no quede
      // hueco vacío al final del raíl en pantallas anchas.
      const desplazamiento = Math.min(sobra, p * sobra);

      /**
       * En vertical —móvil y movimiento reducido— el raíl no se desplaza en
       * horizontal: la cadena se lee de arriba abajo. Sin esta salida, la resta
       * de anchos deja un residuo positivo (el ancho del contenedor menos el de
       * la ventana más 64) y la columna se desplazaba unos píxeles al hacer
       * scroll: un temblor, no un movimiento.
       */
      if (getComputedStyle(r).flexDirection !== "row") {
        r.style.transform = "";
        return;
      }

      r.style.transform = `translate3d(${-desplazamiento}px, 0, 0)`;
      setActiva(Math.min(etapas.length - 1, Math.floor(p * etapas.length * 1.02)));
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
      if (r) r.style.transform = "";
    };
  }, [reduced, etapas.length]);

  return (
    <section
      ref={seccion}
      className="transmision"
      id="transmision"
      data-escena="transmision"
      aria-label={t.transmission.kicker}
    >
      <div className="reticula trans__cabecera">
        <div className="col-7">
          <Kicker>{t.transmission.kicker}</Kicker>
          <h2 className="trans__titulo display-l">
            {titulo.map((l, i) => (
              <span key={i} className="trans__titulo-linea">
                {l}
              </span>
            ))}
          </h2>
        </div>
        <div className="col-5">
          <Lead>{t.transmission.intro}</Lead>
        </div>
      </div>

      {/* La cadena. */}
      <div className="trans__ventana">
        <ol className="trans__riel" ref={riel}>
          {etapas.map((e, i) => (
            <li
              key={e.id}
              className="trans__etapa"
              data-activa={reduced ? true : i === activa}
              data-pasada={!reduced && i < activa}
            >
              <span className="trans__etapa-n mono">{e.index}</span>
              <h3 className="trans__etapa-titulo etiqueta">{e.title}</h3>
              <p className="trans__etapa-texto cuerpo-s">{e.text}</p>
              <span className="trans__etapa-regla" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>

      {/* Progreso del recorrido: una línea, un dato. */}
      <div className="trans__progreso" aria-hidden="true">
        <span
          className="trans__progreso-barra"
          style={{ transform: `scaleX(${reduced ? 0 : avance})` }}
        />
      </div>

      <div className="reticula trans__materia">
        <div className="col-7">
          <Reveal>
            <Figure
              media="cap-critical"
              alt={
                lang === "es"
                  ? "Estación costera de radio con mástil monopolo entre niebla marina"
                  : "Coastal radio station with monopole mast in sea fog"
              }
              sizes="(min-width: 900px) 55vw, 100vw"
              focus="50% 55%"
            />
            <p className="trans__pie cuerpo-s">
              {lang === "es"
                ? "Estación costera. Donde la cadena termina, empieza el alcance."
                : "Coastal station. Where the chain ends, coverage begins."}
            </p>
          </Reveal>
        </div>
        <div className="col-5 trans__cierre">
          <p className="trans__cierre-texto cuerpo-l medida">
            {lang === "es"
              ? "Sender participa en cada etapa de esta cadena. No entrega una caja: entrega el sistema funcionando."
              : "Sender takes part in every stage of this chain. It does not deliver a box: it delivers a working system."}
          </p>
        </div>
      </div>
    </section>
  );
}
