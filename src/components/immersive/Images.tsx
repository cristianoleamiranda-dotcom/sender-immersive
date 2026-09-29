import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { srcset } from "@/data/images";

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  position?: string;
  style?: CSSProperties;
}

function pictureProps(src: string) {
  return srcset[src];
}

export function EditorialImage({ src, alt, className, priority, position, style }: ImageProps) {
  const set = pictureProps(src);
  return (
    <img
      className={className}
      src={src}
      srcSet={set?.srcSet}
      sizes={set?.sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={{ objectPosition: position, ...style }}
    />
  );
}

export function ImmersiveImage(props: ImageProps) {
  return <EditorialImage {...props} priority={props.priority ?? true} />;
}

/**
 * Pipeline imagen→cine (DNA §6/§9, brief §13/§11): fotografía real de SENDER
 * + separación de profundidad + movimiento de cámara lento + barrido de luz.
 * La cámara vive en el wrapper para no pelear con transforms de contexto.
 * Fuera de pantalla la animación se apaga (is-live); reduced-motion nunca ve
 * movimiento (kill global). Si existe un micro-video real de la imagen,
 * pásalo por `video` y el componente lo monta como el film del hero.
 */
export function CinematicImage({
  src,
  alt,
  className,
  priority,
  position,
  style,
  drift = "pan",
  depth = false,
  video,
}: ImageProps & { drift?: "pan" | "zoom" | "none"; depth?: boolean; video?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        el.classList.toggle("is-live", entry.isIntersecting);
        const media = el.querySelector("video");
        if (!media) return;
        if (entry.isIntersecting) void media.play().catch(() => {});
        else media.pause();
      },
      { threshold: 0.22 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Parallax al scroll: la imagen se desplaza verticalmente (hasta ±4%) según
  // su posición en el viewport — cine perceptible, ligado al gesto. Reduced
  // motion: nada. La cámara vive en el wrapper, esto en el medio: no pisan.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const media = el.querySelector<HTMLElement>(".cine-media");
    if (!media) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < -80 || rect.top > vh + 80) return;
      const centro = (rect.top + rect.height / 2 - vh / 2) / vh;
      media.style.transform = `translate3d(0, ${(-centro * 8).toFixed(2)}%, 0) scale(1.08)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`cine cine-${drift}${depth ? " cine-depth" : ""}${className ? ` ${className}` : ""}`}
    >
      {video ? (
        <video
          className="cine-media"
          src={video}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
          style={{ objectPosition: position, ...style }}
        />
      ) : (
        <>
          {depth && (
            <img
              className="cine-back"
              src={src}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              style={{ objectPosition: position }}
            />
          )}
          <img
            className="cine-media"
            src={src}
            srcSet={pictureProps(src)?.srcSet}
            sizes={pictureProps(src)?.sizes}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            style={{ objectPosition: position, ...style }}
          />
        </>
      )}
      <span className="cine-light" aria-hidden="true" />
    </div>
  );
}

export function ParallaxImage({ src, alt, className, position }: ImageProps) {
  return (
    <div className={`parallax ${className ?? ""}`} data-parallax>
      <EditorialImage src={src} alt={alt} position={position} />
    </div>
  );
}

export function DepthImage({ src, alt, caption }: ImageProps & { caption: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => el.classList.toggle("is-live", entry.isIntersecting),
      { threshold: 0.22 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref} className="depth">
      <EditorialImage className="depth-back" src={src} alt="" position="30% 40%" />
      <EditorialImage className="depth-front" src={src} alt={alt} position="62% 40%" />
      <span className="ticks" aria-hidden="true" />
      <figcaption className="figcap">
        <span>{caption}</span>
        <span>SENDER</span>
      </figcaption>
    </figure>
  );
}
