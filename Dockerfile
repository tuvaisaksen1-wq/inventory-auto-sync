# ----------------------------
# Builder stage (build app)
# ----------------------------
FROM node:20-slim AS builder

RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cache bust to force reinstall on Railway when needed
ARG CACHEBUST=1
RUN echo "cachebust=$CACHEBUST"

# Install deps in a way that avoids npm optional-deps bug for Rollup
COPY package.json package-lock.json ./
RUN rm -rf node_modules \
  && npm install --include=optional --no-audit --no-fund \
  && npm rebuild rollup

# Copy source + build
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

# Install only production dependencies (still include optional)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --include=optional --no-audit --no-fund \
  && npm cache clean --force

# Copy build output + runtime files
COPY --from=builder /app/build ./build
COPY --from=builder /app/app ./app
COPY --from=builder /app/prisma ./prisma

# If you serve static assets from /public at runtime, keep this:
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "docker-start"]
