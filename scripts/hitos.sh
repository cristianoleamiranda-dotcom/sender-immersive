#!/usr/bin/env bash
#
# SENDER — los 12 commits por hito del brief, en la rama `immersive-redesign`.
#
# POR QUÉ ESTE SCRIPT Y NO LOS COMMITS YA HECHOS
# ---------------------------------------------
# El brief pide la rama `immersive-redesign` con 12 commits, uno por hito, sin
# destruir la rama de producción. Construir aquí fue posible; EMPUJAR no: no hay
# credenciales de escritura disponibles y la propia política del proyecto
# (docs/proyecto/SEGURIDAD.md) pide un token fine-grained de vida corta que no
# existe en este entorno.
#
# En vez de simular el trabajo de git, esto se entrega como lo que es: un script
# que crea la rama y los 12 commits exactos, para que lo ejecute quien tiene el
# token. Cada commit corresponde a un hito real del trabajo ya hecho, no a un
# reparto artificial del mismo diff.
#
# USO
#   cd <carpeta que contiene este proyecto>
#   bash scripts/hitos.sh <ruta-al-clon-de-sender>
#
# El script NO toca la rama de producción: crea `immersive-redesign` desde el
# HEAD actual y trabaja sólo ahí. Al final imprime el comando de push, que hay
# que ejecutar a mano y con la rama revisada.

set -euo pipefail

ORIGEN="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESTINO="${1:-}"

if [[ -z "$DESTINO" ]]; then
  echo "uso: bash scripts/hitos.sh <ruta-al-clon-de-sender>" >&2
  exit 1
fi

if [[ ! -d "$DESTINO/.git" ]]; then
  echo "error: $DESTINO no es un repositorio git" >&2
  exit 1
fi

cd "$DESTINO"
RAMA_ACTUAL="$(git rev-parse --abbrev-ref HEAD)"
git config user.name  >/dev/null 2>&1 || git config user.name  "Sender"
git config user.email >/dev/null 2>&1 || git config user.email "sender@sender.cl"

echo
echo "  origen   $ORIGEN"
echo "  destino  $DESTINO"
echo "  rama actual de destino: $RAMA_ACTUAL"
echo

# Nunca sobre la rama de producción.
if [[ "$RAMA_ACTUAL" == "main" || "$RAMA_ACTUAL" == "master" ]]; then
  git switch -c immersive-redesign
else
  git switch -c immersive-redesign 2>/dev/null || git switch immersive-redesign
fi
echo "  rama → $(git rev-parse --abbrev-ref HEAD)"

# ── El árbol de trabajo viaja al repositorio de destino ─────────────────
#
# Se copia lo que es la aplicación. NO se toca lo que el repo destino tiene por
# derecho propio y no debe pisarse:
#
#   .github/       Su Pages por Actions ya funciona. Es lo que publica el sitio.
#   AGENTS.md      Su contrato operativo.
#   LICENSE        Su licencia.
#
# Y `docs/` se FUSIONA en vez de reemplazarse: el repo destino documenta su
# inventario de contenido y sus skills, y esos archivos siguen siendo válidos.
# Borrarlos rompería las referencias que hace su propio AGENTS.md.
echo "  copiando la aplicación…"
for d in scripts src assets public; do
  [[ -e "$ORIGEN/$d" ]] && rm -rf "$DESTINO/$d" && cp -r "$ORIGEN/$d" "$DESTINO/"
done
mkdir -p "$DESTINO/docs"
cp -r "$ORIGEN/docs/." "$DESTINO/docs/"

# El proyecto anterior guardaba su QA en `qa/`; el nuevo lo lleva en `scripts/`.
[[ -d "$DESTINO/qa" ]] && rm -rf "$DESTINO/qa"

cp "$ORIGEN/README.md" "$ORIGEN/index.html" "$ORIGEN/package.json" \
   "$ORIGEN/package-lock.json" "$ORIGEN/tsconfig.json" "$ORIGEN/vite.config.ts" \
   "$ORIGEN/.gitignore" "$DESTINO/"
