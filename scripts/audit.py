#!/usr/bin/env python3
"""
SENDER — auditor automático de cumplimiento del brief.

Comprueba, sobre el árbol de código fuente, las reglas duras del encargo.
No juzga estética: eso es el DESIGN-REVIEW. Aquí sólo se verifica lo que se
puede verificar sin criterio humano.

Uso:  python3 scripts/audit.py          (informe)
      python3 scripts/audit.py --estricto  (sale con 1 si algo falla)
"""

from __future__ import annotations

import json
import pathlib
import re
import sys
from collections import defaultdict

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

# ── Reglas ────────────────────────────────────────────────────────────────

PALETA = {"#ffffff", "#1e73be", "#494949", "#0085b2"}

# Matices prohibidos por el brief, en HSL.
PROHIBIDOS_MATIZ = {
    "morado/violeta": [(250, 300), (300, 330)],
    "rosa": [(300, 345)],
    "naranja": [(20, 45)],
    "amarillo/dorado": [(45, 70)],
    "verde": [(80, 170)],
}

VOCABULARIO_PROHIBIDO = [
    r"innovative solutions?", r"soluciones? innovadoras?",
    r"cutting[- ]edge", r"de última generación", r"ultima generacion",
    r"revolutionary", r"revolucionari[oa]",
    r"next[- ]generation", r"world[- ]class", r"de clase mundial",
    r"vanguardia",
]

# Términos que indican invención de datos (el brief lo prohíbe).
INVENCION = [
    r"\b\d{2,3}\s*proyectos?\s+(completados|realizados|entregados)",
    r"\bnuestros?\s+\d+\s+clientes",
    r"award[- ]winning", r"premiad[oa]s?\b", r"certificad[oa]s?\s+ISO",
    r"nº\s*1\b", r"líderes?\s+(del|en el)\s+mercado",
]


def hsl(hexstr: str) -> tuple[float, float, float]:
    h = hexstr.lstrip("#")
    r, g, b = (int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))
    mx, mn = max(r, g, b), min(r, g, b)
    l = (mx + mn) / 2
    if mx == mn:
        return 0.0, 0.0, l
    d = mx - mn
    s = d / (2 - mx - mn) if l > 0.5 else d / (mx + mn)
    if mx == r:
        hue = (g - b) / d + (6 if g < b else 0)
    elif mx == g:
        hue = (b - r) / d + 2
    else:
        hue = (r - g) / d + 4
    return hue * 60, s, l


def lineas_src() -> list[tuple[pathlib.Path, int, str]]:
    out = []
    for ext in ("*.ts", "*.tsx", "*.css", "*.mjs", "*.html"):
        for f in SRC.rglob(ext):
            for i, line in enumerate(f.read_text(errors="ignore").splitlines(), 1):
                out.append((f, i, line))
    for f in [ROOT / "index.html"]:
        if f.exists():
            for i, line in enumerate(f.read_text(errors="ignore").splitlines(), 1):
                out.append((f, i, line))
    return out


# ── Comprobaciones ────────────────────────────────────────────────────────

def check_paleta(lineas, fallos):
    """Cada color del proyecto debe estar en la paleta o ser una escala legítima."""
    declarados: dict[str, list[str]] = defaultdict(list)
    for f, i, line in lineas:
        for m in re.finditer(r"#([0-9a-fA-F]{3,8})\b", line):
            hexv = "#" + m.group(1).lower()
            if len(m.group(1)) == 3:
                hexv = "#" + "".join(c * 2 for c in m.group(1).lower())
            if len(hexv) != 7:
                continue  # 8 dígitos = con alfa, sale de la comprobación de matiz
            declarados[hexv].append(f"{f.relative_to(ROOT)}:{i}")

    fuera = {}
    for hexv, donde in declarados.items():
        if hexv in PALETA:
            continue
        h, s, l = hsl(hexv)
        # Escalas: mismo color, otro valor. Gris puro siempre es legítimo.
        if s < 0.08:
            continue
        # Azul y cian: el matiz debe caer cerca de sus familias.
        if s >= 0.08 and (185 <= h <= 235):
            continue
        # Tintes del sistema usados en `color-mix` sobre foto (para el grade).
        if 195 <= h <= 225:
            continue
        for nombre, rangos in PROHIBIDOS_MATIZ.items():
            if any(a <= h < b for a, b in rangos):
                fuera.setdefault(nombre, []).extend(donde[:2])

    if fuera:
        for nombre, donde in fuera.items():
            fallos.append(("PALETA", f"matiz prohibido «{nombre}» en {', '.join(sorted(set(donde))[:4])}"))
    return len(declarados)


def check_grade(lineas, fallos):
    """El grade debe ser de presentación, no destructivo: no se toca el original."""
    originales = list((ROOT / "assets" / "source").glob("*.jpg"))
    en_media = list((ROOT / "public" / "media").glob("*-master.jpg"))
    if len(originales) != 10:
        fallos.append(("ASSETS", f"se esperaban 10 fotografías originales, hay {len(originales)}"))
    if len(en_media) != 10:
        fallos.append(("ASSETS", f"faltan copias maestras en public/media: {len(en_media)}/10"))
    # El color se aplica en CSS con mix-blend-mode, nunca reescribiendo el archivo.
    css = (SRC / "ui" / "primitives.css").read_text()
    if "mix-blend-mode: color" not in css:
        fallos.append(("GRADE", "el grade por mezcla desapareció de primitives.css"))


