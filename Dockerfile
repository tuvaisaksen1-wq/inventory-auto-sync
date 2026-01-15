# ---------- BUILDER ----------
FROM node:20-slim AS builder

RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Viktig: ikke sett NODE_ENV=production her (vi trenger dev deps i build)
COPY package.json package-lock.json* ./

# Installer deps
# Bruk npm install (ikke npm ci) + optional
RUN npm install --include=optional --no-audit --no-fund

# HARD FIX: installer rollup sin linux-gnu native pakke eksplisitt
# Dette omgår npm/optional-buggen i containere
RUN npm install --no-save @rollup/rollup-linux-x64-gnu --no-audit --no-fund \
  && npm rebuild rollup

COPY . .

RUN npm run build


# ---------- RUNNER ----------
FROM node:20-slim AS runner

RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./

# Kun prod deps i runtime
RUN npm install --omit=dev --no-audit --no-fund \
  && npm cache clean --force

COPY . .
COPY --from=builder /app/build ./build

EXPOSE 3000
CMD ["npm", "run", "docker-start"]
