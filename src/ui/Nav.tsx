/**
 * Navegación.
 *
 * No es una barra de menú flotante con fondo translúcido — eso está prohibido
 * (DNA §13.1.6). Es una regla de instrumento: el wordmark, el índice de la
 * escena activa y el idioma. Nada más. Se oculta al bajar y vuelve al subir,
 * porque en un recorrido de cámara la barra estorba.
 */

import { useEffect, useMemo, useState } from "react";
import { useActiveScene } from "@/lib/hooks";
import { hrefFor, LANG_META, useLang } from "@/i18n/language";
import { escenas, navLabels } from "@/content/escenas";
import { resolve } from "@/content/resolve";
import "./nav.css";

const ESCENAS = [
  { id: "entrada", n: "00" },
  { id: "senal", n: "01" },
  { id: "empresa", n: "02" },
  { id: "ingenieria", n: "03" },
  { id: "transmision", n: "04" },
  { id: "proyectos", n: "05" },
  { id: "productos", n: "06" },
  { id: "proceso", n: "07" },
  { id: "contacto", n: "08" },
] as const;

export default function Nav() {
  const { t, lang, other } = useLang();
  const ids = useMemo(() => ESCENAS.map((e) => e.id), []);
  const activa = useActiveScene(ids);
  const etiquetas = resolve(navLabels, lang);
  const [oculto, setOculto] = useState(false);
  const [abierto, setAbierto] = useState(false);

  // Se retira al bajar, vuelve al subir. Pasado el hero, para no pelear con él.
  useEffect(() => {
    let ultimo = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const delta = y - ultimo;
        if (Math.abs(delta) > 6) {
          setOculto(delta > 0 && y > window.innerHeight * 0.9);
          ultimo = y;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Con el índice abierto, el scroll se detiene y el foco no escapa.
  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", onKey);
    };
  }, [abierto]);

  const ir = (id: string) => {
    setAbierto(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header className="nav" data-oculto={oculto || abierto}>
        <a className="nav__marca" href={hrefFor(lang)} aria-label={etiquetas.inicio}>
          <span className="nav__marca-texto">SENDER</span>
          <span className="nav__marca-claim etiqueta">{t.footer.claim}</span>
        </a>

        <nav className="nav__indice" aria-label={etiquetas.navegar}>
          <ol className="nav__lista">
            {ESCENAS.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  className="nav__punto"
                  data-activa={activa === e.id}
                  onClick={() => ir(e.id)}
                  aria-current={activa === e.id ? "true" : undefined}
                >
                  <span className="nav__punto-n mono">{e.n}</span>
                  <span className="nav__punto-regla" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="nav__acciones">
          <a
            className="nav__idioma etiqueta"
            href={hrefFor(other)}
            lang={LANG_META[other].htmlLang}
            hrefLang={LANG_META[other].code}
            aria-label={`${t.nav.language}: ${LANG_META[other].label}`}
          >
            {LANG_META[other].short}
          </a>
          <button
            type="button"
            className="nav__menu etiqueta"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="indice-escenas"
          >
            <span className="nav__menu-reglas" aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="nav__menu-texto">
              {abierto ? etiquetas.cerrar : etiquetas.abrir}
            </span>
          </button>
        </div>
      </header>

      {/* Índice de escenas. Es la tabla de contenidos del recorrido. */}
      <div className="indice" id="indice-escenas" data-abierto={abierto} aria-hidden={!abierto}>
        <div className="indice__interior">
          <p className="indice__titulo etiqueta">{etiquetas.indice}</p>
          <ol className="indice__lista">
            {ESCENAS.map((e) => (
              <li key={e.id} className="indice__item">
                <button type="button" onClick={() => ir(e.id)} className="indice__enlace">
                  <span className="indice__n mono">{e.n}</span>
                  <span className="indice__nombre">
                    {resolve(escenas, lang).find((x) => x.id === e.id)?.nombre ?? e.id}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
