FROM node:20-slim
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./

RUN npm install -g npm@latest \
  && npm ci --include=optional \
  && npm cache clean --force

COPY . .

RUN npm run build

CMD ["npm", "run", "docker-start"]
