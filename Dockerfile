# ---------- BUILDER ----------
FROM node:20-slim AS builder

RUN apt-get update \
  && apt-get install -y openssl curl postgresql-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./

# Fail fast on unresolved merge markers / invalid JSON before npm install.
codex/fix-oauth-and-installation-flow-in-shopify-app-2hkwvn
RUN bash -lc "! grep -nE '^(<<<<<<<|=======|>>>>>>>)|^@@ ' package.json package-lock.json* && node -e \"JSON.parse(require('fs').readFileSync('package.json','utf8'))\" && if [ -f package-lock.json ]; then node -e \"JSON.parse(require('fs').readFileSync('package-lock.json','utf8'))\"; fi"
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-dl5ye1
RUN bash -lc "! grep -nE '^(<<<<<<<|=======|>>>>>>>)|^@@ ' package.json package-lock.json* && node -e \"JSON.parse(require('fs').readFileSync('package.json','utf8'))\" && if [ -f package-lock.json ]; then node -e \"JSON.parse(require('fs').readFileSync('package-lock.json','utf8'))\"; fi"
=======
RUN ! grep -nE '^(<<<<<<<|=======|>>>>>>>)|^@@ ' package.json package-lock.json* \
codex/fix-oauth-and-installation-flow-in-shopify-app-rm1c91
  && node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))" \
  && if [ -f package-lock.json ]; then node -e "JSON.parse(require('fs').readFileSync('package-lock.json','utf8'))"; fi
=======
  && node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"
main

RUN npm install --include=optional --no-audit --no-fund

RUN npm install --no-save @rollup/rollup-linux-x64-gnu lightningcss --no-audit --no-fund \
  && npm rebuild rollup \
  && npm rebuild lightningcss

COPY . .

ENV ROLLUP_DISABLE_NATIVE=1
ENV LIGHTNINGCSS_DISABLE_NATIVE=1

RUN npm run build


# ---------- RUNNER ----------
FROM node:20-slim AS runner

RUN apt-get update \
  && apt-get install -y openssl curl postgresql-client \
  && rm -rf /var/lib/apt/lists/*
  
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./

# Fail fast on unresolved merge markers / invalid JSON before npm install.
codex/fix-oauth-and-installation-flow-in-shopify-app-2hkwvn
RUN bash -lc "! grep -nE '^(<<<<<<<|=======|>>>>>>>)|^@@ ' package.json package-lock.json* && node -e \"JSON.parse(require('fs').readFileSync('package.json','utf8'))\" && if [ -f package-lock.json ]; then node -e \"JSON.parse(require('fs').readFileSync('package-lock.json','utf8'))\"; fi"
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-dl5ye1
RUN bash -lc "! grep -nE '^(<<<<<<<|=======|>>>>>>>)|^@@ ' package.json package-lock.json* && node -e \"JSON.parse(require('fs').readFileSync('package.json','utf8'))\" && if [ -f package-lock.json ]; then node -e \"JSON.parse(require('fs').readFileSync('package-lock.json','utf8'))\"; fi"
=======
RUN ! grep -nE '^(<<<<<<<|=======|>>>>>>>)|^@@ ' package.json package-lock.json* \
codex/fix-oauth-and-installation-flow-in-shopify-app-rm1c91
  && node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))" \
  && if [ -f package-lock.json ]; then node -e "JSON.parse(require('fs').readFileSync('package-lock.json','utf8'))"; fi
=======
  && node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"
main
main
main

RUN npm install --omit=dev --no-audit --no-fund \
  && npm cache clean --force

COPY . .

RUN npx prisma generate

COPY --from=builder /app/build ./build

EXPOSE 3000
CMD ["npm", "run", "docker-start"]
