# ----------------------------
# Builder stage (build app)
# ----------------------------
FROM node:20-slim AS builder

RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NPM_CONFIG_OPTIONAL=true
ENV NPM_CONFIG_INCLUDE=optional

# Change this number when you want to force a full reinstall
ARG CACHEBUST=4
RUN echo "cachebust=$CACHEBUST"

# 1) Copy package files FIRST (this is critical for caching correctness)
COPY package.json package-lock.json ./

# 2) Install deps (dev + optional) without relying on lockfile optional entries
RUN rm -rf node_modules package-lock.json \
  && npm install --include=optional --no-audit --no-fund \
  && npm install --no-save @rollup/rollup-linux-x64-gnu@4.54.0

# 3) Copy source AFTER deps
COPY . .

# 4) Build (force JS fallback to avoid missing native rollup binary)
ENV ROLLUP_SKIP_NODE_JS_NATIVE=1
RUN npm run build


# ----------------------------
# Runner stage (run app)
# ----------------------------
FROM node:20-slim AS runner

RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN rm -rf node_modules package-lock.json \
  && npm install --omit=dev --include=optional --no-audit --no-fund \
  && npm cache clean --force

COPY --from=builder /app/build ./build
COPY --from=builder /app/app ./app
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "docker-start"]
