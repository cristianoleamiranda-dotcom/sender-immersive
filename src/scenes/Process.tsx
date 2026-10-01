/**
 * 07 — PROCESS
 *
 * La plataforma de automatización y las cuatro razones técnicas. El panel de
 * instrumentación muestra los canales de monitoreo DOCUMENTADOS del sistema
 * NAVTEX y del procesador BIS-AP735 — y lo declara en pantalla. No es telemetría
 * en vivo y no se hace pasar por ello: eso es lo que separa este panel de un
 * dashboard genérico (DNA §13.1.4).
 *
 * Plantilla L3 + L5. DNA §5.
 */

import { useEffect, useRef, useState } from "react";
import { Figure, Kicker, Lead, Reveal } from "@/ui/Primitives";
import { useLang } from "@/i18n/language";
import { useReducedMotion } from "@/lib/hooks";
import "./process.css";

export default function Process() {
  const { t, lang } = useLang();
  const reduced = useReducedMotion();
  const [latido, setLatido] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const modulos = t.automation.modules as unknown as {
    index: string;
    title: string;
    text: string;
  }[];
  const canales = t.automation.channels as unknown as {
    id: string;
    label: string;
    unit: string;
    range: string;
    kind: "bar" | "state";
  }[];
  const razones = t.reasons.items as unknown as {
    index: string;
    word: string;
    text: string;
  }[];
  const titulo = t.automation.title as unknown as string[];

  // El panel late despacio: está vivo, pero no finge medir.
  useEffect(() => {
    if (reduced) return;
    const el = panelRef.current;
    if (!el) return;
    let io: IntersectionObserver | null = null;
    let id = 0;
    io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !id) {
        id = window.setInterval(() => setLatido((v) => v + 1), 2400);
      } else if (!e.isIntersecting && id) {
        clearInterval(id);
        id = 0;
      }
    });
    io.observe(el);
    return () => {
      io?.disconnect();
      if (id) clearInterval(id);
    };
  }, [reduced]);

  return (
    <section
      className="proceso"
      id="proceso"
      data-escena="proceso"
      aria-label={t.automation.kicker}
    >
      <div className="reticula proc__cabecera">
        <div className="col-7">
          <Kicker>{t.automation.kicker}</Kicker>
          <h2 className="proc__titulo display-l">
            {titulo.map((l, i) => (
              <span key={i} className="proc__titulo-linea">
                {l}
              </span>
            ))}
          </h2>
        </div>
        <div className="col-5">
          <Lead>{t.automation.intro}</Lead>
        </div>
      </div>

      {/* La consola. Instrumento, no adorno. */}
      <div className="proc__consola" ref={panelRef}>
        <div className="proc__consola-barra">
          <span className="proc__consola-titulo etiqueta">
            {lang === "es" ? "Canales de monitoreo" : "Monitoring channels"}
          </span>
          {/* La declaración obligatoria: esto no es telemetría en vivo. */}
          <span className="proc__consola-estado dato">
            <span className="proc__consola-punto" data-latido={latido % 2} aria-hidden="true" />
            {t.automation.statusSimulated}
          </span>
        </div>

        <div className="proc__canales">
          {canales.map((c, i) => (
            <div key={c.id} className="proc__canal" data-tipo={c.kind}>
              <span className="proc__canal-etq etiqueta">{c.label}</span>
              <span className="proc__canal-u dato">{c.unit}</span>
              <span className="proc__canal-rango dato">{c.range}</span>
              <span className="proc__canal-marca" aria-hidden="true">
                <span
                  className="proc__canal-nivel"
                  style={{
                    // Posición estable por canal: no simula una lectura aleatoria.
                    width: `${34 + ((i * 37) % 52)}%`,
                  }}
                />
              </span>
            </div>
          ))}
        </div>

        <p className="proc__consola-nota cuerpo-s">{t.automation.note}</p>
      </div>

      {/* Los cuatro módulos del sistema. */}
      <ol className="reticula proc__modulos">
        {modulos.map((m, i) => (
          <li key={m.index} className="col-5 proc__modulo">
            <Reveal delay={i * 50}>
              <span className="proc__modulo-n mono">{m.index}</span>
              <h3 className="proc__modulo-titulo">{m.title}</h3>
              <p className="proc__modulo-texto cuerpo-s">{m.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>

      <div className="reticula proc__materia">
        <div className="col-5">
          <Reveal>
            <Figure
              media="cap-transmission"
              alt={
                lang === "es"
                  ? "Aislador y trampa de radiofrecuencia en campo abierto bajo cielo de tormenta"
                  : "Radio-frequency insulator and trap in open field under storm sky"
              }
              sizes="(min-width: 900px) 38vw, 100vw"
              focus="50% 50%"
            />
          </Reveal>
        </div>
        <div className="col-7">
          <h3 className="proc__razones-titulo display-m">
            {(t.reasons.title as unknown as string[]).join(" ")}
          </h3>
          <ol className="proc__razones">
            {razones.map((r) => (
              <li key={r.index} className="proc__razon">
                <span className="proc__razon-n mono">{r.index}</span>
                <div>
                  <h4 className="proc__razon-palabra etiqueta">{r.word}</h4>
                  <p className="proc__razon-texto cuerpo-s">{r.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
