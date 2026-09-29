import { useEffect, useState } from "react";
import { images, posters } from "@/data/images";
import { company } from "@/data/company";
import { useI18n } from "@/i18n/context";
import { SignalCanvas } from "@/components/motion/SignalCanvas";
import { SignalField } from "@/three/components/SignalField";

export function Hero() {
  const { ui } = useI18n();
  const [progress, setProgress] = useState(0);
  // El film real de SENDER es el fondo del entorno de transmisión en todos los
  // viewports (brief §28: en móvil, video nativo en vez de desactivar todo).
  // Reduced-motion: solo fotografía, sin reproducción.
  const [videoOn] = useState(
    () => typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [videoReady, setVideoReady] = useState(false);
  // Secuencia de entrada (DNA §9 / brief §17): señal → campo → SENDER → líneas.
  // Estado natural "done" = secuencia ya ocurrida; solo se anima cuando el
  // dispositivo no pide reduced-motion. El primer scroll la salta.
  const [intro, setIntro] = useState<"play" | "done">(() =>
    typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "play"
      : "done",
  );

  useEffect(() => {
    if (intro !== "play") return;
    const done = () => setIntro("done");
    const timer = window.setTimeout(done, 2900);
    window.addEventListener("scroll", done, { once: true, passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", done);
    };
  }, [intro]);

  useEffect(() => {
    const root = document.querySelector("[data-hero]");
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const measure = () => {
      const rect = root.getBoundingClientRect();
      const total = root.clientHeight - window.innerHeight;
      const p = total <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / total));
      setProgress(p);
      const photo = root.querySelector<HTMLElement>("[data-hero-photo]");
      if (photo && !reduced) {
        const inset = 46 * (1 - p);
        const side = 6 * (1 - p);
        photo.style.clipPath = `inset(${inset}% ${side}% ${inset}% ${side}%)`;
        photo.style.transform = `scale(${1.08 - p * 0.08})`;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="inicio" className="hero" data-theme="dark" data-hero data-intro={intro}>
      <div className="hero-pin">
        {videoOn ? (
          <video
            className={`hero-video${videoReady ? " is-on" : ""}`}
            poster={posters.lg}
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
            onCanPlay={() => setVideoReady(true)}
            aria-label={ui.hero.videoLabel}
          >
            <source src={images.heroVideo} type="video/mp4" />
          </video>
        ) : null}
        <img
          data-hero-photo
          className="hero-photo"
          src={images.hero}
          srcSet={`${posters.sm} 640w, ${posters.md} 960w, ${posters.lg} 1280w`}
          sizes="100vw"
          alt={ui.meta.ogAlt}
          fetchPriority="high"
          decoding="async"
        />
        <SignalCanvas className="hero-canvas" variant="hero" progress={progress} />
        <SignalField className="hero-gl" mode="hero" progress={progress} active />
        <div className="hero-veil" />
        <svg
          className="hero-signalpath"
          viewBox="0 0 1440 520"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <path
            className="sp-trace"
            pathLength={1000}
            d="M -40 260 H 340 L 400 214 L 460 306 L 520 184 L 580 328 L 640 244 L 700 280 L 860 260 H 1480"
          />
          <circle cx="150" cy="260" r="3" />
          <circle cx="1290" cy="260" r="3" />
        </svg>
        <div className="hero-copy">
          <p className="hero-disciplines">
            {ui.hero.disciplines.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </p>
          <h1>
            <span className="wordmark">SENDER</span>
            <span className="hero-lines">
              {ui.hero.lineA}
              <br />
              {ui.hero.lineB}
            </span>
          </h1>
          <p className="hero-place">{ui.hero.place}</p>
          <div className="hero-foot">
            <span>
              {company.address.commune} · {company.address.city}
            </span>
            <span className="scroll-cue">
              {ui.hero.scroll}
              <i />
            </span>
            <span>AM · FM · HF · NAVTEX</span>
            <span>20+</span>
          </div>
        </div>
      </div>
    </section>
  );
}
