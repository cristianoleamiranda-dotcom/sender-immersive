# SENDER — Engineering the Signal

Sitio inmersivo de SENDER Chile (ingeniería RF, radiodifusión y sistemas de transmisión).
Una sola narrativa continua manejada por el scroll: el desplazamiento mueve una cámara
editorial entre señal, ingeniería, transmisión, radiodifusión, proyectos y contacto.

Todo el contenido factual proviene de [cristianoleamiranda-dotcom/sender](https://github.com/cristianoleamiranda-dotcom/sender) y de las fichas publicadas en [sender.cl](https://www.sender.cl/). Nada se inventó para llenar huecos: ver `docs/CONTENT-INVENTORY.md`.

## Stack

- React 19 + Vite 7 + TypeScript
- GSAP + Lenis (scroll suave; degradación silenciosa)
- Three.js solo en escritorio con puntero fino y sin `prefers-reduced-motion`; en móvil, canvas 2D
- Tipografías: Instrument Sans (interfaz) + IBM Plex Mono (metadatos)

## Comandos

```bash
npm install
npm run dev      # 0.0.0.0:5173
npm run build    # tsc --noEmit && vite build && node scripts/seo.mjs
npm run qa       # equivale a: node qa/check.mjs
```

## QA

```bash
npx tsc --noEmit
node qa/check.mjs
```

## Rutas

`/` · `/en` · `/productos` · `/en/productos` · `/productos/:slug` · `/en/productos/:slug` · `/producto/:slug` · `/en/producto/:slug` · `/soluciones` → `/productos`

## Estructura

```
src/i18n/{es,en}          capas de interfaz
src/data                  hechos: empresa, catálogo, proyectos, ingeniería
src/sections              Hero, Signal, About, Engineering, Products, Projects, Contact
src/three/scenes          SignalScene (WebGL), EngineeringScene (dibujo), ProjectScene (profundidad)
src/components/immersive  sistema de imagen
src/components/motion     Lenis + canvas 2D
```

## Despliegue

GitHub Pages vía `.github/workflows/pages.yml`: build + deploy automático en cada push a `main`
(o manual con *workflow_dispatch*). URL pública:
`https://cristianoleamiranda-dotcom.github.io/sender-immersive/`.

## Licencia

[Unlicense](./LICENSE) — dominio público.
