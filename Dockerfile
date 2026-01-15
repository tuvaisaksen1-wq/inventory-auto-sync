FROM node:20-slim

# Install system deps
RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Copy package files first
COPY package.json package-lock.json* ./

RUN echo "RAILWAY_CACHE_BUST=2026-01-15-1"

RUN rm -f package-lock.json \
  && npm install --include=optional --no-audit --no-fund \
  && npm cache clean --force

# Copy app files
COPY . .

# Build
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "docker-start"]
