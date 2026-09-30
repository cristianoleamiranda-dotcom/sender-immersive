# SENDER — sitio inmersivo

Reconstrucción desde cero del sitio de Sender. Nueve escenas, una sola línea de
tiempo gobernada por el scroll, sobre las **diez fotografías reales** y el
**video real** de la empresa.

> **Sender** · Tecnología que transmite · Santiago, Chile · +20 años

---

## Empezar

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # compila a dist/
npm run preview      # sirve el build
```

Los medios ya están generados y versionados. Para regenerarlos desde los
originales:

```bash
python3 scripts/optimize-media.py     # originales → AVIF/WebP/JPG + tipos
node scripts/gen-seo.mjs              # sitemap.xml + robots.txt
```

## Verificación

```bash
python3 scripts/audit.py              # reglas duras del brief
python3 scripts/contraste.py          # WCAG 2.1 sobre los tokens reales
npm run typecheck
node scripts/shots.mjs                # QA visual, 4 perfiles × 9 escenas
```

Los tres informes están pensados para leerse: `audit.py` sale con código 1 si se
le pasa `--estricto`, de modo que puede entrar en CI tal cual.

---

## Cómo está organizado

```
docs/
  SENDER-DESIGN-DNA.md    El sistema. Se lee antes de tocar nada.
  DESIGN-REVIEW.md        La crítica, escena por escena.
  AUDITORIA-STEP1.md      El reconocimiento previo: qué había y qué se decidió.
src/
  content/               FUENTE DE VERDAD: textos bilingües, catálogo, proyectos.
  styles/tokens.css      El DNA convertido en variables.
  lib/hooks.ts           Scroll suave, movimiento reducido, foco, visibilidad.
  three/                 Las piezas 3D: el campo de señal y el diagrama polar.
  scenes/                Las nueve escenas, una por archivo.
  ui/                    Primitivos, navegación y pie.
  seo/meta.ts            Metadatos, hreflang y datos estructurados por idioma.
assets/source/           Las 10 fotografías originales. NO SE TOCAN.
scripts/                 Auditoría, contraste, medios, capturas y SEO.
```

**Regla de oro:** `src/content/` es la única fuente de verdad de lo que se dice.
El diseño no inventa contenido, y el contenido no decide diseño.

---

## Las nueve escenas

| | Escena | Qué hace |
|---|---|---|
| 00 | **Entrada** | Video real con el transporte gobernado por el scroll |
| 01 | **La señal** | Campo 3D en GLSL: propagación con decaimiento real |
| 02 | **Sender** | Veinte años, cuatro dominios, la nota de lo que no se publica |
| 03 | **Ingeniería** | Diagrama polar con lóbulos calculados + las seis bandas |
| 04 | **Transmisión** | La cadena de seis etapas, recorrida en horizontal |
| 05 | **Proyectos** | Seis instalaciones documentadas, con su fuente |
| 06 | **Productos** | 16 equipos en 7 estaciones, con especificaciones reales |
| 07 | **Proceso** | Consola de automatización, declarada como demostrativa |
| 08 | **Contacto** | Datos reales; el formulario no envía nada a ningún servidor |

---

## Lo que este proyecto no hace

- **No sustituye fotografías.** Las diez son de Sender. No hay stock, ni
  imágenes generadas, ni placeholders. Si falta una imagen, se resuelve con
  tipografía, retícula o WebGL.
- **No inventa datos.** Sin clientes sin nombre, sin fechas de hitos, sin cifras
  de proyectos, sin certificaciones. El modelo `Project` no tiene campo `year`:
  la interfaz simplemente no lo muestra.
- **No sale de la paleta.** `#FFFFFF` `#1E73BE` `#494949` `#0085B2`, y las
  escalas de luminancia derivadas de ellas. Verificado por `audit.py`.
- **No usa vocabulario de folleto.** *Innovative solutions*, *cutting-edge*,
  *revolutionary*, *next-generation*, *world-class*: prohibidos y verificados.
- **No mezcla idiomas.** Español e inglés completos, en rutas distintas, con la
  única excepción declarada de la nomenclatura técnica internacional.

