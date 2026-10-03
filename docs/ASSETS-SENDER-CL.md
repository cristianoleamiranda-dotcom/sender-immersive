# Assets de sender.cl — verificación 2026-10-02

Real Image Policy (brief §11): solo fotos reales. Este documento registra qué
existe de verdad y qué no, para no inventar assets.

## Lo que el brief §11 declara y NO existe en ninguna fuente accesible

Las 14 imágenes con nombre (am-1000ss.png, am-2500ss.jpg, am-5000ss.jpg,
am-10000ss.jpg, familia-am.jpg, antena-mast.jpg, atu.jpg, hf-balun.jpg,
sitio-torre.jpg, stl-banner.jpg, stl-stal100.jpg, torre-valparaiso.jpg,
circuitos.jpg, carro-fotovoltaico.jpg) no están:

- en ningún repositorio accesible (sender, sender-immersive y sus ramas),
- en la librería de medios actual de sender.cl (API /wp-json/wp/v2/media:
  87 elementos, ~7 originales).

**No se generan sustitutos.** Si esos archivos existen localmente, la salida
es subirlos al repositorio. Decisión de la persona.

## Lo que sí existe en sender.cl (verificado, originales)

| Archivo | URL | Contenido declarado |
|---|---|---|
| tx1000.jpg | uploads/2026/06/tx1000.jpg | Transmisor 1000 W |
| tx600.jpg | uploads/2026/06/tx600.jpg | Transmisor 600 W |
| tx350.jpg | uploads/2026/06/tx350.jpg | Transmisor 350 W |
| tx150.jpg | uploads/2026/06/tx150.jpg | Transmisor 150 W |
| antena_hf.jpg | uploads/2026/06/antena_hf.jpg | Antena HF |
| medicion_antena_hf.jpg | uploads/2026/06/medicion_antena_hf.jpg | Medición de antena HF |
| antena-navtex.jpg | uploads/2026/06/antena-navtex.jpg | Antena NAVTEX |

## Herramienta

npm run assets:fetch (scripts/fetch_product_images.mjs) descarga los
originales de la librería de medios de sender.cl a
public/assets/images/products/, sin renombrar y sin generar nada.
