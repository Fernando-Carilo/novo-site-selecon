# syntax=docker/dockerfile:1
#
# Build de produção de apps/web (Next.js, output "standalone").
# Contexto de build: raiz do monorepo.
#   docker build -f apps/web/Dockerfile -t selecon-portal-web:dev .
#
# Multi-stage com `turbo prune` para copiar apenas o subconjunto do monorepo
# necessário para apps/web, mantendo cache de camadas eficiente e a imagem final
# pequena. Compatível com ECS Fargate (linux/amd64).

FROM --platform=linux/amd64 node:22-alpine AS base
RUN corepack enable

# ---- Stage 1: poda do monorepo para apenas o que apps/web precisa ----
FROM base AS pruner
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY . .
RUN npx turbo prune @selecon/web --docker

# ---- Stage 2: instala dependências (lockfile podado) e builda ----
FROM base AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm turbo run build --filter=@selecon/web...
# apps/web ainda não tem ativos estáticos versionados em public/ (nenhum arquivo,
# só rotas do App Router) — garante que o diretório exista de qualquer forma, senão
# o COPY --from=builder do estágio "runner" abaixo falha com "not found".
RUN mkdir -p apps/web/public

# ---- Stage 3: imagem final mínima, apenas o output standalone ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/', (r) => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

# server.js do output standalone já trata SIGTERM/SIGINT graciosamente (padrão Next.js).
CMD ["node", "apps/web/server.js"]
