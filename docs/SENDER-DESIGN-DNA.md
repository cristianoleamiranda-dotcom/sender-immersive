# SENDER — DESIGN DNA

**Este archivo es la autoridad de diseño del proyecto (§35 del brief maestro).**
Toda pieza visual debe poder justificarse desde aquí. Cambiar el DNA requiere commit
propio y una entrada en `docs/DESIGN-REVIEW.md`. Derivado del sistema real implementado
(valores tomados de `src/styles/tokens.css` y `app.css`, no aspiracionales) y de la
metodología Design DNA + Design Loop (§02, §15, §34).

---

## 1. COLOR

Tokens únicos (los cuatro de marca, nada más):

| Token | Valor | Uso |
|---|---|---|
| `--sender-white` | `#FFFFFF` | papel, texto sobre oscuro |
| `--sender-blue` | `#1E73BE` | señal: kickers, estados activos, nodos |
| `--sender-gray` | `#494949` | tinta, fondos oscuros (`--field`) |
| `--sender-cyan` | `#0085B2` | acento técnico secundario |

Derivados permitidos: **solo alfas de estos cuatro** (`--rule`, `--rule-strong`,
`--rule-light`, `--signal-soft`, `--cyan-soft`, velos/scrim en alfa de gris).
Prohibido: púrpura, violeta, rosa, naranja, amarillo, dorado, verde, neón y
**degradados de color** (el único gradiente permitido es el scrim de legibilidad
`.hero-veil`, en alfa de gris).

La sofisticación viene de contraste + escala + profundidad + fotografía + motion +
tipografía + composición. Nunca de color nuevo.

## 2. TYPOGRAPHY

- **Instrument Sans** — interfaz y display. Display usa la escala fluida:
  `--step-0 0.75rem · --step-1 0.9375rem · --step-2 1.0625rem · --step-3 clamp(1.35rem,2vw,1.75rem)
  · --step-4 clamp(2rem,4vw,3.25rem) · --step-5 clamp(3.2rem,7vw,6.4rem) · --step-6 clamp(4.6rem,13vw,11.5rem)`
- **IBM Plex Mono** — **solo metadatos**: kickers numerados, rangos, coordenadas,
  botones, fichas técnicas (`0.66–0.72rem`, tracking `0.08–0.16em`, uppercase).
- Titulares de sección acotados (`max-width: 12ch` en Ingeniería). Interlineado apretado
  en display (`line-height ~0.8–1.05`), holgado en cuerpo.

## 3. GRID & ESPACIO

- Gutér: `--gutter clamp(1.15rem, 3.6vw, 3.5rem)`. Grilla fluida de 12 columnas
  implícita (asimetría editorial, no columnas visibles). Sin `max-width` rígido: el
  margen crece con el viewport.
- Escala de espacio: `--space-2 0.5 · -3 0.75 · -4 1 · -5 1.5 · -6 2.5 · -7 4.5 · -8 7.5rem`.
- Ritmo de sección: padding vertical `--space-8`/`--space-7`. Hero: `150vh`
  (escritorio fino: `210vh`) con pin interno `100dvh`.

## 4. RATIOS (regla, no azar)

- Display : apoyo ≈ `--step-5/6` contra `--step-1/2`.
- Imagen editorial : texto ≈ 55 : 45 en layouts B/D.
- Metadato técnico : contenido principal ≈ 0.68–0.72rem contra escala display.
- Figura de profundidad (`.depth`): `min-height 68vw`, marco técnico con `ticks`.
- Blanco sobre contenido: cada escena respira al menos un `--space-7` entre bloques.

## 5. LAYOUTS NOMBRADOS (reutilizar, no recomponer)

| Layout | Nombre | Implementación |
|---|---|---|
| A | Cine full-screen con pin | `.hero-pin` (foto + campo de señal + copy) |
| B | Editorial asimétrico | `.about-grid` |
| C | Tipografía grande + metadato | `.eng-index` (columna de estados) |
| D | Imagen + anotación técnica | `.depth` + `ticks` + `figcap` |
| E | Escena 3D full-screen | `.hero-gl` / SignalScene (solo escritorio) |
| F | Archivo de proyectos | `.archive` / `.project-spread` |
| G | Diagrama técnico | `.eng-diagram` (canvas de dibujo por estado) |
| H | Escena de contacto | `.contact` (campo 2D + formulario hairline) |

## 6. IMAGE DNA

Política: **solo fotografía real de SENDER** (§11). Prohibido stock o IA generando
equipos/personas. Tratamientos permitidos: crop, mask, zoom, capas de profundidad
(`.depth-back/.depth-front`), parallax, clip-path, overlays técnicos (`ticks`,
`eng-diagram`), micro-video derivado (§13 — pendiente, ver REVIEW).

Roles fijos: 01 Hero (`hero-photo/video`) · 02 Ingeniería (`eng-visual`) ·
03 Producto (`object-visual`) · 04 Proyecto (`project-visual`) · 05 Atmósfera
(`about` depth) · 06 Transición (imaginería de Signal). **Nunca llenar huecos con
imágenes sin rol.**

