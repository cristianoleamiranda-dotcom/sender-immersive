# AGENTS.md — Contrato operativo del proyecto

LEER ESTO PRIMERO. Cualquier sesión (humana o agente) que toque este repo trabaja bajo estas reglas.
Este archivo es la referencia permanente del proyecto: no requiere contexto de chats anteriores.

## Qué es este repo

El sitio publicado de SENDER Chile: **ENGINEERING THE SIGNAL**.
URL: https://cristianoleamiranda-dotcom.github.io/sender-immersive/
Deploy automático: cada push a `main` dispara `.github/workflows/pages.yml` (~1 min).

No lo rediseñes sin criterio. La experiencia ya está resuelta; los cambios son quirúrgicos.

## DNA de la marca (innegociable)

- **Paleta exacta:** `#FFFFFF`, `#1E73BE`, `#494949`, `#0085B2`. Prohibido: púrpura, violeta, rosa,
  naranja, amarillo, dorado, verde, neón, degradados de color.
- **Tipografía:** Instrument Sans (interfaz), IBM Plex Mono (solo metadatos).
- **Tono:** editorial-técnico. Dibujo técnico, cine, 3D abstracto. El scroll mueve una cámara.
- **Anti-patrones:** SaaS, startup de IA, plantilla, telecom genérica, cyberpunk, juego.
  Hairlines en vez de cajas. Pin con propósito. Nada rebota.
- **Una sola paleta, un solo SignalField, un contexto WebGL** (escritorio con puntero fino y sin
  `prefers-reduced-motion`; móvil y reduced motion usan canvas 2D). WebGL y Lenis fallan en silencio.

## Regla de oro: no inventar

Fuente de verdad: [cristianoleamiranda-dotcom/sender](https://github.com/cristianoleamiranda-dotcom/sender)
y [sender.cl](https://www.sender.cl/). Inventario completo y justificación de cada ausencia:
`docs/CONTENT-INVENTORY.md`. Detalle histórico de skills y referencias: `docs/SKILLS.md`.

- Contacto (único válido): +56 9 8386 4148 · sender@sender.cl · bis.ltda@gmail.com ·
  Blanco Viel 1108, 2º piso, San Miguel, Santiago · WhatsApp 56983864148. Sin redes sociales.
- Prohibido inventar: año de fundación, conteo de proyectos, premios, precios, datasheets,
  clientes, certificaciones, telemetría "en vivo".
- AM-2500SS: 2000 W, como está publicado.
- Sin stock ni imágenes generadas de equipos, instalaciones o personas. La IA solo anima fotos reales.

## Arquitectura y rutas

- `src/sections/` Hero → Signal → About → Engineering → Products → Projects → Contact (una narrativa continua)
- `src/three/scenes/` SignalScene (WebGL), `src/components/motion/` Lenis + canvas 2D
- `src/i18n/{es,en}` — ES en `/`, EN en `/en`. No mezclar idiomas.
- Rutas: `/`, `/en`, `/productos`, `/en/productos`, `/productos/:slug`, `/producto/:slug` + espejos EN.
  `/soluciones` → redirect (ruta SPA + `404.html` estático).
- El build genera 49 shells estáticas en `dist/` vía `scripts/seo.mjs` (ES + EN). GitHub Pages es
  hosting estático: **toda ruta nueva necesita su shell** — agrégala a `seo.mjs`.

## Comandos reales

```bash
npm ci
npm run dev        # 0.0.0.0:5173
npm run build      # tsc --noEmit && vite build && node scripts/seo.mjs
node qa/check.mjs  # QA real (npm run qa es el alias)
```

QA obligatorio antes de push: `npx tsc --noEmit` + `node qa/check.mjs` + `npm run build` sin errores.
Para probar el build local como Pages: `VITE_BASE_PATH=/sender-immersive/ npm run build`.

## Cómo publicar (sesiones de agente sin conexión permanente al repo)

1. Clonar este repo, trabajar en rama o directo según el alcance.
2. Commit claro + push con un PAT fine-grained de duración corta (Contents: Read/Write, solo este repo).
3. Revocar el PAT al terminar. Pages despliega solo.
4. Verificar en vivo: home + una ruta profunda ES y una EN.

## Referencias de movimiento (los 4 videos de YouTube)

**Qué son** (verificado vía oEmbed de YouTube, 2026-09-29): demos de sitios y escenas 3D
construidas con IA — «Claude Opus 5.5 Might Be The Best!!! (3D, Web Design, Animation)»
(Codex Community), «I Built This Interactive 3D Website With AI (Gemini 3.8 Flash)»
(MiladiCode), «Claude Opus 5.5 is Insane (3D Game + Website)» (Kyle Skelly), «Claude
Design 3.0 (3D Scrolling Animations)» (Louis Borrego).

**Su rol en el encargo es doble:**
1. **Prohibido copiarlos** — el prompt inicial los lista junto a sender-onair y open-design.
2. **Fuente de principios** — la sesión de construcción los estudió como principios, no
   como copia (`docs/SKILLS.md`): la cámara avanza con el scroll, la imagen no se
   deforma, y cada transición tiene un trabajo distinto — **apertura de señal, cambio
   de estado, archivo a escena, convergencia** (una por video, en el orden del encargo).

Dónde quedaron esos principios en el sitio:

| Principio (según `docs/SKILLS.md`) | Implementación |
|---|---|
| Apertura de señal (video 1) | Entrada del Hero: la señal se abre con el progreso del scroll |
| Cambio de estado (video 2) | Signal → About → Engineering: la señal cambia de trabajo por escena |
| Archivo a escena (video 3) | Projects: el archivo fotográfico real entra a la escena |
| Convergencia (video 4) | Cierre hacia Contact: la narrativa converge en conexión/contacto |

**Cumplimiento verificado:** cero assets, código o estética de esos videos en este repo.
El único video del sitio es `sender-hero.mp4`, real y preexistente de SENDER.

## Pendientes conocidos

- ~~SignalField puede perder el primer push de progreso~~ → **resuelto** (se aplican los últimos valores al montar).
- ~~aria-labelledby de Ingeniería apuntaba al título de escritorio~~ → **resuelto** (`aria-label` con el título).
- ~~El catálogo de inicio repite 01 por categoría~~ → **resuelto** (numeración secuencial en la home).
- ~~Contraste AA en contextos oscuros~~ → **resuelto** (`83e3d4f`; re-auditoría: 0 muestras bajo mínimo).
- El error "Tira error" nunca se reprodujo en un navegador real (Chromium headless incluido); mantener WebGL/Lenis a prueba de fallos.

## Autoridad de diseño y loops

- **`docs/SENDER-DESIGN-DNA.md`** — la autoridad de diseño: color, tipografía, grid, ratios, layouts nombrados, imagen, motion, 3D, transiciones, copy, SEO, anti-slop. Toda pieza se justifica desde ahí.
- **`docs/DESIGN-REVIEW.md`** — registro vivo del Design Loop por escena: qué funciona, qué no, qué debe cambiar.
- Auditoría renderizada completa (Chromium, tres contextos, WCAG AA con el evaluador de `sender/qa`, hechos cruzados contra el repo fuente): ver **`docs/AUDITORIA-INMERSIVA.md`**.

## Historial de publicación

- `673a5d8` — sitio íntegro desde `scroll-craft@arena/01a0e48e-scroll-craft` (LICENSE Unlicense, README documentado).
- `cad1327` — shells EN + `404.html` con base del repo (requisito de hosting estático).
