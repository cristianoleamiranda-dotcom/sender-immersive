/**
 * 08 — CONTACT
 *
 * «¿Qué necesitas transmitir?» El cierre del recorrido. Los datos son los reales
 * y verificados; el formulario NO envía nada a ningún servidor: compone el
 * mensaje en el cliente de correo de quien escribe. Se dice en pantalla.
 *
 * Plantilla L6 (cierre centrado). DNA §5, §12.
 */

import { useMemo, useState } from "react";
import { Kicker, Reveal } from "@/ui/Primitives";
import { useLang } from "@/i18n/language";
import { company, whatsappHref } from "@/content/company";
import "./contact.css";

export default function Contact() {
  const { t, lang } = useLang();
  const [enviando, setEnviando] = useState(false);

  const tipos = t.contact.form.types as unknown as string[];

  const asunto = useMemo(
    () => (lang === "es" ? "Consulta técnica desde sender.cl" : "Technical enquiry from sender.cl"),
    [lang],
  );

  /**
   * El formulario no tiene backend, y es deliberado: no se recogen datos de nadie.
   * Compone un correo y lo abre en el cliente de quien escribe.
   */
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const cuerpo = [
      `${t.contact.form.name}: ${datos.get("nombre") ?? ""}`,
      `${t.contact.form.company}: ${datos.get("empresa") ?? ""}`,
      `${t.contact.form.email}: ${datos.get("correo") ?? ""}`,
      `${t.contact.form.type}: ${datos.get("tipo") ?? ""}`,
      "",
      `${datos.get("mensaje") ?? ""}`,
    ].join("\n");

    setEnviando(true);
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(
      asunto,
    )}&body=${encodeURIComponent(cuerpo)}`;
    window.setTimeout(() => setEnviando(false), 1500);
  };

  return (
    <section className="contacto" id="contacto" data-escena="contacto" aria-label={t.contact.kicker}>
      <div className="contacto__interior">
        <div className="contacto__cabecera">
          <Kicker>{t.contact.kicker}</Kicker>
          <h2 className="contacto__titulo display-l">{t.contact.title}</h2>
          <p className="contacto__sub cuerpo-l">{t.contact.sub}</p>
        </div>

        <div className="contacto__cuerpo">
          {/* Los canales reales. Sin enlaces sociales inventados. */}
          <div className="contacto__canales">
            <dl className="contacto__datos">
              <div className="contacto__dato">
                <dt className="etiqueta">{t.contact.labels.address}</dt>
                <dd>
                  <a
                    className="contacto__enlace"
                    href={company.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {company.addressOneLine[lang]}
                    <span className="contacto__flecha" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </dd>
              </div>

              <div className="contacto__dato">
                <dt className="etiqueta">{t.contact.labels.phone}</dt>
                <dd>
                  <a className="contacto__enlace" href={company.phoneHref}>
                    {company.phone}
                  </a>
                </dd>
              </div>

              <div className="contacto__dato">
                <dt className="etiqueta">{t.contact.labels.email}</dt>
                <dd>
                  <a className="contacto__enlace" href={`mailto:${company.email}`}>
                    {company.email}
                  </a>
                </dd>
              </div>

              <div className="contacto__dato">
                <dt className="etiqueta">{t.contact.labels.salesEmail}</dt>
                <dd>
                  <a className="contacto__enlace" href={`mailto:${company.salesEmail}`}>
                    {company.salesEmail}
                  </a>
                </dd>
              </div>
            </dl>

            <div className="contacto__acciones">
              <a
                className="cta cta--senal"
                href={whatsappHref(lang)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="cta__texto">{t.contact.whatsapp}</span>
                <span className="cta__marca" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* El formulario compone el correo; no almacena nada. */}
          <Reveal className="contacto__form-marco">
            <form className="contacto__form" onSubmit={onSubmit}>
              <h3 className="contacto__form-titulo etiqueta">{t.contact.form.title}</h3>

              <div className="contacto__campo">
                <label className="contacto__label" htmlFor="c-nombre">
                  {t.contact.form.name}
                </label>
                <input
                  className="contacto__input"
                  id="c-nombre"
                  name="nombre"
                  type="text"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="contacto__fila">
                <div className="contacto__campo">
                  <label className="contacto__label" htmlFor="c-empresa">
                    {t.contact.form.company}
                  </label>
                  <input
                    className="contacto__input"
                    id="c-empresa"
                    name="empresa"
                    type="text"
                    autoComplete="organization"
                  />
                </div>
                <div className="contacto__campo">
                  <label className="contacto__label" htmlFor="c-correo">
                    {t.contact.form.email}
                  </label>
                  <input
                    className="contacto__input"
                    id="c-correo"
                    name="correo"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="contacto__campo">
                <label className="contacto__label" htmlFor="c-tipo">
                  {t.contact.form.type}
                </label>
                <select className="contacto__input contacto__select" id="c-tipo" name="tipo">
                  {tipos.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="contacto__campo">
                <label className="contacto__label" htmlFor="c-mensaje">
                  {t.contact.form.message}
                </label>
                <textarea
                  className="contacto__input contacto__area"
                  id="c-mensaje"
                  name="mensaje"
                  rows={4}
                  required
                />
              </div>

              <button type="submit" className="cta cta--solido contacto__enviar">
                <span className="cta__texto">
                  {enviando ? t.contact.form.preparing : t.contact.form.submit}
                </span>
                <span className="cta__marca" aria-hidden="true" />
              </button>

              {/* El resultado se anuncia: quien no ve el cambio de pantalla
                  del cliente de correo tiene que saber qué ha pasado. */}
              <p className="contacto__nota cuerpo-s" role="status" aria-live="polite">
                {enviando ? t.contact.form.preparing : t.contact.form.note}
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
