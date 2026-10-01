/**
 * 02 — SENDER
 *
 * La empresa. No un «sobre nosotros»: veinte años, cuatro dominios de ingeniería
 * y cuatro tramos de historia, con la única cifra que Sender publica (+20) y una
 * nota explícita de lo que NO publica. La honestidad es parte del diseño.
 *
 * Plantilla L2 (split asimétrico 7/5). DNA §5.
 */

import { DataRow, DataList, Figure, Kicker, Lead, Reveal } from "@/ui/Primitives";
import { useLang } from "@/i18n/language";
import "./sender-scene.css";

export default function SenderScene() {
  const { t, lang } = useLang();
  const e = t.experience;
  const dominios = e.domains as unknown as {
    index: string;
    name: string;
    text: string;
  }[];
  const eras = e.eras as unknown as {
    index: string;
    label: string;
    text: string;
  }[];

  return (
    <section className="empresa" id="empresa" data-escena="empresa" aria-label={e.kicker}>
      <div className="reticula empresa__cabecera">
        <div className="col-7">
          <Kicker>{e.kicker}</Kicker>
          <div className="empresa__cifra">
            <span className="empresa__valor display-xl">{e.value}</span>
            <span className="empresa__unidad etiqueta">{e.valueLabel}</span>
          </div>
          <Lead>
            {lang === "es"
              ? "Empresa chilena especializada en telecomunicaciones y radiodifusión, con foco en ingeniería y equipamiento RF."
              : "Chilean company specialized in telecommunications and broadcasting, focused on engineering and RF equipment."}
          </Lead>
        </div>

        <div className="col-5 empresa__retrato">
          <Reveal>
            <Figure
              media="about"
              alt={
                lang === "es"
                  ? "Técnico de Sender trabajando sobre instrumental de laboratorio"
                  : "Sender technician working on laboratory instrumentation"
              }
              sizes="(min-width: 900px) 38vw, 100vw"
              focus="54% 46%"
            />
            <p className="empresa__piedefoto cuerpo-s">
              {lang === "es"
                ? "Banco de laboratorio. Instrumental de medición y puesta en marcha."
                : "Laboratory bench. Measurement and commissioning instrumentation."}
            </p>
          </Reveal>
        </div>
      </div>

      {/* Los cuatro dominios: qué se hace, no qué se dice que se hace. */}
      <div className="empresa__dominios">
        <div className="reticula">
          <div className="col-12">
            <h3 className="empresa__titulo display-m">
              {lang === "es" ? "Cuatro dominios de ingeniería" : "Four domains of engineering"}
            </h3>
          </div>
        </div>
        <ol className="reticula empresa__lista-dominios">
          {dominios.map((d) => (
            <li key={d.index} className="col-3 empresa__dominio">
              <Reveal delay={Number(d.index) * 60}>
                <span className="empresa__dominio-n mono">{d.index}</span>
                <h4 className="empresa__dominio-nombre etiqueta">{d.name}</h4>
                <p className="empresa__dominio-texto cuerpo-s">{d.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>

      {/* La historia, en cuatro tramos. Sin fechas: no están documentadas. */}
      <div className="empresa__historia">
        <div className="reticula">
          <div className="col-5">
            <Reveal>
              <Figure
                media="cap-broadcast"
                alt={
                  lang === "es"
                    ? "Sala de racks de radiodifusión con equipos de transmisión"
                    : "Broadcast rack room with transmission equipment"
                }
                sizes="(min-width: 900px) 38vw, 100vw"
                focus="50% 50%"
              />
            </Reveal>
          </div>
          <div className="col-7">
            <ol className="empresa__eras">
              {eras.map((era) => (
                <li key={era.index} className="empresa__era">
                  <span className="empresa__era-n mono">{era.index}</span>
                  <div>
                    <h4 className="empresa__era-label etiqueta">{era.label}</h4>
                    <p className="empresa__era-texto cuerpo-s">{era.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="reticula empresa__alcance">
        <div className="col-7">
          <DataList>
            <DataRow
              label={lang === "es" ? "Alcance" : "Reach"}
              value={(e.reach as unknown as string[]).join(" · ")}
            />
            <DataRow
              label={lang === "es" ? "Base" : "Base"}
              value="Santiago, Chile"
            />
            <DataRow
              label={lang === "es" ? "Disciplinas" : "Disciplines"}
              value={
                lang === "es"
                  ? "Broadcasting · Telecomunicaciones · RF · Automatización"
                  : "Broadcasting · Telecommunications · RF · Automation"
              }
            />
          </DataList>
          {/* La nota que el proyecto ya se había impuesto. Se muestra, no se esconde. */}
          <p className="empresa__nota cuerpo-s">{e.note}</p>
        </div>
      </div>
    </section>
  );
}
