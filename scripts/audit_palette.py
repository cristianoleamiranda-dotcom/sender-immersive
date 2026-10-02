#!/usr/bin/env python3
# scripts/audit_palette.py
# Verifica que NO hay colores fuera de la paleta Liquid

import re
import sys
from pathlib import Path

# Paleta Liquid permitida (hex normalizados a 6 dígitos)
LIQUID_PALETTE = {
    # Core
    'ffffff', '1e73be', '494949', '0085b2',
    # Neutros derivados
    '000000', '0a0a0a', '131313', '1e1e1e', '2e2e2e', '494949', '6e6e6e', '828282', 'a8a8a8', 'd6d6d6',
    # Azules derivados
    '061424', '0b2540', '133a5e', '1e73be', '4d97d6', '8cbce6', 'c7dff5',
    # Cian derivados (señal / datos)
    '00465e', '00719a', '0085b2', '33a3cc', '66c0dc', '99d8ec',
}

# Extensiones a auditar
EXTENSIONS = {'.ts', '.tsx', '.css', '.scss', '.js', '.jsx', '.json', '.md'}

# Patrones de color hex (3, 4, 6, 8 dígitos)
HEX_PATTERN = re.compile(r'#([0-9a-fA-F]{3,8})\b')

# Archivos/directorios a ignorar
IGNORE_PATHS = {
    'node_modules', '.next', '.git', 'out', 'dist', 'coverage', '.turbo',
    '.agents', '.claude', 'agent', 'qa', 'shots', 'reference', 'package-lock.json'
}


def normalize_hex(hex_str: str) -> str:
    """Normaliza hex a 6 dígitos lowercase sin #"""
    hex_str = hex_str.lower()
    if len(hex_str) == 3:
        return ''.join(c * 2 for c in hex_str)
    if len(hex_str) == 4:
        return ''.join(c * 2 for c in hex_str[:3])
    if len(hex_str) == 8:
        return hex_str[:6]  # Ignora alpha
    return hex_str[:6]


def should_ignore(path: Path) -> bool:
    return any(part in IGNORE_PATHS for part in path.parts)


def audit_file(filepath: Path) -> list:
    violations = []
    try:
        content = filepath.read_text(encoding='utf-8')
    except Exception:
        return violations

    for match in HEX_PATTERN.finditer(content):
        raw = match.group(1)
        if len(raw) not in (3, 4, 6, 8):
            continue
        hex_val = normalize_hex(raw)
        if hex_val not in LIQUID_PALETTE:
            line_no = content[:match.start()].count('\n') + 1
            violations.append({
                'file': str(filepath),
                'line': line_no,
                'color': f'#{hex_val}',
                'context': content[max(0, match.start() - 40):match.end() + 40].strip(),
            })
    return violations


def main():
    root = Path(__file__).parent.parent
    all_violations = []

    for ext in EXTENSIONS:
        for filepath in root.rglob(f'*{ext}'):
            if should_ignore(filepath):
                continue
            all_violations.extend(audit_file(filepath))

    if all_violations:
        print(f"❌ PALETTE AUDIT FAILED: {len(all_violations)} violations found\n")
        for v in all_violations:
            print(f"  {v['file']}:{v['line']} - {v['color']}")
            print(f"    Context: ...{v['context']}...")
        sys.exit(1)
    else:
        print("✅ PALETTE AUDIT PASSED: 0 violations")
        sys.exit(0)


if __name__ == '__main__':
    main()
