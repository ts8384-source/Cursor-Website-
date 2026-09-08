#!/usr/bin/env bash
# Clone Project Home Eprop onto ~/Desktop, then boot master.
# sudo only creates/owns Desktop; git/npm run as the user (auth + nvm).
# Usage: bash scripts/desktop-setup.sh
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/ts8384-source/Project-Home-Eprop.git}"
BRANCH="${BRANCH:-master}"
DESKTOP="${DESKTOP:-$HOME/Desktop}"
DEST="$DESKTOP/Project-Home-Eprop"
OWNER="$(id -un)"
GROUP="$(id -gn)"

# sudo cd is invalid. Elevate only mkdir/chown for Desktop.
sudo mkdir -p "$DESKTOP"
sudo chown "$OWNER:$GROUP" "$DESKTOP" 2>/dev/null || true
cd "$DESKTOP"

if [[ ! -d "$DEST/.git" ]]; then
  git clone "$REPO_URL" "$DEST"
fi

cd "$DEST"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH" || true

./scripts/cloud-agent-install.sh
exec npm run dev
