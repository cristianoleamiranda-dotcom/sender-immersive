/**
 * SENDER — las nueve escenas del recorrido.
 *
 * Los nombres son los del brief de arquitectura. Las etiquetas largas
 * reutilizan, cuando existe, el kicker ya auditado de `site.ts`: no se
 * inventa nomenclatura nueva si el proyecto ya la tenía.
 */

import type { Loc } from "./types";

export interface EscenaMeta {
  id: string;
  n: string;
  nombre: Loc;
  /** Descripción corta para el índice. */
  detalle: Loc;
}

export const escenas: EscenaMeta[] = [
  {
    id: "entrada",
    n: "00",
    nombre: { es: "Entrada", en: "Entry" },
    detalle: { es: "La torre, el atardecer, el oficio", en: "The tower, the dusk, the craft" },
  },
  {
    id: "senal",
    n: "01",
    nombre: { es: "La señal", en: "The signal" },
    detalle: { es: "No se ve. Se experimenta.", en: "It is not seen. It is experienced." },
  },
  {
    id: "empresa",
    n: "02",
    nombre: { es: "Sender", en: "Sender" },
    detalle: { es: "Veinte años de ingeniería propia", en: "Twenty years of in-house engineering" },
  },
  {
    id: "ingenieria",
    n: "03",
    nombre: { es: "Ingeniería", en: "Engineering" },
    detalle: { es: "Diseño, RF, broadcast, integración", en: "Design, RF, broadcast, integration" },
  },
  {
    id: "transmision",
    n: "04",
    nombre: { es: "Transmisión", en: "Transmission" },
    detalle: { es: "De la consola a la antena", en: "From the console to the antenna" },
  },
  {
    id: "proyectos",
    n: "05",
    nombre: { es: "Proyectos", en: "Projects" },
    detalle: { es: "Solo lo documentado", en: "Only what is documented" },
  },
  {
    id: "productos",
    n: "06",
    nombre: { es: "Productos", en: "Products" },
    detalle: { es: "Dieciséis equipos, siete estaciones", en: "Sixteen products, seven stations" },
  },
  {
    id: "proceso",
    n: "07",
    nombre: { es: "Proceso", en: "Process" },
    detalle: { es: "Automatización y monitoreo", en: "Automation and monitoring" },
  },
  {
    id: "contacto",
    n: "08",
    nombre: { es: "Contacto", en: "Contact" },
    detalle: { es: "Blanco Viel 1108, San Miguel", en: "Blanco Viel 1108, San Miguel" },
  },
];

/** Etiquetas de la interfaz de navegación. */
export const navLabels = {
  indice: { es: "Índice", en: "Index" },
  abrir: { es: "Escenas", en: "Scenes" },
  cerrar: { es: "Cerrar", en: "Close" },
  navegar: { es: "Índice de escenas", en: "Scene index" },
  inicio: { es: "Sender — inicio", en: "Sender — home" },
} as const;
