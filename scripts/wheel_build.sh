#!/usr/bin/env bash
# Build a full wheel package including the latest console frontend.
# Run from repo root: bash scripts/wheel_build.sh
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

CONSOLE_DIR="$REPO_ROOT/console"
CONSOLE_DEST="$REPO_ROOT/src/qwenpaw/console"

echo "[wheel_build] Building console frontend..."
if [[ -n "${SKIP_CONSOLE_BUILD}" && -d "$CONSOLE_DIR/dist" ]]; then
  echo "[wheel_build] SKIP_CONSOLE_BUILD set and console/dist exists, reusing prebuilt frontend."
else
  (cd "$CONSOLE_DIR" && npm install --no-audit --no-fund)
  (cd "$CONSOLE_DIR" && npm run build)
fi

echo "[wheel_build] Copying console/dist/* -> src/qwenpaw/console/..."
rm -rf "$CONSOLE_DEST"/*

mkdir -p "$CONSOLE_DEST"
cp -R "$CONSOLE_DIR/dist/"* "$CONSOLE_DEST/"

echo "[wheel_build] Building wheel + sdist..."
python3 -m pip install --quiet build
rm -rf dist/*
python3 -m build --outdir dist .

echo "[wheel_build] Done. Wheel(s) in: $REPO_ROOT/dist/"
