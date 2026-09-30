/**
 * SENDER — primitivos de interfaz.
 * El inventario del DESIGN DNA §12, en código.
 */

import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
} from "react";
import { photo, type MediaKey } from "@/content/images";
import { useInView } from "@/lib/hooks";
import "./primitives.css";

/* ── Shell de escena ─────────────────────────────────────────────────── */

interface SceneShellProps extends HTMLAttributes<HTMLElement> {
  /** Índice de escena: "00" … "08". Se ancla al margen exterior (DNA §3.2). */
  index: string;
  id: string;
  /** Etiqueta para el índice de escenas y los lectores. */
  label: string;
  /** Fondo: la escena declara en qué familia tonal vive. */
  tone?: "noche" | "azul" | "papel";
  children: ReactNode;
}

export const SceneShell = forwardRef<HTMLElement, SceneShellProps>(
  function SceneShell(
    { index, id, label, tone = "noche", children, className = "", ...rest },
    ref,
  ) {
    return (
      <section
        ref={ref}
        id={id}
        data-escena={id}
        data-tono={tone}
        aria-label={label}
        className={`escena ${className}`}
        {...rest}
      >
        <span className="escena__indice mono" aria-hidden="true">
          {index}
        </span>
        {children}
      </section>
    );
  },
);

/* ── Retícula de instrumentación (DNA §3.1) ──────────────────────────── */

export function GuidesOverlay({ visible = false }: { visible?: boolean }) {
  return (
    <div className="guias" data-visibles={visible} aria-hidden="true">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
        <span
          key={n}
          className="guias__linea"
          style={{ left: `calc(var(--margen) + (100% - var(--margen) * 2) / 12 * ${n})` }}
        />
      ))}
    </div>
  );
}

/* ── Tipografía ──────────────────────────────────────────────────────── */

export function Kicker({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`kicker etiqueta ${className}`}>{children}</p>;
}

/** Titular por líneas. Cada línea entra por separado: da ritmo de locución. */
export function DisplayTitle({
  lines,
  size = "l",
  as: Tag = "h2",
  className = "",
}: {
  lines: readonly string[];
  size?: "l" | "xl" | "m";
  as?: ElementType;
  className?: string;
}) {
  const cls = size === "xl" ? "display-xl" : size === "m" ? "display-m" : "display-l";
  return (
    <Tag className={`titular ${cls} ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className="titular__linea">
          <span className="titular__texto">{line}</span>
        </span>
      ))}
    </Tag>
  );
}

export function Lead({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`entradilla cuerpo-l medida ${className}`}>{children}</p>;
}

/** Bloque que se revela al entrar en el viewport. Respetuoso con reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref}
      className={`revelar ${className}`}
      data-visible={inView}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}

/* ── Dato ────────────────────────────────────────────────────────────── */

export function DataRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="fila">
      <dt className="fila__etiq etiqueta">{label}</dt>
      <dd className="fila__val dato">{value}</dd>
      {note ? <dd className="fila__nota cuerpo-s">{note}</dd> : null}
    </div>
  );
}

export function DataList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <dl className={`lista-datos ${className}`}>{children}</dl>;
}

/* ── Figura fotográfica ──────────────────────────────────────────────── */

interface FigureProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  /** Clave de una de las 10 fotografías reales. */
  media: MediaKey;
  /** Texto alternativo en el idioma activo. Obligatorio: nunca decorativo. */
  alt: string;
  /** Tamaño sugerido para el navegador. Se ajusta al hueco real de la escena. */
  sizes?: string;
  /** El grade se puede atenuar donde la foto es el sujeto documental. */
  grade?: "completo" | "suave" | "ninguno";
  /** Punto de interés del recorte. Se fija POR FOTO, nunca por defecto. */
  focus?: string;
  priority?: boolean;
  className?: string;
}

export function Figure({
  media,
  alt,
  sizes = "100vw",
  grade = "completo",
  focus = "50% 50%",
  priority = false,
  className = "",
  ...rest
}: FigureProps) {
  const m = photo(media);
  const { ref, inView } = useInView<HTMLDivElement>({
    threshold: 0.01,
    rootMargin: "9999px 0px 300px 0px",
  });

  return (
    <figure
      ref={ref}
      className={`figura figura--${grade} ${className}`}
      style={{ ["--aspect" as string]: String(m.aspect) }}
    >
      <div className="figura__marco">
        {inView || priority ? (
          <picture>
            {/* AVIF primero; WebP después; JPG de respaldo. Nunca una caja vacía. */}
            <source type="image/avif" srcSet={m.srcSet("avif")} sizes={sizes} />
            <source type="image/webp" srcSet={m.srcSet("webp")} sizes={sizes} />
            <img
              className="figura__medio"
              src={m.master}
              alt={alt}
              width={m.width}
              height={m.height}
              sizes={sizes}
              loading={priority ? "eager" : "lazy"}
              decoding={priority ? "sync" : "async"}
              {...(priority ? { fetchpriority: "high" } : {})}
              style={{ objectPosition: focus }}
              {...rest}
            />
          </picture>
        ) : null}
        {/* Capa de grade: toma el tono del sistema y conserva la luminancia real. */}
        {grade !== "ninguno" ? <span className="figura__grade" aria-hidden="true" /> : null}
        <span className="figura__grano" aria-hidden="true" />
      </div>
    </figure>
  );
}

/* ── Acciones ────────────────────────────────────────────────────────── */

export function CTA({
  children,
  href,
  variant = "solido",
  className = "",
  ...rest
}: {
  children: ReactNode;
  href: string;
  variant?: "solido" | "linea" | "senal";
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = /^https?:|^mailto:|^tel:/.test(href);
  return (
    <a
      href={href}
      className={`cta cta--${variant} ${className}`}
      {...(external ? { rel: "noopener noreferrer", target: href.startsWith("http") ? "_blank" : undefined } : {})}
      {...rest}
    >
      <span className="cta__texto">{children}</span>
      <span className="cta__marca" aria-hidden="true" />
    </a>
  );
}

/* ── Indicador de banda ──────────────────────────────────────────────── */

/** Marca de dato. Sólo cian: mide, no decora (DNA §1.4). */
export function BandIndicator({
  code,
  range,
  active = false,
}: {
  code: string;
  range: string;
  active?: boolean;
}) {
  return (
    <div className="banda" data-activa={active}>
      <span className="banda__code mono">{code}</span>
      <span className="banda__range dato">{range}</span>
      <span className="banda__pulso" aria-hidden="true" />
    </div>
  );
}