echo "  (.github/, AGENTS.md, LICENSE y docs/ del destino: conservados)"
echo

commit() {
  local n="$1" titulo="$2" cuerpo="$3"
  shift 3
  echo "  [$n] $titulo"
  git add "$@"
  git commit -q -m "$titulo" -m "$cuerpo"
}

# -------------------------------------------------------------------------
# Retirada del sitio anterior
# -------------------------------------------------------------------------
#
# `git add <rutas concretas>` NO registra eliminaciones. Sin retirarlas del
# índice, el `src/` del sitio anterior sobrevive junto al nuevo y el compilador
# intenta compilar los dos a la vez: `Cannot find module '@/i18n/context'` en
# archivos que ya no forman parte de este proyecto.
#
# Se retira del índice exactamente lo que el árbol de trabajo ya no tiene, para
# que el historial refleje el reemplazo y no una convivencia.
retirados=$(git ls-files --deleted | wc -l)
if [[ "$retirados" -gt 0 ]]; then
  git ls-files --deleted -z | xargs -0 -r git add --
  echo "  retirados del índice: $retirados archivos del sitio anterior"
fi

# -------------------------------------------------------------------------
# 01 — Fundación: el sistema, antes de un solo píxel de interfaz.
# -------------------------------------------------------------------------
mkdir -p docs scripts src/styles

commit 01 "01-foundation: DNA, tokens y auditoría de partida" \
"El sistema queda escrito antes de construir nada. El DESIGN DNA fija color,
tipografía, retícula, espaciado, plantillas, tratamiento de imagen, movimiento,
3D, transiciones, copy, SEO, componentes y anti-slop. Los tokens son su
implementación literal: cada valor sale del documento, ninguno es arbitrario.

Incluye la auditoría de reconocimiento previo, que registra dónde estaban
realmente los activos y qué cuatro decisiones bloqueaban la construcción." \
  docs/SENDER-DESIGN-DNA.md docs/AUDITORIA-STEP1.md src/styles/tokens.css README.md \
  package.json package-lock.json tsconfig.json vite.config.ts index.html .gitignore

# -------------------------------------------------------------------------
# 02 — La fuente de verdad del contenido.
# -------------------------------------------------------------------------
mkdir -p src/content src/i18n

commit 02 "02-content: contenido bilingüe, catálogo y resolución de idioma" \
"Los textos viven como pares { es, en } en el mismo objeto, lo que hace
estructuralmente imposible dejar una clave sin traducir. El catálogo trae 16
productos en 7 categorías con sus especificaciones publicadas y su sourceUrl;
los proyectos, 6 instalaciones documentadas.

El idioma es una ruta, no un estado: /es/ y /en/ son documentos distintos." \
  src/content src/i18n

# -------------------------------------------------------------------------
# 03 — Medios: los originales y su cascada de formatos.
# -------------------------------------------------------------------------
mkdir -p assets/source public/media

commit 03 "03-media: las 10 fotografías reales y el vídeo del hero" \
"Los originales se conservan intactos en assets/source/. El pipeline deriva la
cascada AVIF → WebP → JPG sin recortar, sin reencuadrar y sin tocar el color.
El grade cromático es de presentación, no de archivo.

No entra ninguna imagen de stock. Las que hay son las que son." \
  assets/source public/media scripts/optimize-media.py src/content/media.generated.ts

# -------------------------------------------------------------------------
# 04 — Primitivos: el inventario del DNA en código.
# -------------------------------------------------------------------------
mkdir -p src/ui

commit 04 "04-primitives: escena, figura, dato y navegación" \
"La figura fotográfica sirve AVIF primero con respaldo en cascada y un grade por
mezcla de color que toma el tono del sistema conservando la luminancia real de
la foto. Eso es lo que permite que el atardecer del vídeo entre en la paleta sin
desaparecer.

