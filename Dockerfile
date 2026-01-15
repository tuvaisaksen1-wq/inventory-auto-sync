FROM node:20-slim

# Install system deps
RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Copy package files first
COPY package.json package-lock.json* ./

# IMPORTANT:
# npm ci + lockfile made on Mac can break optional Linux deps (Rollup native)
# Fix: remove lockfile and install fresh on Linux image
RUN rm -f package-lock.json \
  && npm install --include=optional --no-audit --no-fund \
  && npm cache clean --force

# Copy app files
COPY . .

# Build
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "docker-start"]
