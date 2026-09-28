# SENDER â€” Engineering the Signal

Complete rebuild of the Sender website as a **scroll-driven video landing**: the
hero film is the engine of the page, not a background loop. The gesture moves a
transport through the film, the interface planes move with it, and when the film
closes the browser gets native scrolling back.

```
LOAD â†’ FIRST FRAME â†’ SCROLL â†’ FILM ADVANCES â†’ INTERFACE TRAVELS
     â†’ FINAL FRAME â†’ RELEASE â†’ NATIVE SCROLL â†’ SENDER SECTIONS
     â†’ BACK TO TOP â†’ REARM â†’ FIRST FRAME
```

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173  (includes the dev transport read-out)
npm run build    # tsc -b && vite build â†’ dist/
npm run preview  # production build on http://localhost:4173
```

---

## The transport

`src/hooks/useVideoScrub.ts` is the whole interaction, and it obeys one rule:

> the cinematic progress lives in `transportProgressRef` â€” **never** in `window.scrollY`.

```
gesture â†’ targetRef (progress 0 â†’ 1)
        â†’ LERP   (currentRef, Ï„ = 8, SNAP = 0.002)
        â†’ video.currentTime
        â†’ `--tp` custom property on #hero
```

| piece | where |
| --- | --- |
| `type TransportState = "armed" \| "released"` | `useVideoScrub.ts` |
| state machine + re-arm | `useVideoScrub.ts` |
| wheel Â· touch Â· keyboard capture (ARMED only) | `useVideoScrub.ts` |
| the single rAF loop | `useVideoScrub.ts` (`tick`) |
| planes that move with `--tp` | `src/index.css` (`.hero-*`) |
| hero interface layer | `src/components/ui/minimalist-hero.tsx` |

**ARMED.** `loadedmetadata` pauses the film and pins it to `currentTime = 0`.
The document is locked (`html.sender-armed`) so the page cannot move; wheel,
touch and keyboard feed `targetRef`. The progress is written to the stage as
`--tp`, which every hero plane reads:

| plane | movement |
| --- | --- |
| index / nav (hero) | `translateX(-16vw Â· tp)` |
| CTA | `translateX(+12vw Â· tp)` |
| wordmark | `translateY(-26vh Â· tp)` + hands off near the end |
| capability chips | `translateX(-20vw Â· tp)` |
| location | `translateX(+16vw Â· tp)` |
| **the film** | `transform: translate(-50%, -50%)` â€” **never moves** |

**Release.** At `tp â‰¥ 0.999` the transport writes `currentTime = duration âˆ’ 1/60`
(so the true last frame stays renderable), waits two painted frames, and â€” once
the gesture has come to rest for 140 ms (so a wheel spin does not dump its
momentum into the page, capped at 750 ms) â€” commits `released`. The lock lifts,
the rAF loop stops, and no auto-scroll happens.

**Re-arm.** `scrollY â‰¤ 2` while `released` â†’ progress back to 0, first frame
rendered, ARMED again. `navigationInProgressRef` blocks that check while an
in-page jump settles, so programmatic navigation never fights the re-arm.

---

## Sections

Below the hero the page is deliberately static and editorial: no fade-ups, no
reveals, no staggering, no parallax, no count-ups. The only motion is the About
film, and it plays **only while on screen** (`IntersectionObserver`), paused for
reduced motion.

`navbar` â†’ `#hero Â· #about Â· #process Â· #products Â· #work Â· #contact`
(`INGENIERÃA` â†’ `#process`, `PROYECTOS` â†’ `#work`, as specified).

## Language

`LanguageProvider` / `useLang` at `src/lib/i18n.tsx`, every visible string in
`src/content/site.ts` under `copy.es` and `copy.en`. Nothing is mixed: the hero
index, tagline, chips, section titles, body copy, buttons, `mailto` subjects and
document `lang` all switch together. The choice persists in `localStorage` and
defaults to the browser language (`es` for a Chilean visitor).

## Reduced motion

`prefers-reduced-motion: reduce` (or `?reduce=1`, which is what the automated
checks use) disables the transport entirely: no capture, no pin, no rAF, no
lock â€” the hero is a static composed frame and native scrolling is immediate.
The About film stays paused.

---

## Assets â€” all real Sender, nothing borrowed

