# SENDER Immersive Redesign

> **Experiencia digital premium para SENDER Chile (BIS SpA)** — Ingeniería RF, radiodifusión, telecomunicaciones. +20 años. San Miguel, Santiago.

[![CI](https://github.com/cristianoleamiranda-dotcom/sender-immersive/actions/workflows/ci.yml/badge.svg)](https://github.com/cristianoleamiranda-dotcom/sender-immersive/actions/workflows/ci.yml)
[![Deploy](https://github.com/cristianoleamiranda-dotcom/sender-immersive/actions/workflows/pages.yml/badge.svg)](https://github.com/cristianoleamiranda-dotcom/sender-immersive/actions/workflows/pages.yml)
[![WCAG AA](https://img.shields.io/badge/WCAG-AA-1E73BE)](https://github.com/cristianoleamiranda-dotcom/sender-immersive/actions)
[![Palette Audit](https://img.shields.io/badge/palette-0_violations-1E73BE)](https://github.com/cristianoleamiranda-dotcom/sender-immersive/actions)

---

## 🎯 Objetivo

Crear una experiencia **inmersiva, técnica y editorial** que comunique:

**SIGNAL · ENGINEERING · TRANSMISSION · BROADCASTING · CONNECTION · SENDER**

No una web corporativa genérica. Una interfaz de producto real.

URL publicada: https://cristianoleamiranda-dotcom.github.io/sender-immersive/

---

## 🏗️ Arquitectura

| Capa | Tecnología |
|------|------------|
| **Framework** | React 18 + Vite 5 + TypeScript (Static Export + 49 SEO Shells) |
| **3D** | React Three Fiber + Drei + Three.js (GLSL SignalField + RadiationPattern) |
| **Scroll** | Lenis + GSAP + Scroll-driven Camera Transport |
| **Styling** | CSS Tokens (Liquid Palette — 0 violaciones) |
| **i18n** | Routing ES `/` \| EN `/en` + `middleware.ts` + 49 shells estáticas |
| **Forms** | Composición en cliente (`mailto:` / WhatsApp) + Netlify / Formspree ready |
| **Deploy** | GitHub Pages (`.github/workflows/pages.yml`) / Netlify / Vercel / Cloudflare |

---

## 🎨 Design System — Liquid Palette

| Swatch | Hex | Role |
|--------|-----|------|
| 🤍 | `#FFFFFF` | Texto principal, altas luces |
| 🔵 | `#1E73BE` | **Marca** — Acción, estructura, foco |
| ⚫ | `#494949` | Texto secundario, estructura neutra |
| 🩵 | `#0085B2` | **Señal** — Datos, mediciones, estado vivo |

**Derivadas por luminancia únicamente** — 0 matices nuevos. Auditoría automática: `npm run audit:palette`

---

## 📦 Stack 3D y Escenas (00 → 08)

```text
00 ENTRY         Transporte de video real (sender-hero.mp4) gobernado por scroll
01 SIGNAL        SignalField 3D en GLSL — propagación con decaimiento físico
02 SENDER        Trayectoria (+20 años), dominios técnicos y trazabilidad documental
03 ENGINEERING   RadiationPattern 3D — lóbulos calculados con factor de arreglo + 6 bandas
04 TRANSMISSION  Cadena de transmisión de 6 etapas en recorrido horizontal
05 PROJECTS      6 instalaciones reales documentadas (Radio Colosal, Valparaíso, Rapa Nui, NAVTEX, HF, STL)
06 PRODUCTS      16 equipos reales en 7 estaciones con fichas técnicas completas
07 PROCESS       Consola de automatización (declarada como demostrativa)
08 CONTACT       Canales directos verificados (+56 9 8386 4148, sender@sender.cl, bis.ltda@gmail.com)
```

---

## 📱 Mobile & Accessibility

| Feature | Implementation |
|---------|----------------|
| **Reduced Motion** | `prefers-reduced-motion` neutralizado globalmente; WebGL y Lenis degradan en silencio |
| **Mobile 360px** | 0 desborde horizontal (`npm run mobile-check`), pósters optimizados AVIF/WebP/JPG |
| **WCAG AA** | 25/25 combinaciones verificadas (`python3 scripts/contraste.py`) |
| **SEO & Schema** | 50 URLs en `sitemap.xml`, 49 shells estáticas (`scripts/seo.mjs`), JSON-LD validado (`npm run schema-check`) |

---

## 🚀 Comandos

```bash
# Desarrollo
npm ci
npm run dev                    # 0.0.0.0:5173 (ES en / | EN en /en)

# Calidad
npm run lint                   # TypeScript + QA check
npm run typecheck              # tsc --noEmit
npm run audit:palette          # 0 violaciones paleta Liquid (scripts/audit_palette.py)
npm test                       # Suite completa (qa + palette + audit + contraste)

# Build & QA
npm run build                  # tsc --noEmit && vite build && node scripts/seo.mjs (49 shells)
npm run build:pages            # Build con VITE_BASE_PATH=/sender-immersive/
npm run qa                     # Orquestador QA completo
npm run mobile-check           # Verificación 360×780 sin overflow horizontal
npm run schema-check           # Validación de JSON-LD estructurado
```

---

## 📁 Archivos de Configuración de Producción

| Archivo | Propósito |
|---------|-----------|
| `AGENTS.md` | Contrato operativo permanente del repositorio |
| `public/_headers` | Security + Cache headers (Netlify/Vercel/Cloudflare) |
| `middleware.ts` | i18n routing (`ES /` \| `EN /en`) sin dependencias externas |
| `next-sitemap.config.js` | Configuración de sitemap y políticas `robots.txt` |
| `netlify.toml` | Configuración de despliegue en Netlify (Headers + Redirects) |
| `vercel.json` | Configuración alternativa de despliegue en Vercel |
| `.github/workflows/ci.yml` | Pipeline CI/CD (lint, typecheck, palette, tests, build, lighthouse, a11y) |
| `.github/workflows/pages.yml` | Despliegue automático a GitHub Pages en cada push a `main` |
| `scripts/mobile-check.js` | Verificación Playwright en móvil 360×780 (0 overflows) |
| `scripts/schema-check.js` | Validación Playwright de datos estructurados JSON-LD |
| `scripts/audit_palette.py` | Auditor estricto de paleta Liquid (0 violaciones) |
| `scripts/seo.mjs` | Generador de 50 URLs en `sitemap.xml` y 49 shells estáticas |
| `.env.example` | Variables de entorno documentadas |
| `public/_redirects` | Reglas de redirección SPA + i18n + legado |
| `public/sw.js` | Service Worker (network-first HTML, cache-first assets) |
| `public/manifest.json` | Manifiesto Web App (PWA) |

---

## 🔬 Metodología: Design DNA Method

```text
REFERENCE RESEARCH → DESIGN ANALYSIS → DESIGN DNA → PROTOTYPE
→ DESIGN LOOP → CRITIQUE → REFINE → DESIGN SYSTEM
→ IMPLEMENTATION → VISUAL QA → REPEAT
```

- **`docs/SENDER-DESIGN-DNA.md`** — Autoridad de diseño: color, tipografía, grid, ratios, layouts nombrados, imagen, motion, 3D, transiciones, copy, SEO, anti-slop.
- **`docs/DESIGN-REVIEW.md`** — Registro vivo del Design Loop por escena.
- **`docs/CONTENT-INVENTORY.md`** — Inventario completo y trazabilidad factual contra `sender.cl`.

---

## 📞 Contacto (único válido)

```text
SENDER / BIS SpA
Blanco Viel 1108, 2º piso, San Miguel, Santiago, Chile
+56 9 8386 4148 · WhatsApp 56983864148
sender@sender.cl · bis.ltda@gmail.com
https://www.sender.cl
```

**Sin redes sociales.**
