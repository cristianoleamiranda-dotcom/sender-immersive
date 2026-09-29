# SENDER-IMMERSIVE — DESIGN REVIEW

**Registro vivo del Design Loop (§36 del brief maestro).** Una entrada por escena mayor:
qué se construyó, qué funciona, qué no, qué debe cambiar, violaciones al DNA
(`SENDER-DESIGN-DNA.md`), rendimiento y móvil. No se aprueba una escena porque compile.

---

## LOOP 06 — FILM ROBUSTO EN TÁCTIL (hallazgo de la persona: "no se ve video, solo animación")

**Causa.** En táctil, Chrome Android degrada `preload="auto"` en datos móviles y bloquea
el autoplay: el video nunca emitía `canplay`, así que el control condicional a ese evento
no aparecía jamás y el film quedaba en opacidad 0 — "solo animación".

**Qué se construyó.** Control del film **siempre visible en táctil** (`pointer: coarse`) y
bajo reduced-motion; en escritorio normal sigue sin botón (autoplay). Red de seguridad
temporal (1.6 s): si el film sigue pausado, aparece el control y se hace visible el
elemento aunque no haya cargado. `preload` según contexto (`none` bajo reduced-motion —
carga bajo demanda al pulsar). El tap reproduce con fade-in; etiqueta conmutada
Reproducir/Pausar.

**Verificado en loop.** Táctil normal: autoplay + control visible («Pausar film») ·
táctil reduced: pausa + «Reproducir film» → tap → reproduce (t avanza, opacidad 0.8) ·
escritorio: autoplay sin control · QA verde. Captura `auditoria/film-movil-reduced-play.png`.
Nota de despliegue: el fix de texto-size-adjust del loop 05 ya estaba en el CSS servido;
la captura de la persona (10:48) era caché de Pages (max-age 600 s) — forzar recarga.

---

## LOOP 05 — MÓVIL REAL (hallazgos de la persona: capturas S24 10:20/10:32)

**Tres hallazgos de las capturas.**
1. *Texto aplastado una palabra por línea en la cadena (A Onda, B Frecuencia…)*:
   faltaba `text-size-adjust: 100%` — el font boosting de Chrome Android infla el
   texto dentro de las columnas. Añadido. Verificado: párrafo de la cadena a 286 px
   en viewport 390.
2. *Texto visible a través del nav claro*: `is-light` tenía fondo alfa 0.92. Ahora
   sólido (`--paper`).
3. *«Ni videos ni animación»*: el S24 con «Quitar animaciones» (Android) reporta
   `prefers-reduced-motion: reduce` y el sitio —cumpliendo §40— lo apagaba todo,
   film incluido. Punto medio §28/§40: el film **siempre** está montado; con
   reduced-motion o autoplay bloqueado aparece un control mono «Reproducir film»
   (reproducción por decisión de la persona; el botón conmuta a «Pausar film»).
   Verificado en loop: reduced → botón → reproduce (t avanza, etiqueta conmuta);
   móvil normal → autoplay sin botón; cine de escenas sigue estático bajo
   reduced-motion (correcto por accesibilidad).

**Nota para la persona.** Si en el S24 quieres ver además las animaciones lentas de
cámara en todas las escenas, desactiva Ajustes → Accesibilidad → Mejoras de
visibilidad → «Quitar animaciones»: es una decisión del sistema operativo que el
sitio respeta.

---

## LOOP 04 — NAV/ÍNDICE EN PRODUCCIÓN (hallazgo de la persona: "no se despliega" + 404)

**Hallazgo.** En Pages, los anchors crudos del nav usaban `path()` (ruta Router sin base):
`href="/#nosotros"` en vez de `/sender-immersive/#nosotros` → cada entrada del índice
caía al raíz del dominio → 404. En dev (base `/`) era invisible.

