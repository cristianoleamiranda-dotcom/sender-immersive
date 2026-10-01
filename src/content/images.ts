/**
 * SENDER — RESOLUTOR DE MEDIOS
 *
 * Puente entre las claves de imagen que declara el contenido (`"cap-rf"`) y los
 * archivos reales que produce `scripts/optimize-media.py`.
 *
 * Reglas:
 *  - Los ORIGINALES viven intactos en `assets/source/`. Nunca se regeneran, ni se
 *    sustituyen, ni se sustituyen por stock o por imágenes generadas.
 *  - Aquí NO se altera el color. El grade es de presentación y vive en la capa de
 *    estilos y en los shaders (ver DESIGN DNA §6.3).
 *  - El contenido declara QUÉ fotografía. El componente decide CÓMO servirla.
 */

import { media, type MediaKey } from "./media.generated";

export type { MediaKey };

export type MediaFormat = "avif" | "webp" | "jpg";

const RAW_BASE =
  typeof import.meta !== "undefined" && import.meta.env?.BASE_URL
    ? import.meta.env.BASE_URL
    : "/";

/** Raíz de medios, respetando el `base` del bundler (raíz de dominio o subdirectorio). */
const BASE = `/${RAW_BASE}/media/`.replace(/\/{2,}/g, "/").replace(/\/$/, "");

export interface Media {
  key: MediaKey;
  /** Ancho de la variante servida por defecto (el punto medio de la cascada). */
  width: number;
  height: number;
  /** Relación de aspecto del original. Se usa para reservar el hueco y evitar CLS. */
  aspect: number;
  widths: number[];
  src: (width: number, format?: MediaFormat) => string;
  srcSet: (format: MediaFormat) => string;
  /** La variante más pequeña. Respaldo, póster y `src` del elemento `<img>`. */
  smallest: string;
  /** El original íntegro, sin recomprimir. Último recurso de compatibilidad. */
  master: string;
}

function build(key: MediaKey): Media {
  const entry = media[key];
  const widths = [...entry.widths] as number[];
  const mid = widths[Math.min(widths.length - 1, Math.floor(widths.length / 2))];

  const src = (width: number, format: MediaFormat = "webp") =>
    `${BASE}/${key}-${width}.${format}`;

  return {
    key,
    width: entry.width,
    height: entry.height,
    aspect: entry.aspect,
    widths,
    src,
    srcSet: (format: MediaFormat) =>
      widths.map((w) => `${src(w, format)} ${w}w`).join(", "),
    smallest: src(widths[0], "webp"),
    master: `${BASE}/${key}-master.jpg`,
  };
}

const cache = new Map<MediaKey, Media>();

/** Resuelve una clave de imagen a sus rutas servibles. */
export function photo(key: MediaKey): Media {
  let m = cache.get(key);
  if (!m) {
    m = build(key);
    cache.set(key, m);
  }
  return m;
}

/**
 * Rol de cada fotografía, según DESIGN DNA §6.2.
 * Ninguna foto se usa en un rol que contradiga su contenido real.
 */
export const roles = {
  entry: ["hero", "hero-wide"],
  sender: ["about", "cap-broadcast"],
  engineering: ["cap-transmission", "cap-rf"],
  transmission: ["cap-critical"],
  projects: ["cap-antennas", "proj-stl"],
  products: ["proj-am"],
} as const satisfies Record<string, readonly MediaKey[]>;

export type ImageRole = keyof typeof roles;

/**
 * El video real del hero.
 *
 * Las dimensiones son las del ARCHIVO, verificadas en el navegador
 * (`videoWidth`/`videoHeight`): 1920×1080. El frame del que derivan los pósters
 * venía recortado a 1376×768, pero declarar ese tamaño en el elemento `<video>`
 * reserva un hueco con una relación de aspecto que no es la del video y produce
 * un salto al cargar.
 */
export const heroVideo = {
  src: `${BASE}/sender-hero.mp4`,
  width: 1920,
  height: 1080,
  aspect: 1920 / 1080,
  poster: {
    /** Pósters derivados del frame 1 real del video. */
    srcs: [640, 960, 1280].map((w) => `${BASE}/hero-poster-${w}.webp`),
    width: 1376,
    height: 768,
  },
} as const;
