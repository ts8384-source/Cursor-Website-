#!/usr/bin/env bash
# Idempotent Cloud Agent / local bootstrap for Project Home Eprop (wiki site).
set -euo pipefail
cd "$(dirname "$0")/.."

# Vite 7 needs Node 20.19+. Distro images often ship 18, which dies on crypto.hash.
if [[ "$(node -p 'process.versions.node.split(".").map(Number)[0]' 2>/dev/null || echo 0)" -lt 20 ]]; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  fi
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
  # `nvm use` resolves .nvmrc against local installs; only fetch when it is absent.
  nvm use || { nvm install && nvm use; }
fi

npm ci

# Default API path is BM25-only (RAG_BM25_ONLY=1). Dense Chroma is opt-in via RAG_DENSE=1.
python3 -m pip install --user --quiet 'rank-bm25>=0.2.2'

# Older API spawns `python` first; Linux images often only ship python3.
mkdir -p "${HOME}/.local/bin"
if ! command -v python >/dev/null 2>&1; then
  ln -sfn "$(command -v python3)" "${HOME}/.local/bin/python"
fi
export PATH="${HOME}/.local/bin:${PATH}"

# Seed corpus + BM25 indexes from on-disk MD / papers / code (no HF download).
export RAG_BM25_ONLY=1
export PYTHONPATH="${PWD}${PYTHONPATH:+:$PYTHONPATH}"
python3 -m rag.cli seed
python3 -m rag.cli rebuild

# Optional offline KaTeX + JSXGraph copies under frontend/public/vendor/
if [[ -x ./scripts/vendor-math-assets.sh ]]; then
  ./scripts/vendor-math-assets.sh || true
fi
