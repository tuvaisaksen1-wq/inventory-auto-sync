#!/usr/bin/env bash
set -euo pipefail

pattern='^(<<<<<<<|=======|>>>>>>>)|^@@ '

if command -v rg >/dev/null 2>&1; then
codex/fix-oauth-and-installation-flow-in-shopify-app-2hkwvn
  if rg -n "$pattern" app Dockerfile package.json package-lock.json shopify.app.toml shopify.web.toml; then
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-dl5ye1
  if rg -n "$pattern" app package.json package-lock.json shopify.app.toml shopify.web.toml; then
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-rm1c91
  if rg -n "$pattern" app package.json package-lock.json shopify.app.toml shopify.web.toml; then
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-wljg7q
  if rg -n "$pattern" app package.json package-lock.json shopify.app.toml shopify.web.toml; then
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-34dsd9
  if rg -n "$pattern" app package.json package-lock.json shopify.app.toml shopify.web.toml; then
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-e35z65
  if rg -n "$pattern" app package.json package-lock.json shopify.app.toml shopify.web.toml; then

  if rg -n "$pattern" app shopify.app.toml shopify.web.toml; then
main
main
main
main
main
main
    echo 'Merge/diff markers found'
    exit 1
  fi
else
  if find app -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 \
    | xargs -0 grep -nE "$pattern"; then
    echo 'Merge/diff markers found'
    exit 1
  fi

codex/fix-oauth-and-installation-flow-in-shopify-app-2hkwvn
  if grep -nE "$pattern" Dockerfile package.json package-lock.json shopify.app.toml shopify.web.toml; then
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-dl5ye1
  if grep -nE "$pattern" package.json package-lock.json shopify.app.toml shopify.web.toml; then
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-rm1c91
  if grep -nE "$pattern" package.json package-lock.json shopify.app.toml shopify.web.toml; then
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-wljg7q
  if grep -nE "$pattern" package.json package-lock.json shopify.app.toml shopify.web.toml; then
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-34dsd9
  if grep -nE "$pattern" package.json package-lock.json shopify.app.toml shopify.web.toml; then
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-e35z65
  if grep -nE "$pattern" package.json package-lock.json shopify.app.toml shopify.web.toml; then

  if grep -nE "$pattern" shopify.app.toml shopify.web.toml; then
main
main
main
    echo 'Merge/diff markers found'
    exit 1
  fi
fi

codex/fix-oauth-and-installation-flow-in-shopify-app-2hkwvn
# Guard against partially resolved conflict labels left in Dockerfile
if grep -nE '^\s*(codex\/|main\s*$)' Dockerfile; then
  echo 'Potential unresolved merge labels found in Dockerfile'
  exit 1
fi

=======
main
# Guard against partially resolved conflict labels left in routes.ts
if grep -nE '^\s*(codex\/|main\s*$)' app/routes.ts; then
  echo 'Potential unresolved merge labels found in app/routes.ts'
  exit 1
fi

codex/fix-oauth-and-installation-flow-in-shopify-app-2hkwvn
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-dl5ye1
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-rm1c91
main
main

node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"

if [ -f package-lock.json ]; then
  node -e "JSON.parse(require('fs').readFileSync('package-lock.json','utf8'))"
fi

codex/fix-oauth-and-installation-flow-in-shopify-app-2hkwvn
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-dl5ye1
=======
=======
main
main
main
echo 'No merge markers found'