---

## Bilingüismo

`/es/` y `/en/` son **documentos distintos**, no un conmutador de cliente. Cada
idioma tiene su `<html lang>`, su `<title>`, su descripción, su `canonical`, su
Open Graph y su JSON-LD, con `hreflang` recíproco y `x-default` sobre español.

Los textos viven como pares `{ es, en }` en el mismo objeto. Eso hace
**estructuralmente imposible** dejar una clave sin traducir: 680 pares
verificados por el auditor.

---

## Accesibilidad

- Movimiento reducido neutralizado de forma **global**, no archivo por archivo.
- Foco visible en todo, `:focus-visible` con 2 px y desplazamiento.
- Trampa de foco en la ficha de producto, con devolución del foco al cerrar.
- Enlace de salto al contenido, primero en el DOM.
- 25 combinaciones de contraste medidas y verificadas contra WCAG AA.
- Todas las imágenes con `alt` real y bilingüe.

---

## Medios

| Pieza | Formato | Peso |
|---|---|---|
| Fotografías (10) | AVIF → WebP → JPG, 640/960/1280/1600 | 11–116 KB por variante |
| Video del hero | MP4 1376×768 | 4,8 MB — **pendiente de optimizar** |
| Fuentes | woff2 subset latin, auto-hospedadas | 22–24 KB × 8 |

Los originales permanecen intactos en `assets/source/` y también se sirven como
`*-master.jpg`, último recurso de compatibilidad. El grade cromático es de
**presentación** (`mix-blend-mode: color`), reversible y sin tocar un solo
archivo. Ver `docs/SENDER-DESIGN-DNA.md` §6.3.

---

## Antes de publicar

1. **Aprobación visual del Hero.** Es el punto de control obligatorio del brief.
2. Optimizar el video (WebM/VP9 + variantes). Es el mayor lastre del sitio.
3. Prerender para que `title` y `hreflang` vengan del servidor.
4. Lighthouse con presupuesto en CI.

El detalle completo está en `docs/DESIGN-REVIEW.md` §14.

## Publicar

El sitio se publica en `cristianoleamiranda-dotcom/sender-immersive`, que ya
tiene Pages activo por Actions (`.github/workflows/pages.yml`).

```bash
npm run build:pages                  # compila con la base del subdirectorio
node scripts/serve-pages.mjs 8899    # y lo sirve como lo sirve Pages
GITHUB_TOKEN=github_pat_… bash scripts/publicar.sh
```

`publicar.sh` clona el repositorio, aplica este árbol sobre la rama
`immersive-redesign`, hace los 12 commits por hito, empuja y **lanza el
despliegue desde esa rama**. `main` no se toca: sigue sirviendo el sitio
publicado actual y volver atrás es disparar el workflow sobre `main`.

El token va **por entorno, nunca por argumento**, para que no quede en el
historial del shell.

El entorno `github-pages` del repositorio solo permite desplegar desde `main`.
Para publicar desde otra rama hay que añadirla a las políticas de rama del
entorno; el detalle está en `docs/PUBLICAR.md`, con el comando exacto.

Publicado en **https://cristianoleamiranda-dotcom.github.io/sender-immersive/**.

### Bajo subdirectorio

Pages sirve el sitio en `https://…github.io/sender-immersive/`, no en la raíz
del dominio, y eso rompe dos cosas que conviene no volver a descubrir a golpes:

- **Rutas absolutas.** Cualquier `/algo` apunta a `usuario.github.io/algo`. Todo
  enlace pasa por `withBase()` de `src/lib/base.ts`; `hrefFor()` en el idioma y
  `postbuild.mjs` en el HTML.
- **Pages sirve archivos, no rutas.** Sin un `es/index.html` real, un enlace
  directo a `/es/` cae en el 404. `scripts/postbuild.mjs` genera ese archivo, el
  de `en/` y el `404.html`.

`scripts/serve-pages.mjs` reproduce esas dos condiciones en `localhost:8899`
**respondiendo a `Range` con 206**: sin rangos, el navegador aborta el video y
parece un error del sitio cuando el error es del simulador.