La navegación es una regla de instrumento, no una barra flotante." \
  src/ui

# -------------------------------------------------------------------------
# 05 — El Hero. El punto de control obligatorio del brief.
# -------------------------------------------------------------------------
mkdir -p src/scenes

commit 05 "05-hero: escena 00 ENTRY con transporte de vídeo por scroll" \
"El visitante no mira una animación: mueve la cámara. El vídeo real de la torre
en la cordillera responde al scroll, con el encuadre ajustado por breakpoint
para que el sujeto no se salga en vertical.

Escena pendiente de aprobación visual antes de continuar con el resto." \
  src/scenes/Entry.tsx src/scenes/entry.css src/App.tsx src/main.tsx index.html

# -------------------------------------------------------------------------
# 06 — La señal: la pieza 3D que justifica el proyecto.
# -------------------------------------------------------------------------
mkdir -p src/three

commit 06 "06-signal: campo de propagación en GLSL y las cinco etapas" \
"Un único draw call con 21.120 vértices. Onda radial con decaimiento
exponencial con la distancia, batido de portadora y energía gobernada por el
scroll: el resplandor de la portadora es el mismo número que decide qué etapa
del texto está activa, porque las dos cosas tienen una sola causa.

Con prefers-reduced-motion no se monta WebGL: entrega una onda 2D." \
  src/three/SignalField.tsx src/three/SignalCanvas.tsx src/scenes/Signal.tsx src/scenes/signal.css

# -------------------------------------------------------------------------
# 07 — Ingeniería y la cadena de transmisión.
# -------------------------------------------------------------------------
commit 07 "07-engineering: diagrama polar calculado y recorrido de la cadena" \
"Los lóbulos del diagrama no están dibujados a ojo: salen del factor de arreglo
AF(θ) = |sin(Nψ/2)/(N·sin(ψ/2))| para N=5 y d=0,35 λ, con sus nulos y sus
lóbulos secundarios en su sitio.

El recorrido de la cadena se desplaza en horizontal mientras el scroll avanza en
vertical, sin secuestrar el control." \
  src/three/RadiationPattern.tsx src/three/radiation.css src/scenes/Engineering.tsx src/scenes/engineering.css src/scenes/Transmission.tsx src/scenes/transmission.css

# -------------------------------------------------------------------------
# 08 — Empresa, proyectos y catálogo con sus fichas.
# -------------------------------------------------------------------------
commit 08 "08-project-catalog: empresa, instalaciones y fichas de producto" \
"Los proyectos muestran la ausencia de fuente en lugar de rellenarla: donde no
hay enlace verificable, la ficha lo dice. El modelo no tiene campo de año
porque Sender no publica fechas, y la interfaz simplemente no lo muestra.

Las fichas de producto traen las especificaciones reales con tabular-nums, para
que las columnas se alineen de verdad." \
  src/scenes/SenderScene.tsx src/scenes/sender-scene.css src/scenes/Projects.tsx src/scenes/projects.css src/scenes/Products.tsx src/scenes/products.css

# -------------------------------------------------------------------------
# 09 — Proceso, contacto y SEO bilingüe.
# -------------------------------------------------------------------------
commit 09 "09-process-contact-seo: consola, contacto y datos estructurados" \
"La consola declara en pantalla que es una interfaz demostrativa y no telemetría
en vivo: es la diferencia exacta entre esto y un dashboard genérico.

El formulario no envía nada a ningún servidor; compone el mensaje en el cliente
de correo de quien escribe. Y el sitio no recoge datos de nadie.

SEO por idioma con hreflang recíproco, x-default sobre español y JSON-LD
independiente: Organization, ItemList con 16 Product, bandas e instalaciones." \
  src/scenes/Process.tsx src/scenes/process.css src/scenes/Contact.tsx src/scenes/contact.css src/seo/meta.ts public/sitemap.xml public/robots.txt scripts/gen-seo.mjs

