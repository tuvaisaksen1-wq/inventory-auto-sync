#!/usr/bin/env bash
set -euo pipefail

pattern='^(<<<<<<<|=======|>>>>>>>)|^@@ '

scan_with_rg() {
  rg -n "$pattern" app Dockerfile package.json package-lock.json shopify.app.toml shopify.app.local.toml shopify.web.toml
}

scan_with_grep() {
  find app -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | xargs -0 grep -nE "$pattern"
  grep -nE "$pattern" Dockerfile package.json package-lock.json shopify.app.toml shopify.app.local.toml shopify.web.toml
}

if command -v rg >/dev/null 2>&1; then
  if scan_with_rg; then
    echo 'Merge/diff markers found'
    exit 1
  fi
else
  if scan_with_grep; then
    echo 'Merge/diff markers found'
    exit 1
  fi
fi

# Guard against partially resolved conflict labels left in key files.
if grep -nE '^\s*(codex\/|main\s*$)' Dockerfile app/routes.ts package.json; then
  echo 'Potential unresolved merge labels found'
  exit 1
fi

node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"

if [ -f package-lock.json ]; then
  node -e "JSON.parse(require('fs').readFileSync('package-lock.json','utf8'))"
fi

echo 'No merge markers found'
