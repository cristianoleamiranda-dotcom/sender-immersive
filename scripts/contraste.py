#!/usr/bin/env python3
"""
SENDER — verificación de contraste WCAG 2.1.

Lee los tokens REALES de `src/styles/tokens.css` y mide cada combinación de
texto sobre fondo que el sitio usa de verdad. Sin valores duplicados: si un
token cambia, esta comprobación lo ve en el acto y no puede quedarse obsoleta.

Uso:  python3 scripts/contraste.py          (informe)
      python3 scripts/contraste.py --estricto   (sale con 1 si algo falla)
"""

from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOKENS = ROOT / "src" / "styles" / "tokens.css"

AA = 4.5
AAA = 7.0
AA_GRANDE = 3.0


def leer_tokens() -> dict[str, str]:
    """Extrae las variables `--nombre: #hex;` del archivo real."""
    texto = TOKENS.read_text()
    return {
        m.group(1): m.group(2).lower()
        for m in re.finditer(r"--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;", texto)
    }


def luminancia(hexs: str) -> float:
    h = hexs.lstrip("#")
    r, g, b = (int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))

    def canal(c: float) -> float:
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)


def ratio(a: str, b: str) -> float:
    la, lb = luminancia(a), luminancia(b)
    alto, bajo = max(la, lb), min(la, lb)
    return (alto + 0.05) / (bajo + 0.05)


# Cada caso: (texto, fondo, descripción, ¿texto grande?)
CASOS: list[tuple[str, str, str, bool]] = [
    ("paper", "noche", "Texto principal sobre fondo base", False),
    ("niebla", "noche", "Texto casi principal", False),
    ("plata", "noche", "Texto secundario", False),
    ("ceniza", "noche", "Texto terciario, notas y pies", False),
    ("cian-claro", "noche", "Dato activo, indicadores", False),
    ("azul-claro", "noche", "Acento y foco", False),
    ("azul-alto", "noche", "Titular acentuado", True),
    ("azul-tenue", "noche", "Enlace", False),

    ("paper", "azul-noche", "Texto sobre escena azul", False),
    ("niebla", "azul-noche", "Prosa sobre escena azul", False),
    ("plata", "azul-noche", "Secundario sobre escena azul", False),
    ("ceniza", "azul-noche", "Terciario sobre escena azul", False),
    ("cian-claro", "azul-noche", "Dato sobre escena azul", False),
    ("azul-tenue", "azul-noche", "Enlace sobre escena azul", False),

    ("paper", "pozo", "Texto sobre panel", False),
    ("plata", "pozo", "Secundario sobre panel", False),
    ("niebla", "pozo", "Prosa sobre panel", False),
    ("ceniza", "pozo", "Nota sobre panel", False),

    ("paper", "azul", "Texto sobre acción sólida", False),
    ("noche", "azul-claro", "Texto sobre acción en hover", False),

    ("grafito", "paper", "Texto sobre superficie clara", False),
    ("azul", "paper", "Acento sobre superficie clara", False),

    ("noche", "cian", "Texto sobre relleno cian", False),
    # `pizarra` es oscura: el texto más tenue que admite es `plata`.
    # (Se documenta en tokens.css: `ceniza` ahí daría 4,34:1 y no pasa AA.)
    ("plata", "pizarra", "Secundario sobre tarjeta", False),
    ("niebla", "pizarra", "Prosa sobre tarjeta", False),
]


def main() -> int:
    tok = leer_tokens()
    estricto = "--estricto" in sys.argv

    print()
    print("═" * 74)
    print("  CONTRASTE WCAG 2.1 — medido sobre los tokens reales")
    print("═" * 74)
    print()
    print(f"  {'combinación':44s} {'ratio':>8s}  veredicto")
    print("  " + "─" * 70)

    fallos: list[tuple[str, float, float]] = []
    faltantes: list[str] = []

    for texto, fondo, desc, grande in CASOS:
        if texto not in tok or fondo not in tok:
            faltantes.append(f"{texto}/{fondo}")
            continue
        r = ratio(tok[texto], tok[fondo])
        suelo = AA_GRANDE if grande else AA
        veredicto = "AAA" if r >= AAA else ("AA" if r >= AA else ("AA-grande" if r >= AA_GRANDE else "FALLA"))
        marca = "  ✗" if r < suelo else ""
        if r < suelo:
            fallos.append((desc, r, suelo))
        print(f"  {desc:44s} {r:6.2f}:1  {veredicto}{marca}")

    print()
    if faltantes:
        print(f"  ! tokens no encontrados: {', '.join(faltantes)}")

    if fallos:
        print(f"  RESULTADO: {len(fallos)} combinación(es) por debajo del suelo exigido.")
        for d, r, s in fallos:
            print(f"      · {d}: {r:.2f}:1 (mínimo {s}:1)")
    else:
        print("  RESULTADO: todas las combinaciones cumplen el suelo del DESIGN DNA (§1.3).")
        print(f"  Suelo aplicado: AA {AA}:1 en texto normal · AA-grande {AA_GRANDE}:1 sobre 24 px")
    print()

    return 1 if (estricto and fallos) else 0


if __name__ == "__main__":
    raise SystemExit(main())