**Qué se construyó.** `fullPath()` en el contexto i18n (base del deploy + idioma) para los
anchors crudos del nav/marca/índice — los `<Link>/<NavLink>` de React Router siguen con
`path()` (el Router ya trae `basename`). `HashScroll` en App: al montar con hash, lleva la
vista a la sección (90 ms post-render, `scroll-margin-top` existente evita el nav tape).

**Verificación dura.** Bajo `/sender-immersive/`: diálogo INDICE `open:true` y visible;
enlace 02 Nosotros → URL correcta + sección a 73 px (bajo nav fijo, sin 404); nav
escritorio 04 Productos → ídem; marca SENDER desde una ficha → home. 0 requests fallidos.
Captura `auditoria/nav-movil-abierto.png`. **Aprobado.**

---

## LOOP 03 — CINE EN TODAS LAS ESCENAS (pipeline §13, pedido de la persona)

**Hallazgo.** El film vivía solo en el Hero; Ingeniería, Proyectos y Productos eran
fotos estáticas. El brief §13 define el pipeline (imagen real → profundidad → cámara →
luz → cine) y §11 autoriza animar las fotos reales sin alterar su identidad.

**Qué se construyó.** `CinematicImage` implementado de verdad (era passthrough vacío del
§30): wrapper `.cine` con cámara lenta —pan 34 s / zoom 26 s—, capa de profundidad
opcional (`.cine-back`, la capa lejana derivada de la misma foto real), barrido de luz
único al entrar en escena, y `IntersectionObserver` que **apaga la cámara fuera de
pantalla**. `DepthImage` (Nosotros) también respira. Slot `video` preparado: cuando
existan micro-videos reales derivados (§13 con tooling de video), se montan sin tocar
nada más. Ingeniería en pan (ambos viewports), Productos en zoom, Proyectos con
profundidad + portada en zoom.

**Verificación dura (loop renderizado).** Escritorio: la matriz de transformación cambia
con el tiempo en las tres zonas (cámara viva) · off-screen apaga la cámara (true→false
con salto instantáneo; la primera medición fue un artefacto del scroll suave de Lenis) ·
reduced-motion: estático (kill global existente) · móvil: cámara activa · 0 errores.
Capturas `auditoria/cine-*.png`. **Aprobado.**

**DNA.** Sin violaciones: fotos reales sin alteración factual (solo crop/zoom/capa, §11),
sin gradientes de color (la luz es blanco al 7 % en alfa), paleta intacta, movimiento
lento y con propósito.

---

## LOOP 02 — VIDEO COMO ENTORNO (corrección de la persona, captura S24)

**Hallazgo.** En el S24 real nunca había video: el código solo lo montaba en escritorio y
tras el 42 % del scroll — exactamente lo que la captura de la persona evidenció. Violaba
§28 (móvil: video/fallback, «no simplemente desactivar todo») y el efecto de las
referencias (el entorno cinematográfico visible de entrada).

**Qué se construyó.** El film real `sender-hero.mp4` pasa a ser el fondo del entorno de
transmisión en **todos** los viewports desde la carga (autoPlay muted loop playsInline,
`preload="auto"`, fade-in en `canplay`), detrás de la fotografía real; la foto se abre con
el scroll como la evidencia dentro del entorno. Reduced-motion: solo fotografía, sin
reproducción. Ahorro de datos / autoplay bloqueado: degrada al poster real (misma
composición).

**Verificación dura (loop renderizado).** Escritorio y móvil: readyState 4, opacidad 0.8,
`currentTime` avanzando (3.19→4.7 / 3.24→4.27), sin pausa, loop 12 s, 0 errores. Capturas
en `auditoria/video-*.png`. **Aprobado en ambos contextos.**

**DNA.** Sin violaciones: video real preexistente (§11/§13/§14 — sin IA generando
contenido), velos en alfa de gris, paleta intacta.

---

## LOOP 01 — HERO (secuencia de entrada §17)

