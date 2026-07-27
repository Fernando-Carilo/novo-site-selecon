# syntax=docker/dockerfile:1
#
# Build de produção de apps/api (NestJS + Fastify).
# Contexto de build: raiz do monorepo.
#   docker build -f apps/api/Dockerfile -t selecon-portal-api:dev .
#
# Estratégia: `turbo prune` para um contexto de build mínimo, build real com
# devDependencies, e `pnpm deploy --legacy` para produzir um node_modules de
# produção autocontido (sem symlinks para fora da imagem). Uso local apenas (pnpm
# docker:build/docker:test) — a pipeline AWS usa o Dockerfile na raiz do repositório.
#
# Imagem base do Amazon ECR Public Gallery (mirror da Docker Official Image "node"),
# não do Docker Hub — evita rate limit de pulls anônimos (HTTP 429).

FROM --platform=linux/amd64 public.ecr.aws/docker/library/node:22-alpine AS base
RUN corepack enable

# ---- Stage 1: poda do monorepo para apenas o que apps/api precisa ----
FROM base AS pruner
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY . .
RUN npx turbo prune @selecon/api --docker

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
RUN pnpm turbo run build --filter=@selecon/api...
RUN pnpm --filter=@selecon/api deploy --prod --legacy /app/deploy

# ---- Stage 3: imagem final mínima, apenas o output de produção ----
FROM base AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
ENV API_PORT=3001

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 selecon

COPY --from=builder --chown=selecon:nodejs /app/deploy ./
# `prisma migrate deploy` (rodado como task avulsa — ver
# apps/api/src/scripts/run-migrations.ts) precisa do schema.prisma + migrations/ em um
# caminho previsível; copiado explicitamente do estágio builder em vez de depender do
# que `pnpm deploy --prod` decide empacotar por padrão.
COPY --from=builder --chown=selecon:nodejs /app/packages/db/prisma ./packages/db/prisma

USER selecon
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3001/api/health/live', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# NestJS/Fastify já encerra graciosamente em SIGTERM (app.close() via hooks padrão).
CMD ["node", "dist/main.js"]
