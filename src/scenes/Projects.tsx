/**
 * 05 — PROJECTS
 *
 * Seis instalaciones documentadas. Ninguna lleva año, porque Sender no publica
 * fechas; la interfaz simplemente no muestra el campo. Donde existe una fuente
 * —Radio World cubrió la instalación de Ambato— se enlaza: la afirmación se
 * puede verificar. Donde no existe, no se adorna con un «cliente líder».
 *
 * Plantilla L2 (split asimétrico). DNA §5, §10.
 */

import { useState } from "react";
import { useMediaQuery } from "@/lib/hooks";
import { Figure, Kicker, Lead, Reveal } from "@/ui/Primitives";
import { useLang, useCatalog } from "@/i18n/language";
import "./projects.css";

export default function Projects() {
  const { t, lang } = useLang();
  const { projects } = useCatalog();
  const [abierto, setAbierto] = useState(0);
  /**
   * En móvil la lista apilada sobre la ficha obligaba a recorrer las seis
   * entradas antes de ver nada. Ahí se comporta como acordeón: la ficha se
   * despliega dentro de la propia entrada. En escritorio se mantiene la lista
   * con la ficha fija al lado.
   */
  const esMovil = useMediaQuery("(max-width: 999px)");

  const titulo = t.projects.title as unknown as string[];
  const actual = projects[abierto];

  /** La ficha de un proyecto. Se usa en los dos modos. */
  const Ficha = ({ p }: { p: (typeof projects)[number] }) => (
    <div className="proy__ficha-texto">
      <h3 className="proy__ficha-nombre display-m">{p.name}</h3>
      <p className="proy__ficha-resumen cuerpo-l medida">{p.summary}</p>
      <dl className="proy__datos">
        <div className="proy__dato">
          <dt className="etiqueta">{lang === "es" ? "Tecnología" : "Technology"}</dt>
          <dd className="dato">{p.technology}</dd>
        </div>
        <div className="proy__dato">
          <dt className="etiqueta">{lang === "es" ? "Lugar" : "Location"}</dt>
          <dd className="dato">{p.location}</dd>
        </div>
      </dl>
      {p.source ? (
        <a className="proy__fuente" href={p.source.url} target="_blank" rel="noopener noreferrer">
          <span className="etiqueta">{t.projects.sourceLabel}</span>
          <span className="proy__fuente-nombre">{p.source.label}</span>
          <span className="proy__fuente-arrow" aria-hidden="true">↗</span>
        </a>
      ) : (
        <p className="proy__sinfuente cuerpo-s">
          {lang === "es" ? "Sin fuente pública enlazada." : "No public source linked."}
        </p>
      )}
    </div>
  );

  return (
    <section
      className="proyectos"
      id="proyectos"
      data-escena="proyectos"
      aria-label={t.projects.kicker}
    >
      <div className="reticula proy__cabecera">
        <div className="col-7">
          <Kicker>{t.projects.kicker}</Kicker>
          <h2 className="proy__titulo display-l">
            {titulo.map((l, i) => (
              <span key={i} className="proy__titulo-linea">
                {l}
              </span>
            ))}
          </h2>
        </div>
        <div className="col-5">
          <Lead>{t.projects.intro}</Lead>
        </div>
      </div>

      <div className="reticula proy__cuerpo">
        {/* La lista es el índice del archivo documental. */}
        <div className="col-5">
          <ol className="proy__lista">
            {projects.map((p, i) => (
              <li key={p.id} className="proy__entrada" data-desplegada={i === abierto}>
                <button
                  type="button"
                  className="proy__item"
                  data-activo={i === abierto}
                  onClick={() => setAbierto(i === abierto && esMovil ? -1 : i)}
                  aria-expanded={esMovil ? i === abierto : undefined}
                >
                  <span className="proy__item-n mono">{p.index}</span>
                  <span className="proy__item-cuerpo">
                    <span className="proy__item-nombre">{p.name}</span>
                    <span className="proy__item-cat etiqueta">
                      {p.category} · {p.location}
                    </span>
                  </span>
                  <span className="proy__item-regla" aria-hidden="true" />
                </button>

                {/* En móvil, la ficha vive aquí dentro. */}
                {esMovil && i === abierto ? (
                  <div className="proy__desplegable">
                    <Figure
                      media={p.image}
                      alt={p.alt}
                      sizes="100vw"
                      focus="50% 45%"
                    />
                    <Ficha p={p} />
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        {/* En escritorio, la ficha activa va al lado. */}
        {!esMovil ? (
          <div className="col-7 proy__ficha">
            <Reveal key={actual.id}>
              <Figure
                media={actual.image}
                alt={actual.alt}
                sizes="(min-width: 900px) 55vw, 100vw"
                focus="50% 45%"
              />
              <Ficha p={actual} />
            </Reveal>
          </div>
        ) : null}
      </div>
    </section>
  );
}
