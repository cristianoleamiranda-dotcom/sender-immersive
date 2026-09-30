#!/usr/bin/env python3
"""
SENDER — Pipeline de medios.

Toma las fotografías ORIGINALES de `assets/source/` y produce, para cada una,
la cascada de variantes responsive en AVIF, WebP y JPG de respaldo.

Reglas que NO se rompen:
  - Nunca se agranda una imagen más allá de su ancho original.
  - Nunca se recorta aquí: el recorte es una decisión de escena, no de pipeline.
  - Nunca se altera el color. El grade es de presentación (ver DESIGN DNA §6.3).
  - Los originales permanecen intactos en `assets/source/`.

Uso:  python3 scripts/optimize-media.py
"""

from __future__ import annotations

import json
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "source"
OUT = ROOT / "public" / "media"

# Anchos de la cascada. Los que excedan el original se descartan por imagen.
WIDTHS = [640, 960, 1280, 1600, 1920]
# Presupuesto de peso por variante.
QUALITY = {"avif": 52, "webp": 78, "jpg": 82}

# Los pósters del hero NO son fotografías: son fotogramas del video. Se listan
# aparte porque no se recortan ni se reescalan — ya vienen derivados del frame 1
# real— pero sí tienen que entrar en el pipeline. Sin esto, limpiar
# `public/media/` los borra y el hero se queda pidiendo un póster que no existe.
POSTERS = [
    "hero-poster-640.webp",
    "hero-poster-960.webp",
    "hero-poster-1280.webp",
]

PHOTOS = [
    "hero.jpg",
    "hero-wide.jpg",
    "about.jpg",
    "cap-broadcast.jpg",
    "cap-transmission.jpg",
    "cap-antennas.jpg",
    "cap-rf.jpg",
    "cap-critical.jpg",
    "proj-am.jpg",
    "proj-stl.jpg",
]


def probe(path: pathlib.Path) -> tuple[int, int]:
    w, h = subprocess.run(
        ["identify", "-format", "%w %h", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout.split()
    return int(w), int(h)


def convert(src: pathlib.Path, dst: pathlib.Path, width: int, fmt: str) -> bool:
    cmd = [
        "magick", str(src),
        "-resize", f"{width}x>",          # '>' = nunca agrandar
        "-strip",                          # fuera metadatos: peso y privacidad
        "-quality", str(QUALITY[fmt]),
    ]
    if fmt == "avif":
        cmd += ["-define", "heic:chroma=444"]
    cmd.append(str(dst))
    try:
        subprocess.run(cmd, capture_output=True, check=True)
        return True
    except subprocess.CalledProcessError as exc:
        print(f"    ! {fmt} falló: {exc.stderr.decode()[:120]}", file=sys.stderr)
        if dst.exists():
            dst.unlink()
        return False


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest: dict[str, dict] = {}
    total_before = total_after = 0

    for name in PHOTOS:
        src = SRC / name
        if not src.exists():
            print(f"  ✗ falta {name}", file=sys.stderr)
            continue

        stem = src.stem
        ow, oh = probe(src)
        before = src.stat().st_size
        total_before += before

        variants: dict[str, list[int]] = {"avif": [], "webp": [], "jpg": []}
        after = 0

        for w in WIDTHS:
            if w > ow:
                continue
            for fmt in ("avif", "webp", "jpg"):
                dst = OUT / f"{stem}-{w}.{fmt}"
                if convert(src, dst, w, fmt):
                    variants[fmt].append(w)
                    after += dst.stat().st_size

        # Copia íntegra del original como último recurso de compatibilidad.
        master = OUT / f"{stem}-master.jpg"
        shutil.copy2(src, master)
        after += master.stat().st_size
        total_after += after

        manifest[stem] = {
            "src": name,
            "width": ow,
            "height": oh,
            "aspect": round(ow / oh, 4),
            "variants": variants,
            "bytes": {"original": before, "delivered": after},
        }

        ratio = after / before
        print(f"  {stem:18s} {ow}×{oh:<5d} {before/1024:7.0f} KB → "
              f"{after/1024:7.0f} KB en {sum(len(v) for v in variants.values())} archivos "
              f"({ratio:.2f}×)")

    (OUT / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n"
    )

    # ── Pósters del hero: se copian tal cual, son fotogramas ya derivados ──
    print()
    for nombre in POSTERS:
        origen = SRC / nombre
        if not origen.exists():
            print(f"  ✗ falta el póster {nombre}", file=sys.stderr)
            continue
        shutil.copy2(origen, OUT / nombre)
        print(f"  póster {nombre:26s} {origen.stat().st_size/1024:6.0f} KB")

    # Módulo TypeScript tipado, para que el código no escriba rutas a mano.
    lines = [
        "/* GENERADO por scripts/optimize-media.py — no editar a mano. */",
        "",
        "export interface MediaEntry {",
        "  width: number;",
        "  height: number;",
        "  aspect: number;",
        "  /** Anchos disponibles, de menor a mayor. */",
        "  widths: number[];",
        "}",
        "",
        "export const media = {",
    ]
    for stem, m in manifest.items():
        widths = sorted(set(m["variants"]["avif"]) | set(m["variants"]["webp"]))
        lines.append(
            f'  {json.dumps(stem)}: {{ width: {m["width"]}, height: {m["height"]}, '
            f'aspect: {m["aspect"]}, widths: {json.dumps(widths)} }},'
        )
    lines += ["} as const satisfies Record<string, MediaEntry>;", "",
              "export type MediaKey = keyof typeof media;", ""]

    ts_path = ROOT / "src" / "content" / "media.generated.ts"
    ts_path.write_text("\n".join(lines))

    print()
    faltan = [p for p in POSTERS if not (OUT / p).exists()]
    if faltan:
        print(f"  ✗ ATENCIÓN: faltan pósters en public/media: {faltan}", file=sys.stderr)
        return 1
    print(f"  TOTAL  {total_before/1024/1024:.2f} MB de originales intactos")
    print(f"  manifiesto → public/media/manifest.json ({len(manifest)} piezas)")
    print(f"  tipos      → src/content/media.generated.ts")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
