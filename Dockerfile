# ---------- Builder ----------
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies (including dev + optional)
COPY package.json package-lock.json ./
RUN npm ci --include=optional

# Copy source and build
COPY . .
RUN npm run build

# ---------- Runner ----------
FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

# Install only production deps (still include optional)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --include=optional && npm cache clean --force

# Copy built app + required runtime files
COPY --from=builder /app/build ./build
COPY --from=builder /app/app ./app
COPY --from=builder /app/prisma ./prisma

# If you rely on other runtime files, uncomment:
# COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "docker-start"]
