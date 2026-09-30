/**
 * 00 — ENTRY
 *
 * La apertura. No es un hero de frase centrada sobre un degradado: es el
 * material real de Sender —una torre en la cordillera, al atardecer— con el
 * transporte del video gobernado por el scroll. El visitante no mira una
 * animación: mueve la cámara.
 *
 * Plantilla L1 (full-bleed, texto anclado abajo). DESIGN DNA §5, §6.5, §7.
 */

import { useEffect, useRef, useState } from "react";
import { CTA, Kicker } from "@/ui/Primitives";
import { hrefFor, useLang } from "@/i18n/language";
import { heroVideo } from "@/content/images";
import { useReducedMotion, useScrollProgress } from "@/lib/hooks";
import { company } from "@/content/company";
import "./entry.css";

export default function Entry() {
  const { t, lang } = useLang();
  const { ref, progress } = useScrollProgress<HTMLDivElement>();
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [listo, setListo] = useState(false);
  const [videoOk, setVideoOk] = useState(true);

  /**
   * Transporte gobernado por el scroll.
   * El video no se reproduce solo: se posiciona. Con `prefers-reduced-motion`
   * no se toca — queda el póster, que es información suficiente.
   */
  useEffect(() => {
    if (reduced || !videoOk) return;
    const video = videoRef.current;
    if (!video || !listo) return;

    const duracion = video.duration;
    if (!Number.isFinite(duracion) || duracion <= 0) return;

    // El scrub no empieza en el fotograma 0: los primeros 12 % del recorrido
    // son el asentamiento de la entrada, y el video acompaña desde ahí.
    const avance = Math.min(1, Math.max(0, (progress - 0.06) / 0.78));
    const destino = avance * (duracion - 0.05);

    // Umbral de 1/30 s: por debajo, el navegador no redibuja y sólo se gasta CPU.
    if (Math.abs(video.currentTime - destino) > 1 / 30) {
      video.currentTime = destino;
    }
  }, [progress, reduced, listo, videoOk]);

  return (
    <div className="entrada" ref={ref} id="entrada">
      {/* El video es decorativo en el DOM, pero su contenido está descrito en
          el texto visible: no necesita alt propio. */}
      <div className="entrada__medio" aria-hidden={false}>
        {videoOk && !reduced ? (
          <video
            ref={videoRef}
            className="entrada__video"
            data-listo={listo}
            src={heroVideo.src}
            poster={heroVideo.poster.srcs[1]}
            width={heroVideo.width}
            height={heroVideo.height}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            onLoadedMetadata={() => setListo(true)}
            onError={() => setVideoOk(false)}
            aria-hidden="true"
          />
        ) : (
          <img
            className="entrada__video"
            data-listo="true"
            src={heroVideo.poster.srcs[1]}
            width={heroVideo.width}
            height={heroVideo.height}
            alt=""
            aria-hidden="true"
          />
        )}
        {/* El grade: sin él, el naranja del atardecer rompería la paleta. */}
        <span className="entrada__grade" aria-hidden="true" />
        <span className="entrada__velo" aria-hidden="true" />
        <span className="entrada__grano" aria-hidden="true" />
      </div>

      <div className="entrada__contenido">
        <div className="entrada__marca">
          <Kicker>{t.hero.meta[0]}</Kicker>
          <h1 className="entrada__wordmark display-xl">{t.hero.wordmark}</h1>
        </div>

        <div className="entrada__pie">
          <div className="entrada__dicho">
            <p className="entrada__claim display-m">{t.hero.claim}</p>
            <p className="entrada__sub cuerpo-l">{t.hero.sub}</p>
          </div>

          <dl className="entrada__meta">
            <div className="entrada__meta-item">
              <dt className="etiqueta">{lang === "es" ? "Base" : "Base"}</dt>
              <dd className="dato">{company.city[lang]}</dd>
            </div>
            <div className="entrada__meta-item">
              <dt className="etiqueta">{lang === "es" ? "Oficio" : "Craft"}</dt>
              <dd className="dato">
                {lang === "es" ? "Broadcasting · RF" : "Broadcasting · RF"}
              </dd>
            </div>
            <div className="entrada__meta-item">
              <dt className="etiqueta">{lang === "es" ? "Bandas" : "Bands"}</dt>
              <dd className="dato">AM · FM · HF · VHF · NAVTEX</dd>
            </div>
          </dl>

          <div className="entrada__acciones">
            <CTA href={hrefFor(lang, "/", "#senal")} variant="solido">
              {t.hero.primary}
            </CTA>
            <CTA href={hrefFor(lang, "/", "#contacto")} variant="linea">
              {t.hero.secondary}
            </CTA>
          </div>
        </div>

        <p className="entrada__scroll etiqueta" aria-hidden="true">
          <span className="entrada__scroll-texto">{t.hero.scroll}</span>
          <span className="entrada__scroll-regla" />
        </p>
      </div>
    </div>
  );
}