There was **no** Sender site, video or imagery in `nexu-io/open-design`, and no
stock, Unsplash, Nomad or 21st.dev asset is used anywhere. The hero film and the
About loop are rendered procedurally from the Sender identity itself:

```
public/assets/sender-hero.mp4          1920Ã—1200 Â· 7 s Â· 30 fps Â· all-intra, silent
public/assets/sender-loop-about.mp4    1280Ã—800  Â· 5 s Â· 30 fps Â· seamless loop
public/assets/*-poster.jpg             the exact first frame of each film
public/assets/sender-og.jpg            1200Ã—630 social card, a real film frame
```

`scripts/make-signal-video.py` draws the RF instrumentation â€” AM carrier under
its modulation envelope, spectrum analyzer, lattice tower with its radiated
field, band legend, transport telemetry â€” using only the four Sender colours.
The encode is all-intra (`-g 1`, no scene cuts) so **every** frame is a keyframe
and `currentTime` scrubbing is exact, per frame. Company facts (address, phone,
both emails, "more than 20 years", product lines, NAVTEX 490/518 kHz, the AM/FM
bands, the Navy tower teardown in ValparaÃ­so) come from Sender's own published
material â€” no invented prices, powers, brands, models, certifications, clients
or projects.

## SEO

Title, description, canonical `https://www.sender.cl/`, Open Graph/Twitter card,
`robots.txt`, `sitemap.xml` and the existing-style Organization JSON-LD (name,
address in San Miguel, phone, both emails, areas served, `knowsAbout`) are in
`index.html`. No structured data beyond what Sender states.

## Palette & type

`#ffffff Â· #1e73be Â· #494949 Â· #0085b2` only â€” no glassmorphism, no neon, no AI-
startup gradients. Inter (variable) for interface and editorial type, JetBrains
Mono for instrumentation, both self-hosted and precached from npm.

---

## Verification

`scripts/verify-transport.py` drives a real Chrome build through the whole
sequence â€” 52 checks, all passing:

```bash
npm run build && npm run preview          # in one shell
python3 scripts/verify-transport.py http://localhost:4173/
```

It covers first frame, no-autoplay, both scrub directions, pinning while ARMED,
release with no auto-scroll, native scroll afterwards, in-page navigation (from
idle *and* while ARMED), re-arm at the top, reduced motion, ESâ†”EN, the About
film's visibility loop, touch drag on a phone profile, the mobile menu closing
with `body` overflow restored, and zero horizontal overflow at 320 Â· 375 Â· 480 Â·
768 Â· 1024 Â· 1440 Â· 1920 Â· 2560 px.

`docs/transport-contact-sheet.png` shows what the transport actually renders
across `tp` 0 â†’ 1. Further stills: `docs/hero-desktop.png`,
`docs/hero-final-frame.png`, `docs/hero-mobile.png`,
`docs/hero-reduced-motion.png`, `docs/section-products.png`,
`docs/mobile-menu.png`. `ACCEPTANCE.md` maps the brief's checklist to results.

### Development read-out

In `npm run dev` a small indicator shows `STATE Â· PROGRESS Â· TIME`. It is gated
on `import.meta.env.DEV`, writes straight to the DOM (never through React), and
is compiled out of production builds â€” the automated check asserts it is absent
from `dist`.

---

## Structure

```
src/
â”œâ”€â”€ main.tsx Â· App.tsx Â· index.css
â”œâ”€â”€ components/  Navbar Â· MobileMenu Â· LanguageSwitcher
â”‚                ui/minimalist-hero.tsx        â† hero interface layer
â”œâ”€â”€ sections/    Hero Â· About Â· Process Â· Products Â· Work Â· Quote Â· Contact
â”œâ”€â”€ hooks/       useVideoScrub.ts Â· useReducedMotion.ts
â”œâ”€â”€ content/     site.ts                       â† every ES/EN string + company facts
â””â”€â”€ lib/         i18n.tsx Â· utils.ts
scripts/         make-signal-video.py Â· verify-transport.py
public/assets/   the films and posters
```

## Notes for the owner

- **Swap in real footage.** Drop a Sender film at `public/assets/sender-hero.mp4`
  (any length, silent, all-intra intra-frame encode recommended) and regenerate
  the poster frame â€” the transport needs no code change.
- **Deploy:** `dist/` is a static bundle; `vercel.json`-style SPA rewrites are not
  required (single route, anchor navigation).