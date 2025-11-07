# backend/Dockerfile (recomendado)
FROM node:24-bullseye-slim AS builder
WORKDIR /app

# Habilitar corepack y pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar package.json y lockfile (mejor cache)
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml .

# Instalar todas las dependencias (dev + prod) y hoist para evitar issues
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Build del proyecto (usa tu script "build" de package.json)
RUN pnpm build

# ======================
# Stage: production
# ======================
FROM node:24-bullseye-slim AS production
WORKDIR /app

# Copiar sólo lo necesario desde builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
