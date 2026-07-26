# syntax=docker/dockerfile:1
#
# Build de produção de apps/worker (BullMQ, sem porta HTTP exposta).
# Contexto de build: raiz do monorepo.
#   docker build -f apps/worker/Dockerfile -t selecon-portal-worker:dev .

FROM --platform=linux/amd64 node:22-alpine AS base
RUN corepack enable

# ---- Stage 1: poda do monorepo para apenas o que apps/worker precisa ----
FROM base AS pruner
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY . .
RUN npx turbo prune @selecon/worker --docker

# ---- Stage 2: instala, gera Prisma Client, builda e empacota produção ----
FROM base AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# packages/db tem um script "postinstall" que roda `prisma generate` — copiamos o
# schema antes do install para que ele encontre o arquivo (out/json só tem manifests).
COPY --from=pruner /app/out/full/packages/db/prisma ./packages/db/prisma
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=@selecon/worker...
RUN pnpm --filter=@selecon/worker deploy --prod --legacy /app/deploy

# ---- Stage 3: imagem final mínima, apenas o output de produção ----
FROM base AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 selecon

COPY --from=builder --chown=selecon:nodejs /app/deploy ./

USER selecon

# Sem EXPOSE: o worker não recebe tráfego HTTP; readiness é reportada nos logs
# estruturados (ver apps/worker/src/main.ts) e consumida via CloudWatch Logs Insights.
# Node encaminha SIGTERM ao handler registrado em main.ts (fechamento gracioso do
# BullMQ Worker antes de sair).
CMD ["node", "dist/main.js"]
