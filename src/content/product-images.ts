/**
 * SENDER — FOTOGRAFÍAS REALES DE PRODUCTO
 *
 * Las 13 imágenes de public/assets/images/products/ son fotografías reales de
 * equipos SENDER (brief §11, Real Image Policy). Este módulo las conecta al
 * catálogo SIN alterarlas: se sirven tal cual, sin crop automático.
 *
 * Reglas:
 *  - El alt describe el ARCHIVO, no afirma instalaciones concretas (§11).
 *  - Ninguna foto se asigna a un producto cuyo contenido no coincida.
 *  - sitio-torre.jpg aún no está en el repositorio; no se referencia.
 */

/** Ruta servible de una foto de producto (viven en public/, se sirven estáticas). */
export const productPhoto = (file: string) => `assets/images/products/${file}`;

export interface ProductPhoto {
  file: string;
  width: number;
  height: number;
  alt: { es: string; en: string };
}

/**
 * Fotos por CATEGORÍA del catálogo (src/content/catalog.ts).
 * La asignación es por contenido verificado de la imagen, no por decorado.
 */
export const categoryPhotos: Record<string, ProductPhoto[]> = {
  am: [
    {
      file: "familia-am.jpg",
      width: 4, height: 3,
      alt: {
        es: "Familia de transmisores AM de estado sólido SENDER en gabinete",
        en: "Family of SENDER solid-state AM transmitters in cabinet",
      },
    },
    {
      file: "am-10000ss.jpg",
      width: 4, height: 3,
      alt: {
        es: "Transmisor AM de estado sólido de 10000 W, etiqueta frontal del fabricante",
        en: "10000 W solid-state AM transmitter, manufacturer front panel",
      },
    },
    {
      file: "am-5000ss.jpg",
      width: 4, height: 3,
      alt: {
        es: "Transmisor AM de estado sólido de 5000 W",
        en: "5000 W solid-state AM transmitter",
      },
    },
    {
      file: "am-2500ss.jpg",
      width: 4, height: 3,
      alt: {
        es: "Transmisor AM de estado sólido de 2500 W",
        en: "2500 W solid-state AM transmitter",
      },
    },
    {
      file: "am-1000ss.png",
      width: 4, height: 3,
      alt: {
        es: "Transmisor AM de estado sólido de 1000 W",
        en: "1000 W solid-state AM transmitter",
      },
    },
  ],
  stl: [
    {
      file: "stl-stal100.jpg",
      width: 4, height: 3,
      alt: {
        es: "Enlace estudio–planta STL STAL 100, transmisor y receptor",
        en: "STAL 100 studio–transmitter link, transmitter and receiver",
      },
    },
    {
      file: "stl-banner.jpg",
      width: 4, height: 3,
      alt: {
        es: "Serie de enlaces STL de estudio a planta",
        en: "STL studio-to-transmitter link series",
      },
    },
  ],
  audio: [
    {
      file: "circuitos.jpg",
      width: 4, height: 3,
      alt: {
        es: "Circuitos integrados del procesamiento de señal",
        en: "Integrated circuits of the signal processing chain",
      },
    },
  ],
  componentes: [
    {
      file: "atu.jpg",
      width: 4, height: 3,
      alt: {
        es: "Unidad de sintonía de antena (ATU)",
        en: "Antenna tuning unit (ATU)",
      },
    },
    {
      file: "hf-balun.jpg",
      width: 4, height: 3,
      alt: {
        es: "Balun de antena HF",
        en: "HF antenna balun",
      },
    },
    {
      file: "antena-mast.jpg",
      width: 4, height: 3,
      alt: {
        es: "Mástil de antena de radiodifusión",
        en: "Broadcast antenna mast",
      },
    },
  ],
  soluciones: [
    {
      file: "carro-fotovoltaico.jpg",
      width: 4, height: 3,
      alt: {
        es: "Carro fotovoltaico con mástil para transmisión autónoma",
        en: "Photovoltaic cart with mast for autonomous transmission",
      },
    },
  ],
};

/**
 * Fotos de PROYECTO reales. torre-valparaiso.jpg corresponde al proyecto
 * documentado de torre en Valparaíso (catalogo de proyectos del repo).
 */
export const projectPhotos: Record<string, ProductPhoto> = {
  valparaiso: {
    file: "torre-valparaiso.jpg",
    width: 4, height: 3,
    alt: {
      es: "Montaje de torre de comunicaciones con grúa, Valparaíso",
      en: "Communications tower assembly with crane, Valparaíso",
    },
  },
};

/** TODAS las fotos reales disponibles, con su nombre de archivo original. */
export const allProductFiles = [
  "am-1000ss.png", "am-2500ss.jpg", "am-5000ss.jpg", "am-10000ss.jpg",
  "familia-am.jpg", "antena-mast.jpg", "atu.jpg", "hf-balun.jpg",
  "stl-banner.jpg", "stl-stal100.jpg", "torre-valparaiso.jpg",
  "circuitos.jpg", "carro-fotovoltaico.jpg",
] as const;
