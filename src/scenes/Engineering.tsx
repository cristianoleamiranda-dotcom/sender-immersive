/**
 * 03 — ENGINEERING
 *
 * «No solo vendemos equipos. Diseñamos soluciones.» Seis disciplinas y, al lado,
 * el instrumento: un diagrama polar de radiación calculado de verdad —los lóbulos
 * salen de la fórmula de un arreglo— y las seis bandas de operación con sus
 * rangos documentados.
 *
 * Plantilla L5 (retícula de datos). DNA §5, §8.2.
 */

import { useState } from "react";
import { Kicker, Lead, Reveal, DataRow, DataList, Figure } from "@/ui/Primitives";
import { useLang, useCatalog } from "@/i18n/language";
import { RadiationPattern } from "@/three/RadiationPattern";
import "./engineering.css";

export default function Engineering() {
  const { t, lang } = useLang();
  const { bands } = useCatalog();
  const [banda, setBanda] = useState(0);

  const disciplinas = t.engineering.disciplines as unknown as {
    index: string;
    name: string;
    text: string;
  }[];
  const titulo = t.engineering.title as unknown as string[];

  return (
    <section
      className="ingenieria"
      id="ingenieria"
      data-escena="ingenieria"
      aria-label={t.engineering.kicker}
    >
      <div className="reticula ing__cabecera">
        <div className="col-7">
          <Kicker>{t.engineering.kicker}</Kicker>
          <h2 className="ing__titulo display-l">
            {titulo.map((l, i) => (
              <span key={i} className="ing__titulo-linea">
                {l}
              </span>
            ))}
          </h2>
        </div>
        <div className="col-5">
          <Lead>{t.engineering.intro}</Lead>
        </div>
      </div>

      {/* Las seis disciplinas: qué se hace en cada una. */}
      <ol className="reticula ing__disciplinas">
        {disciplinas.map((d, i) => (
          <li key={d.index} className="col-4 ing__disciplina">
            <Reveal delay={i * 50}>
              <span className="ing__disc-n mono">{d.index}</span>
              <h3 className="ing__disc-nombre etiqueta">{d.name}</h3>
              <p className="ing__disc-texto cuerpo-s">{d.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>

      {/* El instrumento y la banda que se está midiendo. */}
      <div className="reticula ing__panel">
        <div className="col-7 ing__instrumento">
          <div className="ing__instrumento-marco">
            <RadiationPattern banda={banda} />
          </div>
          <p className="ing__instrumento-pie cuerpo-s">
            {lang === "es"
              ? "Diagrama polar de un arreglo directivo. El lóbulo principal apunta al horizonte; los secundarios son el precio de la directividad."
              : "Polar diagram of a directive array. The main lobe points to the horizon; the secondary lobes are the price of directivity."}
          </p>
        </div>

        <div className="col-5">
          <h3 className="ing__bandas-titulo etiqueta">
            {lang === "es" ? "Bandas de operación" : "Operating bands"}
          </h3>
          <ul className="ing__bandas">
            {bands.map((b, i) => (
              <li key={b.code}>
                <button
                  type="button"
                  className="ing__banda"
                  data-activa={i === banda}
                  onClick={() => setBanda(i)}
                  onMouseEnter={() => setBanda(i)}
                >
                  <span className="ing__banda-code mono">{b.code}</span>
                  <span className="ing__banda-range dato">{b.range}</span>
                  <span className="ing__banda-uso cuerpo-s">{b.use}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="ing__nota cuerpo-s">{t.solutions.bandsNote}</p>
        </div>
      </div>

      {/* El componente real: sin él, el diagrama sería una abstracción. */}
      <div className="reticula ing__materia">
        <div className="col-5">
          <Reveal>
            <Figure
              media="cap-rf"
              alt={
                lang === "es"
                  ? "Componentes de radiofrecuencia: toroides, condensadores y semiconductores de potencia"
                  : "Radio-frequency components: toroids, capacitors and power semiconductors"
              }
              sizes="(min-width: 900px) 38vw, 100vw"
              focus="50% 50%"
            />
          </Reveal>
        </div>
        <div className="col-7 ing__materia-texto">
          <h3 className="ing__materia-titulo display-m">
            {lang === "es"
              ? "La ingeniería se mide en milímetros"
              : "Engineering is measured in millimetres"}
          </h3>
          <DataList>
            <DataRow
              label={lang === "es" ? "Potencia HF" : "HF power"}
              value="1 kW"
              note={lang === "es" ? "Servicio continuo" : "Continuous duty"}
            />
            <DataRow label={lang === "es" ? "Rango HF" : "HF range"} value="2 – 30 MHz" />
            <DataRow
              label={lang === "es" ? "Línea coaxial" : "Coaxial line"}
              value={'Heliax® 1/2" · LMR-400'}
            />
            <DataRow
              label={lang === "es" ? "Ambientes" : "Environments"}
              value={lang === "es" ? "Costeros de alta salinidad" : "High-salinity coastal"}
              note={
                lang === "es"
                  ? "Operación continua 24/7"
                  : "Continuous 24/7 operation"
              }
            />
          </DataList>
        </div>
      </div>
    </section>
  );
}
