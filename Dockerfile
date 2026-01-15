# ---------- 1) BUILDER (build med devDependencies) ----------
FROM node:20-slim AS builder

# System deps
RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Kopier kun package-filer først (bedre cache)
COPY package.json package-lock.json* ./

# Viktig:
# - Ikke sett NODE_ENV=production her (da blir devDeps droppet)
# - Mac lockfile kan gi trøbbel med optional deps på Linux i noen npm/rollup-caser
#   Vi installerer med optional, og bygger i denne stage.
RUN npm install --include=optional --no-audit --no-fund

# Kopier resten av koden
COPY . .

# Bygg
RUN npm run build


# ---------- 2) RUNNER (kun runtime deps) ----------
FROM node:20-slim AS runner

RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

# Kopier package-filer
COPY package.json package-lock.json* ./

# Installer kun prod-deps (rollup/tailwind trengs ikke i runtime)
RUN npm install --omit=dev --no-audit --no-fund \
  && npm cache clean --force

# Kopier app-koden (for prisma/schema, osv.)
COPY . .

# Kopier ferdig build fra builder
COPY --from=builder /app/build ./build

EXPOSE 3000
CMD ["npm", "run", "docker-start"]
