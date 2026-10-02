/**
 * SENDER — composición del sitio.
 *
 * Nueve escenas, una sola línea de tiempo. El scroll es la cámara (DNA §7.1).
 * El orden no es una lista de secciones: es el recorrido de la señal, desde que
 * nace hasta que llega a la audiencia, y después el regreso a tierra: quién lo
 * hace, con qué, dónde está y cómo se le habla.
 */

import { lazy, Suspense } from "react";
import { useIso } from "@/lib/hooks";
import Entry from "@/scenes/Entry";
import Nav from "@/ui/Nav";
import { SkipLink } from "@/ui/SkipLink";
import Footer from "@/ui/Footer";
import { useSmoothScroll } from "@/lib/hooks";
import { useLang } from "@/i18n/language";
import { applyMeta } from "@/seo/meta";

/**
 * Las escenas que montan WebGL entran por `lazy`: el primer fotograma útil del
 * sitio no puede esperar a three.js (DNA §8.3).
 */
const Signal = lazy(() => import("@/scenes/Signal"));
const SenderScene = lazy(() => import("@/scenes/SenderScene"));
const Engineering = lazy(() => import("@/scenes/Engineering"));
const Transmission = lazy(() => import("@/scenes/Transmission"));
const Projects = lazy(() => import("@/scenes/Projects"));
const Products = lazy(() => import("@/scenes/Products"));
const Process = lazy(() => import("@/scenes/Process"));
const Contact = lazy(() => import("@/scenes/Contact"));

/** Marcador de carga: nunca un hueco blanco, nunca un spinner genérico. */
function Espera({ cual }: { cual: string }) {
  return (
    <div className="escena__espera" aria-hidden="true" data-escena={cual}>
      <span className="escena__espera-regla" />
    </div>
  );
}

export default function App() {
  useSmoothScroll();
  const { lang, route } = useLang();

  // El documento declara su idioma, su título, su canónica y sus datos
  // estructurados ANTES del primer pintado.
  useIso(() => applyMeta(lang, route.path), [lang, route.path]);

  return (
    <>
      <SkipLink />
      <Nav />
      <main id="contenido">
        <Entry />
        <Suspense fallback={<Espera cual="senal" />}>
          <Signal />
        </Suspense>
        <Suspense fallback={<Espera cual="empresa" />}>
          <SenderScene />
        </Suspense>
        <Suspense fallback={<Espera cual="ingenieria" />}>
          <Engineering />
        </Suspense>
        <Suspense fallback={<Espera cual="transmision" />}>
          <Transmission />
        </Suspense>
        <Suspense fallback={<Espera cual="proyectos" />}>
          <Projects />
        </Suspense>
        <Suspense fallback={<Espera cual="productos" />}>
          <Products />
        </Suspense>
        <Suspense fallback={<Espera cual="proceso" />}>
          <Process />
        </Suspense>
        <Suspense fallback={<Espera cual="contacto" />}>
          <Contact />
        </Suspense>
      </main>
      {/* El pie declara el idioma del enlace de vuelta, no lo adivina. */}
      <Footer lang={lang} />
    </>
  );
}
