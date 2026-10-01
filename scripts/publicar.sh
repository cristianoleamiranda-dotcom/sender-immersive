#!/usr/bin/env bash
#
# SENDER — publicar el sitio en GitHub Pages.
#
# QUÉ HACE
#   1. Clona `sender-immersive` (o reutiliza el clon si ya existe).
#   2. Crea la rama `immersive-redesign` y le aplica el árbol de este proyecto.
#   3. Hace los 12 commits por hito.
#   4. Empuja la rama.
#   5. Dispara el workflow `pages.yml` DESDE ESA RAMA.
#
# POR QUÉ DESDE LA RAMA Y NO DESDE main
#   `main` conserva la versión publicada actual, intacta. Publicar desde
#   `immersive-redesign` da una URL en vivo sin tocar esa rama, y volver atrás
#   es volver a disparar el workflow sobre `main`. Nada se pierde.
#
# TOKEN
#   Necesita un token fine-grained con `Contents: Read and write` y
#   `Actions: Read and write` sobre `cristianoleamiranda-dotcom/sender-immersive`.
#   Se pasa por entorno, nunca por argumento (los argumentos quedan en el
#   historial del shell):
#
#     GITHUB_TOKEN=github_pat_... bash scripts/publicar.sh
#
#   Vida corta (≤ 7 días) según la política del propio proyecto en SEGURIDAD.md.

set -euo pipefail

# Al salir, el token no debe quedar escrito en el remoto del clon.
limpiar() {
  if [[ -n "${CLON:-}" && -d "${CLON:-}/.git" ]]; then
    git -C "$CLON" remote set-url origin "${URL_REPO:-}" 2>/dev/null || true
  fi
}
trap limpiar EXIT

PROYECTO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROPIETARIO="${PROPIETARIO:-cristianoleamiranda-dotcom}"
REPO="${REPO:-sender-immersive}"
# Sustituibles sólo para probar el flujo contra un repositorio local.
URL_REPO="${URL_REPO:-https://github.com/${PROPIETARIO}/${REPO}.git}"
API="${API:-https://api.github.com}"
RAMA="immersive-redesign"
WORKFLOW="pages.yml"
CLON="${CLON:-/tmp/publicar-sender-immersive}"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo
  echo "  ✗ falta GITHUB_TOKEN." >&2
  echo "    GITHUB_TOKEN=github_pat_... bash scripts/publicar.sh" >&2
  echo >&2
  exit 1
fi

echo
echo "  publicando en $PROPIETARIO/$REPO  ·  rama $RAMA"
echo

# ── 1. Clon ────────────────────────────────────────────────────────────────
# Credencial embebida sólo en memoria, nunca escrita en `.git/config` de forma
# permanente: al terminar se restaura la URL limpia.
URL_CON_CREDENCIAL="${URL_REPO/https:\/\//https://x-access-token:${GITHUB_TOKEN}@}"

if [[ -d "$CLON/.git" ]]; then
  echo "  usando el clon existente en $CLON"
  cd "$CLON"
  git fetch --quiet origin
else
  echo "  clonando…"
  git clone --quiet "$URL_CON_CREDENCIAL" "$CLON"
  cd "$CLON"
fi

git remote set-url origin "$URL_CON_CREDENCIAL"

# La rama se reconstruye SIEMPRE desde `main`.
#
# Así publicar es determinista: la rama resulta ser exactamente «main + los 12
# hitos de esta reconstrucción», sin heredar nada de intentos anteriores. Si
# `main` avanza, la próxima publicación parte de la versión nueva.
echo "  rama $RAMA reconstruida desde main ($(git rev-parse --short origin/main))"
git checkout --quiet -B "$RAMA" origin/main

# ── 2 y 3. Árbol + los 12 commits ──────────────────────────────────────────
bash "$PROYECTO/scripts/hitos.sh" "$CLON"

# ── 4. Empujar ─────────────────────────────────────────────────────────────
echo "  empujando…"
git push --quiet --force-with-lease origin "$RAMA"
echo "  ✓ rama empujada"
echo

# ── 5. Disparar el despliegue desde esa rama ───────────────────────────────
echo "  disparando $WORKFLOW sobre $RAMA…"
RESPUESTA=$(curl -sS -o /tmp/pages-dispatch.json -w "%{http_code}" -X POST \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "${API}/repos/${PROPIETARIO}/${REPO}/actions/workflows/${WORKFLOW}/dispatches" \
  -d "{\"ref\":\"${RAMA}\"}")

if [[ "$RESPUESTA" == "204" ]]; then
  echo "  ✓ despliegue lanzado"
else
  echo "  ! el disparo devolvió $RESPUESTA:"
  cat /tmp/pages-dispatch.json
  echo
  echo "  La rama SÍ está empujada. Se puede lanzar a mano desde:"
  echo "  https://github.com/${PROPIETARIO}/${REPO}/actions/workflows/${WORKFLOW}"
fi

# ── Esperar el resultado y dar la URL ──────────────────────────────────────
echo
echo "  esperando a que termine el despliegue (suele tardar ~1 min)…"
for i in $(seq 1 30); do
  sleep 6
  ESTADO=$(curl -sS \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    "${API}/repos/${PROPIETARIO}/${REPO}/actions/runs?branch=${RAMA}&per_page=1" \
    | python3 -c "
import json,sys
try:
    r = json.load(sys.stdin)['workflow_runs'][0]
    print(f\"{r['status']}|{r['conclusion'] or ''}|{r['html_url']}\")
except Exception:
    print('desconocido||')
")
  IFS='|' read -r STATUS CONCLUSION URL_RUN <<< "$ESTADO"

  if [[ "$STATUS" == "completed" ]]; then
    echo "  estado: $CONCLUSION"
    if [[ "$CONCLUSION" == "success" ]]; then
      echo
      echo "  ══════════════════════════════════════════════════════════"
      echo "   EN VIVO:  https://${PROPIETARIO}.github.io/${REPO}/"
      echo "  ══════════════════════════════════════════════════════════"
    else
      echo "  revisa el registro: $URL_RUN"
    fi
    break
  fi
  printf "."
done

echo
echo "  Dejar main como estaba (si hace falta):"
echo "    gh workflow run ${WORKFLOW} --repo ${PROPIETARIO}/${REPO} --ref main"
echo
