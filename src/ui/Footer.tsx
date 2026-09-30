/**
 * Pie.
 *
 * Repite los datos reales de contacto y cierra el recorrido. No lleva enlaces
 * sociales porque Sender no los publica: no se inventan canales.
 */

import { hrefFor, LANG_META, useLang } from "@/i18n/language";
import { useCatalog } from "@/i18n/language";
import { escenas } from "@/content/escenas";
import { resolve } from "@/content/resolve";
import "./footer.css";

export default function Footer({ lang }: { lang: "es" | "en" }) {
  const { t, other } = useLang();
  const { company, categories } = useCatalog();
  const lista = resolve(escenas, lang);

  return (
    <footer className="pie" id="pie">
      <div className="pie__interior">
        <div className="pie__bloque">
          <p className="pie__claim display-m">{t.footer.claim}</p>
          <p className="pie__legal cuerpo-s">{t.footer.legal}</p>
        </div>

        <nav className="pie__col" aria-label={t.footer.nav}>
          <h2 className="pie__titulo etiqueta">{t.footer.nav}</h2>
          <ul className="pie__lista">
            {lista.map((e) => (
              <li key={e.id}>
                <a className="pie__enlace cuerpo-s" href={`${hrefFor(lang)}#${e.id}`}>
                  <span className="pie__n mono">{e.n}</span>
                  {e.nombre}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="pie__col" aria-label={t.footer.catalog}>
          <h2 className="pie__titulo etiqueta">{t.footer.catalog}</h2>
          <ul className="pie__lista">
            {categories.map((c) => (
              <li key={c.slug}>
                <a className="pie__enlace cuerpo-s" href={`${hrefFor(lang)}#productos`}>
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pie__col">
          <h2 className="pie__titulo etiqueta">{t.footer.channels}</h2>
          <ul className="pie__lista">
            <li>
              <a className="pie__enlace cuerpo-s" href={company.phoneHref}>
                {company.phone}
              </a>
            </li>
            <li>
              <a className="pie__enlace cuerpo-s" href={`mailto:${company.email}`}>
                {company.email}
              </a>
            </li>
            <li>
              <a
                className="pie__enlace cuerpo-s"
                href={company.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {company.addressOneLine[lang]}
              </a>
            </li>
          </ul>
          <a
            className="pie__idioma etiqueta"
            href={hrefFor(other)}
            hrefLang={LANG_META[other].code}
            lang={LANG_META[other].htmlLang}
          >
            {LANG_META[other].label}
          </a>
        </div>
      </div>

      <div className="pie__base">
        <span className="pie__base-texto dato">
          {company.name} · {company.years} {lang === "es" ? "años" : "years"} ·{" "}
          {company.city[lang]}
        </span>
        <a className="pie__arriba etiqueta" href={`${hrefFor(lang)}#entrada`}>
          {t.footer.back}
        </a>
      </div>
    </footer>
  );
}