# -------------------------------------------------------------------------
# 10 - Accesibilidad y rendimiento.
# ─────────────────────────────────────────────────────────────────########
commit 10 "10-a11y-perf-pages: foco, movimiento, medios y despliegue" \
"El movimiento reducido se neutraliza de forma global en lugar de archivo por
archivo, para no poder olvidar ninguno. La ficha de producto atrapa el foco y lo
devuelve al cerrar: sin eso, con Tab se sale a la página de detrás.

Las escenas con WebGL entran por import diferido: three.js no toca el primer
fotograma.

Y el sitio funciona igual en la raíz de un dominio que bajo un subdirectorio.
Sin esto, todos los enlaces internos apuntaban a la raíz del dominio y la
navegación se salía del sitio publicado." \
  src/lib src/styles/base.css src/vite-env.d.ts scripts/optimize-media.py scripts/postbuild.mjs scripts/serve-pages.mjs public/favicon.svg public/apple-touch-icon.png

# -------------------------------------------------------------------------
# 11 — Auditoría automática.
# -------------------------------------------------------------------------
commit 11 "11-audit: verificadores de paleta, copy, i18n, a11y, perf y SEO" \
"Dos verificadores ejecutables. audit.py comprueba las reglas duras del brief
sobre el código fuente; contraste.py mide WCAG 2.1 sobre los tokens reales, sin
duplicar valores.

Encontraron tres defectos reales que ya están corregidos y registrados: un
contraste por debajo del propio suelo del sistema, una pareja texto/superficie
que no pasaba AA, y la ausencia de cobertura de movimiento en varios archivos." \
  scripts/audit.py scripts/contraste.py scripts/shots.mjs

# -------------------------------------------------------------------------
# 12 — QA visual y crítica final.
# -------------------------------------------------------------------------
commit 12 "12-final-qa: QA visual, crítica por escena y entrega" \
"Capturas en escritorio y en el perfil real de un Galaxy S24, en los dos
idiomas, con comprobación de desborde, imágenes rotas y errores de consola.

El DESIGN-REVIEW registra lo que funciona y lo que no, escena por escena,
incluidos los defectos encontrados y corregidos durante el proceso." \
  docs/DESIGN-REVIEW.md README.md scripts/hitos.sh .

# -------------------------------------------------------------------------
# Comprobación: el árbol confirmado tiene que ser EXACTAMENTE el de trabajo
# -------------------------------------------------------------------------
#
# Esta comprobación existe porque la ausencia de `git add` sobre las rutas
# correctas ya provocó un despliegue fallido: el build de CI compiló el `src/`
# del sitio anterior junto con el nuevo. Un fallo silencioso aquí se convierte
# en un fallo ruidoso ahora, antes de empujar.
git add -A

if [[ -n "$(git status --porcelain)" ]]; then
  echo >&2
  echo "  ✗ quedaron cambios fuera del historial:" >&2
  git status --porcelain | head -20 >&2
  echo "  El despliegue compilaría un árbol incompleto. No se empuja." >&2
  exit 1
fi

faltan=()
for f in package.json package-lock.json index.html vite.config.ts tsconfig.json \
         src/App.tsx src/main.tsx src/lib/base.ts src/scenes/Entry.tsx \
         public/media/hero-poster-960.webp public/media/sender-hero.mp4; do
  git cat-file -e "HEAD:$f" 2>/dev/null || faltan+=("$f")
done

if [[ ${#faltan[@]} -gt 0 ]]; then
  echo >&2
  echo "  ✗ faltan archivos imprescindibles en el commit: ${faltan[*]}" >&2
  exit 1
fi

echo "  ✓ el árbol confirmado coincide con el de trabajo"

echo
echo "  12 commits creados en la rama $(git rev-parse --abbrev-ref HEAD)."
echo "  La rama de producción (main) no se ha tocado."
echo
echo "  Revisa y, si procede:"
echo "    git log --oneline -12"
echo "    git push -u origin immersive-redesign"
echo
