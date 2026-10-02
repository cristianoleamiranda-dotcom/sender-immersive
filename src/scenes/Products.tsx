/**
 * 06 — PRODUCTS
 *
 * Dieciséis equipos en siete estaciones de ingeniería, con las especificaciones
 * que Sender ya publica. Nada se añade: ni precios, ni plazos, ni «el mejor del
 * mercado». Donde el catálogo no llega, la ficha lo dice.
 *
 * Dos niveles: categoría → producto. Plantilla L5 (retícula de datos). DNA §5, §12.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Figure, Kicker, Lead, Reveal } from "@/ui/Primitives";
import { hrefFor, useLang, useCatalog } from "@/i18n/language";
import { useFocusTrap } from "@/lib/hooks";
import "./products.css";

export default function Products() {
  const { t, lang, route } = useLang();
  const { categories, products } = useCatalog();
  const [cat, setCat] = useState(() => {
    const clean = route.path.replace(/\/+$/, "");
    if (clean.startsWith("/productos/")) {
      const slug = clean.slice("/productos/".length);
      const idx = categories.findIndex((c) => c.slug === slug);
      if (idx >= 0) return idx;
    } else if (clean.startsWith("/producto/")) {
      const slug = clean.slice("/producto/".length);
      const prod = products.find((p) => p.slug === slug);
      if (prod) {
        const idx = categories.findIndex((c) => c.id === prod.categoryId);
        if (idx >= 0) return idx;
      }
    }
    return 0;
  });
  const [abierto, setAbierto] = useState<string | null>(() => {
    const clean = route.path.replace(/\/+$/, "");
    if (clean.startsWith("/producto/")) {
      const slug = clean.slice("/producto/".length);
      const prod = products.find((p) => p.slug === slug);
      if (prod) return prod.slug;
    }
    return null;
  });

  // Cuando se entra por una ruta profunda (/productos, /productos/:slug, /producto/:slug),
  // desplazar la cámara directamente a la estación de catálogo.
  useEffect(() => {
    const clean = route.path.replace(/\/+$/, "");
    if (
      clean === "/productos" ||
      clean.startsWith("/productos/") ||
      clean.startsWith("/producto/")
    ) {
      const timer = window.setTimeout(() => {
        document.getElementById("productos")?.scrollIntoView({ behavior: "auto", block: "start" });
      }, 120);
      return () => window.clearTimeout(timer);
    }
  }, [route.path]);

  const categoria = categories[cat];
  const deLaCategoria = useMemo(
    () => products.filter((p) => p.categoryId === categoria.id),
    [products, categoria.id],
  );
  const producto = abierto ? products.find((p) => p.slug === abierto) ?? null : null;

  const cerrar = useCallback(() => setAbierto(null), []);

  // El foco queda dentro de la ficha, Escape la cierra, y al salir el foco
  // vuelve al botón que la abrió. Sin esto, con Tab se sale a la página de
  // detrás y quien navega con teclado se pierde.
  const fichaRef = useFocusTrap<HTMLDivElement>(Boolean(producto), cerrar);

  // El scroll de fondo se detiene mientras la ficha está abierta.
  useEffect(() => {
    if (!producto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [producto]);

  const titulo = t.catalogPage.title as unknown as string[];

  return (
    <section
      className="productos"
      id="productos"
      data-escena="productos"
      aria-label={t.catalogPage.kicker}
    >
      <div className="reticula prod__cabecera">
        <div className="col-7">
          <Kicker>{t.catalogPage.kicker}</Kicker>
          <h2 className="prod__titulo display-l">
            {titulo.map((l, i) => (
              <span key={i} className="prod__titulo-linea">
                {l}
              </span>
            ))}
          </h2>
        </div>
        <div className="col-5">
          <Lead>{t.catalogPage.intro}</Lead>
        </div>
      </div>

      {/* Las siete estaciones. */}
      <div className="prod__estaciones" role="tablist" aria-label={t.catalogPage.kicker}>
        {categories.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            className="prod__estacion"
            data-activa={i === cat}
            aria-selected={i === cat}
            onClick={() => {
              setCat(i);
              setAbierto(null);
            }}
          >
            <span className="prod__estacion-n mono">{c.index}</span>
            <span className="prod__estacion-nombre">{c.name}</span>
            <span className="prod__estacion-cuenta dato">
              {String(c.productSlugs.length).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>

      {/* La estación activa: su alcance y sus equipos. */}
      <div className="reticula prod__panel">
        <div className="col-5 prod__contexto">
          <Reveal key={categoria.id}>
            <h3 className="prod__cat-nombre display-m">{categoria.name}</h3>
            <p className="prod__cat-kicker etiqueta">{categoria.kicker}</p>
            <p className="prod__cat-desc cuerpo-l medida">{categoria.description}</p>
            <ul className="prod__alcance">
              {categoria.scope.map((s, i) => (
                <li key={i} className="prod__alcance-item cuerpo-s">
                  <span className="prod__alcance-marca" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
            <Figure
              media={categoria.image}
              alt={categoria.alt}
              sizes="(min-width: 900px) 38vw, 100vw"
              focus="50% 50%"
              className="prod__cat-figura"
            />
          </Reveal>
        </div>

        <div className="col-7">
          <div className="prod__barra">
            <span className="etiqueta">{t.catalogPage.products}</span>
            <span className="dato">
              {String(deLaCategoria.length).padStart(2, "0")} /{" "}
              {String(products.length).padStart(2, "0")}
            </span>
          </div>

          <ul className="prod__lista">
            {deLaCategoria.map((p) => (
              <li key={p.slug}>
                <button
                  type="button"
                  className="prod__item"
                  onClick={() => setAbierto(p.slug)}
                >
                  <span className="prod__item-n mono">{p.index}</span>
                  <span className="prod__item-nombre">{p.name}</span>
                  <span className="prod__item-resumen cuerpo-s">{p.summary}</span>
                  <span className="prod__item-abrir etiqueta">
                    {t.productPage.overview}
                    <span aria-hidden="true"> →</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ficha completa del producto. */}
      {producto ? (
        <div
          ref={fichaRef}
          className="ficha"
          role="dialog"
          aria-modal="true"
          aria-label={producto.name}
        >
          <div className="ficha__velo" onClick={() => setAbierto(null)} aria-hidden="true" />
          <div className="ficha__marco">
            <header className="ficha__cabecera">
              <div>
                <p className="etiqueta ficha__cat">
                  {t.productPage.category} ·{" "}
                  {categories.find((c) => c.id === producto.categoryId)?.name}
                </p>
                <h3 className="ficha__nombre display-m">{producto.name}</h3>
              </div>
              <button
                type="button"
                className="ficha__cerrar etiqueta"
                onClick={() => setAbierto(null)}
                autoFocus
              >
                {t.nav.closeMenu}
              </button>
            </header>

            <div className="ficha__cuerpo">
              <div className="ficha__col">
                <Figure
                  media={producto.image}
                  alt={producto.alt}
                  sizes="(min-width: 900px) 40vw, 100vw"
                  focus="50% 50%"
                />
                <p className="ficha__resumen cuerpo-l">{producto.summary}</p>
              </div>

              <div className="ficha__col">
                <h4 className="ficha__subt etiqueta">{t.productPage.specs}</h4>
                {producto.specs.map((grupo, gi) => (
                  <div key={gi} className="ficha__grupo">
                    <p className="ficha__grupo-titulo dato">{grupo.title}</p>
                    <dl className="ficha__specs">
                      {grupo.rows.map((fila, fi) => (
                        <div key={fi} className="ficha__spec">
                          <dt className="ficha__spec-k">{fila.k}</dt>
                          <dd className="ficha__spec-v dato">{fila.v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}

                {producto.variants?.length ? (
                  <>
                    <h4 className="ficha__subt etiqueta">{t.productPage.variants}</h4>
                    <ul className="ficha__variantes">
                      {producto.variants.map((v, i) => (
                        <li key={i} className="ficha__variante">
                          <span className="dato ficha__variante-modelo">{v.model}</span>
                          <span className="dato ficha__variante-pot">{v.power}</span>
                          <span className="cuerpo-s ficha__variante-det">{v.detail}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {producto.features?.length ? (
                  <>
                    <h4 className="ficha__subt etiqueta">{t.productPage.features}</h4>
                    <ul className="ficha__puntos">
                      {producto.features.map((f, i) => (
                        <li key={i} className="cuerpo-s">{f}</li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {producto.applications?.length ? (
                  <>
                    <h4 className="ficha__subt etiqueta">{t.productPage.applications}</h4>
                    <ul className="ficha__puntos">
                      {producto.applications.map((a, i) => (
                        <li key={i} className="cuerpo-s">{a}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            </div>

            <footer className="ficha__pie">
              <p className="ficha__nota cuerpo-s">{t.productPage.docsPending}</p>
              <div className="ficha__acciones">
                {producto.sourceUrl ? (
                  <a
                    className="cta cta--linea"
                    href={producto.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="cta__texto">{t.productPage.source}</span>
                    <span className="cta__marca" aria-hidden="true" />
                  </a>
                ) : null}
                <a className="cta cta--solido" href={hrefFor(lang, "/", "#contacto")}>
                  <span className="cta__texto">{t.productPage.consult}</span>
                  <span className="cta__marca" aria-hidden="true" />
                </a>
              </div>
            </footer>
          </div>
        </div>
      ) : null}
    </section>
  );
}
