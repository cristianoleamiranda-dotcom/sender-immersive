# SENDER-IMMERSIVE — DESIGN REVIEW

**Registro vivo del Design Loop (§36 del brief maestro).** Una entrada por escena mayor:
qué se construyó, qué funciona, qué no, qué debe cambiar, violaciones al DNA
(`SENDER-DESIGN-DNA.md`), rendimiento y móvil. No se aprueba una escena porque compile.

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