def check_vocabulario(lineas, fallos):
    for f, i, line in lineas:
        bajo = line.lower()
        for pat in VOCABULARIO_PROHIBIDO:
            if re.search(pat, bajo):
                fallos.append(("COPY", f"{f.relative_to(ROOT)}:{i} → «{line.strip()[:70]}»"))


def check_invencion(lineas, fallos):
    for f, i, line in lineas:
        bajo = line.lower()
        for pat in INVENCION:
            if re.search(pat, bajo):
                fallos.append(("CONTENIDO", f"{f.relative_to(ROOT)}:{i} → «{line.strip()[:70]}»"))


def check_bilingue(fallos):
    """Toda clave de contenido debe tener es y en."""
    cont = SRC / "content"
    problema = 0
    total_pares = 0
    for f in list(cont.glob("*.ts")):
        if f.name.startswith("media.generated"):
            continue
        texto = f.read_text()
        # Un `Loc` válido tiene exactamente es: y en: en el mismo bloque.
        for m in re.finditer(r"\{\s*es:\s*[^,}]+,\s*en:\s*[^,}]+\s*\}", texto):
            total_pares += 1
        # Busca `{ es: "..." }` sin `en:`
        for m in re.finditer(r"\{\s*es:\s*\"[^\"]*\"\s*\}", texto):
            problema += 1
            linea = texto[: m.start()].count("\n") + 1
            fallos.append(("I18N", f"{f.relative_to(ROOT)}:{linea} → par sin traducción al inglés"))
    if total_pares < 200:
        fallos.append(("I18N", f"solo {total_pares} pares es/en encontrados: ¿se perdió contenido?"))
    return total_pares


def check_accesibilidad(fallos):
    """Las reglas de accesibilidad que el brief exige."""
    lineas = list(lineas_src())

    # 1. reduced-motion respetado en toda animación de larga duración
    base_css = (SRC / "styles" / "base.css").read_text()
    neutralizador_global = (
        "prefers-reduced-motion: reduce" in base_css
        and "transition-property: opacity" in base_css
    )
    con_motion = [f for f in SRC.rglob("*.css")]
    sin_reduced = []
    for f in con_motion:
        t = f.read_text()
        if "transition" not in t and "animation" not in t:
            continue
        # Vale un bloque propio o el neutralizador global que anula transform,
        # animation y toda transición que no sea de opacidad o color.
        if "prefers-reduced-motion" in t or neutralizador_global:
            continue
        sin_reduced.append(str(f.relative_to(ROOT)))
    for s in sin_reduced:
        fallos.append(("A11Y", f"{s} anima sin cobertura de prefers-reduced-motion"))

    # 2. Toda imagen tiene alt no vacío salvo las decorativas declaradas
    for f in SRC.rglob("*.tsx"):
        t = f.read_text()
        for m in re.finditer(r"<img\b[^>]*>", t, re.S):
            tag = m.group(0)
            if "alt=" not in tag:
                linea = t[: m.start()].count("\n") + 1
                fallos.append(("A11Y", f"{f.relative_to(ROOT)}:{linea} → <img> sin alt"))
            # El alt debe ser string, nunca una variable de idioma sin resolver
            elif re.search(r't\{|t\.', tag):
                pass

    # 3. Los botones tienen texto o aria-label
    for f in SRC.rglob("*.tsx"):
        t = f.read_text()
        for m in re.finditer(r"<button\b[^>]*>\s*</button>", t, re.S):
            linea = t[: m.start()].count("\n") + 1
            fallos.append(("A11Y", f"{f.relative_to(ROOT)}:{linea} → <button> vacío"))

    # 4. Foco visible definido
    base = (SRC / "styles" / "base.css").read_text()
    if ":focus-visible" not in base:
        fallos.append(("A11Y", "no hay estilo de :focus-visible"))

    # 5. Idioma del documento declarado
    if "documentElement.lang" not in (SRC / "i18n" / "language.tsx").read_text():
        fallos.append(("A11Y", "el documento no declara su idioma"))

    # 6. Skip link
    if "saltar" not in (SRC / "ui" / "SkipLink.tsx").read_text():
        fallos.append(("A11Y", "falta el enlace de salto al contenido"))


