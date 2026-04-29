# --- Estágio 1: Build ---
FROM node:24-alpine AS builder
WORKDIR /src
COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npm run db:generate

COPY . .

RUN npm run build

# --- Estágio 2: Produção ---
FROM node:24-alpine
WORKDIR /src

COPY --from=builder /src/package*.json ./
RUN npm install --only=production
COPY --from=builder /src/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /src/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /src/dist ./dist

USER node

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
