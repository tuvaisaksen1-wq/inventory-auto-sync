#!/usr/bin/env bash
set -euo pipefail

pattern='^(<<<<<<<|=======|>>>>>>>)|^@@ '

if command -v rg >/dev/null 2>&1; then
  if rg -n "$pattern" app shopify.app.toml shopify.web.toml; then
    echo 'Merge/diff markers found'
    exit 1
  fi
else
  if find app -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 \
    | xargs -0 grep -nE "$pattern"; then
    echo 'Merge/diff markers found'
    exit 1
  fi

  if grep -nE "$pattern" shopify.app.toml shopify.web.toml; then
    echo 'Merge/diff markers found'
    exit 1
  fi
fi

# Guard against partially resolved conflict labels left in routes.ts
if grep -nE '^\s*(codex\/|main\s*$)' app/routes.ts; then
  echo 'Potential unresolved merge labels found in app/routes.ts'
  exit 1
fi

echo 'No merge markers found'