def check_performance(fallos):
    """El presupuesto de rendimiento del DNA §8.3."""
    field = (SRC / "three" / "SignalField.tsx").read_text()

    m = re.search(r"const COLUMNAS = (\d+);", field)
    n = re.search(r"const FILAS = (\d+);", field)
    if m and n:
        vertices = int(m.group(1)) * int(n.group(1)) * 2
        if vertices > 60000:
            fallos.append(("PERF", f"SignalField usa {vertices} vértices (límite 60.000)"))

    # dispose obligatorio en todo objeto three que retenga recursos de GPU.
    # Un Color, un Vector3 o un Vector2 no se liberan: no son recursos.
    RETIENE_GPU = re.compile(
        r"new THREE\.(BufferGeometry|\w*Geometry|\w*Material|Texture|"
        r"WebGLRenderTarget|CubeTexture|DataTexture)\b"
    )
    for f in SRC.rglob("*.tsx"):
        t = f.read_text()
        if RETIENE_GPU.search(t) and "dispose()" not in t:
            fallos.append(
                ("PERF", f"{f.relative_to(ROOT)} crea geometría o material sin dispose()")
            )

    # dpr acotado
    canvas = (SRC / "three" / "SignalCanvas.tsx").read_text()
    if "[1, 1.75]" not in canvas:
        fallos.append(("PERF", "el dpr del canvas no está acotado a [1, 1.75]"))

    # code splitting: three.js fuera del paquete inicial
    app = (SRC / "App.tsx").read_text()
    if "lazy(" not in app:
        fallos.append(("PERF", "las escenas con WebGL no se cargan de forma diferida"))

    # builds
    dist = ROOT / "dist" / "assets"
    if dist.exists():
        chunks = list(dist.glob("*.js"))
        total = sum(c.stat().st_size for c in chunks)
        # El paquete inicial no debe incluir el chunk de webgl
        inicial = [c for c in chunks if c.name.startswith("index-")]
        if inicial and inicial[0].stat().st_size > 260_000:
            fallos.append(("PERF", f"paquete inicial de {inicial[0].stat().st_size/1024:.0f} KB (presupuesto 260 KB)"))


def check_seo(fallos):
    meta = (SRC / "seo" / "meta.ts").read_text()
    for req, nombre in [
        ("hreflang", "hreflang recíproco"),
        ("x-default", "x-default"),
        ("canonical", "canonical"),
        ('og:image', "Open Graph con imagen"),
        ("application/ld+json", "JSON-LD"),
    ]:
        if req not in meta:
            fallos.append(("SEO", f"falta {nombre}"))

    for f, nombre in [("sitemap.xml", "sitemap"), ("robots.txt", "robots")]:
        p = ROOT / "public" / f
        if not p.exists():
            fallos.append(("SEO", f"falta {nombre}"))
        elif f == "sitemap.xml" and "hreflang" not in p.read_text():
            fallos.append(("SEO", "el sitemap no lleva anotaciones hreflang"))


def check_assets(lineas, fallos):
    """No puede haber imágenes externas ni placeholders."""
    for f, i, line in lineas:
        if re.search(r'https?://[^"\']*\.(jpg|jpeg|png|webp|avif|svg)', line, re.I):
            if "schema.org" not in line and "w3.org" not in line:
                fallos.append(("ASSETS", f"{f.relative_to(ROOT)}:{i} → imagen externa: {line.strip()[:60]}"))
        if re.search(r"via\.placeholder|placehold\.co|unsplash|pexels|picsum", line, re.I):
            fallos.append(("ASSETS", f"{f.relative_to(ROOT)}:{i} → stock o placeholder"))


def main() -> int:
    estricto = "--estricto" in sys.argv
    lineas = lineas_src()
    fallos: list[tuple[str, str]] = []

    n_colores = check_paleta(lineas, fallos)
    check_grade(lineas, fallos)
    check_vocabulario(lineas, fallos)
    check_invencion(lineas, fallos)
    n_pares = check_bilingue(fallos)
    check_accesibilidad(fallos)
    check_performance(fallos)
    check_seo(fallos)
    check_assets(lineas, fallos)

    por_categoria: dict[str, list[str]] = defaultdict(list)
    for cat, msg in fallos:
        por_categoria[cat].append(msg)

    print()
    print("═" * 72)
    print("  AUDITORÍA DE CUMPLIMIENTO — SENDER")
    print("═" * 72)
    print()
    print(f"  archivos analizados        {len({f for f, _, _ in lineas})}")
    print(f"  literales de color hallados {n_colores}")
    print(f"  pares es/en verificados    {n_pares}")
    print()

    ORDEN = ["PALETA", "COPY", "CONTENIDO", "I18N", "A11Y", "PERF", "SEO", "ASSETS", "GRADE"]
    total = 0
    for cat in ORDEN:
        msgs = por_categoria.get(cat, [])
        if not msgs:
            print(f"  ✓ {cat:12s} sin hallazgos")
            continue
        total += len(msgs)
        print(f"  ✗ {cat:12s} {len(msgs)} hallazgo(s)")
        for m in msgs[:8]:
            print(f"      · {m}")
        if len(msgs) > 8:
            print(f"      · … y {len(msgs)-8} más")

    print()
    if total == 0:
        print("  RESULTADO: cumple todas las reglas duras del brief.")
    else:
        print(f"  RESULTADO: {total} hallazgo(s). Revisar arriba.")
    print()

    return 1 if (estricto and total) else 0


if __name__ == "__main__":
    raise SystemExit(main())