## 7. MOTION DNA

- Carácter: lento, preciso, intencional, cinematográfico. **Nada rebota.**
- Easings únicos: `--ease cubic-bezier(0.65,0,0.35,1)` (simétrico) y
  `--ease-out cubic-bezier(0.16,1,0.3,1)` (salida).
- Duración tokens: `micro 160ms · short 300ms · medium 550ms · long 1200ms · cinematic 1800–2600ms`.
- El scroll es la cámara: Lenis (import dinámico) + GSAP ScrollTrigger + pin con
  propósito. `prefers-reduced-motion`: sin animación, contenido íntegro.

## 8. 3D DNA (§18–19)

Un solo contexto WebGL (`SignalScene`), import dinámico, dispose al desmontar.
Solo escritorio con `pointer: fine` y sin reduced-motion; móvil y reduced-motion:
`SignalCanvas` 2D. Léxico 3D permitido: **waveforms, campos de señal, líneas
técnicas, grillas espaciales, planos de imagen, rutas de transmisión, propagación RF
abstracta**. Prohibido: esferas genéricas, neón, geometría flotante al azar,
partículas decorativas, físicas sin sentido.

## 9. TRANSITIONS

Cada transición tiene un trabajo distinto (apertura de señal → cambio de estado →
archivo a escena → convergencia). La entrada del hero ejecuta la secuencia canónica
§17: **la señal entra → se propaga → forma el campo → SENDER aparece →
ENGINEERING THE SIGNAL** (implementada en `Hero` con `data-intro`, waveform SVG que
se dibuja, campo que emerge, wordmark y líneas en escalonamiento; se salta con el
primer scroll y no existe para reduced-motion).

## 10. UI DNA

- Nav mínima: SENDER + numerados 01–06 + ES/EN; parte de la experiencia (pinned).
- Botones mono uppercase: sólido `--signal` (texto blanco) o hairline (ghost).
- Formularios: inputs hairline underline sobre `--field`, labels mono.
- Focus visible; contraste AA verificado (rótulos azules nunca sobre fondo oscuro —
  en contexto oscuro los rótulos pasan a blanco).

## 11. EDITORIAL + GRÁFICA TÉCNICA

Kickers numerados mono, tipografía display, reglas finas (hairlines) en vez de cajas,
capturas pequeñas, espacio negativo, secuencias de imagen, coordenadas y etiquetas
técnicas como adorno **con significado**. La gráfica técnica (waveforms, rutas,
curvas tipo frecuencia, nodos) es lenguaje visual: **jamás especificaciones
inventadas como datos** («aquí no se simulan cifras»).

## 12. LANGUAGE + COPY DNA

ES en `/`, EN en `/en`, sin mezclas (nav, SEO, alt, botones, fichas).
Copy: concisa, técnica, segura, editorial, humana, factual. Prohibido: «innovative
solutions», «cutting-edge», «revolutionary», «next-generation», «world-class» sin
respaldo documentado. Referencias de voz real: «No solo vendemos equipos. Diseñamos
soluciones.» · «Aquí no se simulan cifras.»

## 13. SEO DNA

Metadatos independientes por ruta e idioma (title/description/OG/canonical/hreflang),
sitemap 50 URLs, shells estáticas ES+EN por ruta (hosting estático), datos
estructurados cuando corresponda. Política: canonical/hreflang/robots apuntan a
`www.sender.cl` — el Pages no compite en buscadores.

## 14. COMPONENTES (§30)

Existen: `SignalField`, `SignalCanvas`, `EditorialImage`, `DepthImage`, `Nav`,
`SmoothScroll`, `Seo`, escenas `Signal/Engineering/Project`, secuencia de entrada
del Hero. Deuda de componentes: `SectionMarker`, `TechnicalLabel`,
`SignalTransition`, `ParallaxImage`, `CinematicVideo`, `ContactScene` explícito —
extraer solo cuando haya segunda escena que los reutilice.

## 15. ANTI-SLOP (§07 — reglas de rechazo)

Se rechaza de plano: hero genérico, fondo con gradiente de color, tarjetas flotantes,
esfera 3D genérica, orbe brillante, «AI interface», dashboard, stock tecnológico,
partículas al azar, paneles de vidrio, cards redondeadas en exceso, sombras
decorativas, plantilla SaaS, cyberpunk, look de juego. **Todo efecto debe tener
relación con SIGNAL / ENGINEERING / TRANSMISSION / BROADCASTING / CONNECTIVITY.**

## 16. REFERENCIAS (método, no estética)

`ICKAMsw4ENs` (Astra 6 / metodología Design DNA–Loop descrita en el brief) y
`Da7ZuhyWACg`, `y1pM7bS6IY8`, `3yQttz-UKjA`, `3eExfC63uSc`: principios de cámara,
ritmo, profundidad y transición. Investigación de Awwwards (§33): extraer principios,
jamás branding/layout/assets/identidad. Prohibido copiar `sender-onair`, la web
vigente u `open-design` (motor de decisión, no de aspecto).