**Qué se construyó.** Secuencia canónica de entrada: la señal entra (trazo SVG que se
dibuja, blanco sobre campo) → se propaga (la traza abre la fotografía real en rendija) →
forma el campo (SignalField/canvas emerge) → **SENDER** sube en display → «Ingeniería de
la señal» + disciplinas + metadatos en escalonamiento. `data-intro="play|done"`: el
estado natural es la secuencia ya ocurrida (cero costo en cargas siguientes); el primer
scroll la salta; `prefers-reduced-motion` jamás la ve (initializer perezoso).

**Qué funciona.** Verificado con Design Loop renderizado (Chromium, 3 frames escritorio
+ 2 móvil): la metáfora «entrar al entorno de transmisión» ocurre; el estado final es
píxel-idéntico al reposo (p=0 legítimo: la rendija se abre con el scroll); 0 errores de
consola; móvil usa su capa 2D sin WebGL.

**Qué no funciona / debe cambiar.** El trazo podría conectarse con el `eng-diagram` de
Ingeniería (misma familia de trazo) — pendiente de segundo loop. Duración total 2.9 s:
aceptable, no tocar hasta tener datos de rebote reales.

**Violaciones DNA.** Ninguna: solo blanco/gris de marca + nodo `--signal`; sin
gradientes de color; fotografía real sin alteración factual.

**Rendimiento.** Solo CSS (keyframes), sin JS de animación nuevo; el SVG es ~500 bytes
inline. Reduced-motion y scroll-skip verificados.

**Móvil.** Loop propio ejecutado: secuencia activa en capa 2D, composición intacta.

---

## LOOP 00 — ESTADO POR ESCENA (línea base, auditoría renderizada 2026-09-29)

| Escena | Qué funciona | Qué debe cambiar |
|---|---|---|
| ENTRY/HERO | pin, foto→video real, campo señal, claim §17 ahora con secuencia | ver LOOP 01 |
| SIGNAL | canvas 2D móvil + WebGL escritorio, degradación silenciosa | primer push de progreso: resuelto (`7cb5f50`) |
| NOSOTROS | layout B editorial, `.depth` con marco técnico, hechos "20+ años" documentados | figcap: contraste corregido (`83e3d4f`) |
| INGENIERÍA | pin 520vh, estados navegables, dibujo técnico por estado, nota «no se simulan cifras» | aria: resuelta (`7cb5f50`); trazo del diagrama podría heredar la familia del intro |
| TRANSMISIÓN | cadena TX→ANT en escena continua | — |
| PROYECTOS | archivo editorial, fotos reales, metadatos mono | contraste kickers: corregido (`83e3d4f`) |
| PRODUCTOS | objetos técnicos, specs del catálogo auditado (23/23 slugs vs fuente) | numeración home: resuelta (`7cb5f50`) |
| CONTACTO | formulario compone mailto (no guarda datos), contacto exacto, WhatsApp | rótulos azul→blanco sobre oscuro: corregido (`83e3d4f`); re-auditoría WCAG: 0 bajo mínimo |

## Deuda registrada (no bloquea aprobación del Hero)

1. **§13 Pipeline imagen→video**: micro-videos cinemáticos derivados de fotos reales —
   pendiente; Higgsfield/CLI de video no disponible en el tooling de este entorno (§14
   es condicional: «if available»). El video del hero es el MP4 real preexistente.
2. **§21 SCENE 07 PROCESS**: no construida — el inventario de contenido real
   (`CONTENT-INVENTORY.md`) no tiene material "proceso" sin inventar; el brief ordena
   que las escenas reflejen el contenido real.
3. Componentes extraíbles pendientes (DNA §14): `SectionMarker`, `TechnicalLabel`,
   `SignalTransition`, `ParallaxImage`, `CinematicVideo`.
4. Métricas Lighthouse formales (presupuesto actual: Three en chunk aparte, import
   dinámico, AVIF/WebP ya en `gen/`).
5. Verificación final en S24 (flujo maestro) — última milla de la persona.
