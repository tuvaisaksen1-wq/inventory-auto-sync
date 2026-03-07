#!/usr/bin/env bash
set -euo pipefail

pattern='^(<<<<<<<|=======|>>>>>>>)|^@@ '

if command -v rg >/dev/null 2>&1; then
  if rg -n "$pattern" app Dockerfile package.json package-lock.json shopify.app.toml shopify.web.toml; then
    echo 'Merge/diff markers found'
    exit 1
  fi
else
  if find app -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 \
    | xargs -0 grep -nE "$pattern"; then
    echo 'Merge/diff markers found'
    exit 1
  fi

  if grep -nE "$pattern" Dockerfile package.json package-lock.json shopify.app.toml shopify.web.toml; then
    echo 'Merge/diff markers found'
    exit 1
  fi
fi

# Guard against partially resolved conflict labels left in Dockerfile
if grep -nE '^\s*(codex\/|main\s*$)' Dockerfile; then
  echo 'Potential unresolved merge labels found in Dockerfile'
  exit 1
fi

# Guard against partially resolved conflict labels left in routes.ts
if grep -nE '^\s*(codex\/|main\s*$)' app/routes.ts; then
  echo 'Potential unresolved merge labels found in app/routes.ts'
  exit 1
fi


node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"

if [ -f package-lock.json ]; then
  node -e "JSON.parse(require('fs').readFileSync('package-lock.json','utf8'))"
fi

echo 'No merge markers found'
