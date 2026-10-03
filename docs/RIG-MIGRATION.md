# Migración al rig §17 — r3f-scroll-rig + three-story-controls

Decisión aprobada por la persona (2026-10-02): instalar ambos.

## Estado actual (lo que ya funciona)

- `useSmoothScroll` (Lenis) + `useScrollProgress` → scroll como timeline por escena.
- Un `<Canvas>` POR escena (`SignalCanvas`), montado por IntersectionObserver,
  con `dpr` acotado, fallback 2D y liberación de contexto. No hay contexto
  WebGL compartido entre escenas.

## Objetivo (brief §17: SCROLL = CAMERA)

1. Un solo canvas WebGL fijo (`position: fixed; inset: 0`) vía `GlobalCanvas`
   de `@14islands/r3f-scroll-rig`; el DOM editorial fluye encima.
2. `useTracker`/`ScrollScene` sobre nodos DOM con `data-3d` → planos 3D
   sincronizados (máscara, profundidad, distorsión de scroll).
3. `three-story-controls` (ScrollControls / 3DOF) para los pasajes de cámara
   entre escenas; el scroll interpola keyframes de posición/rotación/FoV.
4. `frameloop="demand"` + invalidación en scroll: nada se renderiza sin cambio.
5. Fallbacks intactos: sin WebGL / móvil / reduced-motion → canvas 2D / CSS
   parallax (la narrativa se conserva, brief §26).

## Orden de migración (no big-bang)

1. Instalar deps (hecho en package.json).
2. Escena 01 SIGNAL primero: reemplazar `SignalCanvas` local por `GlobalCanvas`
   + `ScrollScene` tras feature flag `VITE_RIG=r3f`. El GLSL de `SignalField`
   no cambia.
3. Verificar: bundle inicial <= 120 KB gzip, 0 errores de consola ES/EN, 0
   overflow 360px, DPR acotado.
4. Si 01 pasa el Design Loop, extender a 00 (Entry) y 03 (Engineering).
5. Cada paso es un commit por hito (`04-signal-system`, `05-engineering`...).

## Reglas innegociables

- La cámara avanza con el scroll; la imagen no se deforma (ref Da7ZuhyWACg).
- Nada rebota; easings `power2.out` (ref 3eExfC63uSc).
- Reduced-motion y móvil: SIEMPRE fallback narrativo, nunca página muerta.
- Las dos piezas propias (propagación física del 01, diagrama polar del 03)
  se conservan tal cual: son el DNA diferencial.
