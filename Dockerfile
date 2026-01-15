# ----------------------------
# Builder stage (build app)
# ----------------------------
FROM node:20-slim AS builder

RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Force fresh dependency resolution on Linux (avoid macOS lockfile issues)
ARG CACHEBUST=1
RUN echo "cachebust=$CACHEBUST"

COPY package.json package-lock.json ./

# IMPORTANT: remove lockfile in builder so Linux optional deps (rollup native) are installed
RUN rm -f package-lock.json \
  && rm -rf node_modules \
  && npm install --include=optional --no-audit --no-fund \
  && npm rebuild rollup

COPY . .
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

# Runtime deps should stay deterministic
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --include=optional --no-audit --no-fund \
  && npm cache clean --force

# Copy build output + runtime files
COPY --from=builder /app/build ./build
COPY --from=builder /app/app ./app
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "docker-start"]
