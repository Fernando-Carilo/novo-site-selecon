# syntax=docker/dockerfile:1
#
# Container único do Portal Selecon para o ambiente Elastic Beanstalk (Docker rodando
# em 64bit Amazon Linux 2023) — substitui a arquitetura anterior de 3 imagens/serviços
# ECS Fargate (web/api/worker) como caminho de implantação em AWS DEV. Builda apps/web
# (Next.js, output "standalone") e apps/api (NestJS + Fastify) no mesmo processo de
# build e os empacota lado a lado na mesma imagem final — ver docker/entrypoint.sh
# para como os dois processos sobem juntos.
#
# apps/worker (BullMQ) fica FORA desta imagem/deste ambiente DEV: nenhuma fila
# assíncrona real é processada em produção ainda, e não há ElastiCache provisionado
# para esta arquitetura (ver docs/ASSUMPTIONS.md). apps/api DEPENDE de Redis apenas
# para (a) satisfazer REDIS_URL, obrigatório no schema de env de packages/config, e
# (b) o próprio health check (HealthService.readiness()) — nenhuma outra rota usa
# ioredis/BullMQ. Por isso este container roda um `redis-server` local, efêmero, sem
# persistência (--save "" --appendonly no).
#
# PROIBIDO EM HML/PRD: este Redis local é uma solução SOMENTE PARA DEV. Se qualquer
# funcionalidade real passar a depender de Redis de verdade (cache compartilhado entre
# instâncias, filas do worker, sessões), a promoção para HML/PRD exige substituir isso
# por um ElastiCache gerenciado antes do primeiro deploy naqueles ambientes — nunca
# reaproveitar este redis-server local fora de DEV.
#
# Os Dockerfiles antigos (apps/web/Dockerfile, apps/api/Dockerfile,
# apps/worker/Dockerfile) continuam existindo, mas só para desenvolvimento/teste local
# (pnpm docker:build, pnpm docker:test) — não são mais usados por nenhuma pipeline AWS.
#
# Contexto de build: raiz do monorepo.
#   docker build -f Dockerfile -t selecon-portal-app:dev .
#
# Imagem base publicada no Amazon ECR Public Gallery (mirror oficial da Docker
# Official Image "node"), não no Docker Hub — evita o rate limit de pulls anônimos do
# Docker Hub (HTTP 429 "Too Many Requests" em HEAD/pull de manifest), que já derrubou
# o estágio Build do CodeBuild. Todas as stages abaixo derivam de "base" — nenhuma
# outra imagem é puxada do Docker Hub em nenhum estágio (apk add usa os repositórios
# do próprio Alpine, não o Docker Hub).
#
# Sem "--platform=linux/amd64": tanto o runner do CodeBuild quanto a instância EC2 do
# Elastic Beanstalk (t3.micro) já são amd64 nativamente — fixar a plataforma força o
# BuildKit a tratar isso como cross-platform mesmo quando não é, o que o próprio
# BuildKit sinaliza como redundante ("FromPlatformFlagConstDisallowed"). Removido por
# ser desnecessário aqui, não por ter causado a falha do build.
FROM public.ecr.aws/docker/library/node:22-alpine AS base
RUN corepack enable

# ---- Stage 1: poda do monorepo para apenas o que web+api precisam ----
FROM base AS pruner
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY . .
RUN npx turbo prune @selecon/web @selecon/api --docker

# ---- Stage 2: instala dependências, gera Prisma Client, builda os dois apps ----
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
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm turbo run build --filter=@selecon/web... --filter=@selecon/api...
# apps/web ainda não tem ativos estáticos versionados em public/ — garante que o
# diretório exista de qualquer forma, senão o COPY do estágio "runner" abaixo falha.
RUN mkdir -p apps/web/public
# node_modules de produção autocontido do apps/api (sem symlinks para fora da imagem),
# igual à estratégia já usada em apps/api/Dockerfile.
RUN pnpm --filter=@selecon/api deploy --prod --legacy /app/deploy-api
# Copia o prisma CLI para um caminho fixo (pnpm store usa paths com hashes).
RUN cp -r $(find /app/node_modules/.pnpm -path "*/prisma/build" -type d | head -1)/.. /app/prisma-cli

# ---- Stage 3: imagem final — web (standalone) + api (deploy de produção) + redis ----
FROM base AS runner
WORKDIR /app
RUN apk add --no-cache openssl bash redis
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV API_PORT=3001
ENV API_INTERNAL_URL=http://127.0.0.1:3001/api
ENV REDIS_URL=redis://127.0.0.1:6379

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 selecon

# apps/web (output standalone) na raiz de /app — mesmo layout de apps/web/Dockerfile.
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=selecon:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=selecon:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# apps/api (pnpm deploy --prod) num subdiretório próprio, para não colidir com o
# node_modules do web copiado acima.
COPY --from=builder --chown=selecon:nodejs /app/deploy-api ./apps/api-deploy
# `prisma migrate deploy` (rodado no entrypoint, antes da API subir) precisa do
# schema.prisma + migrations/ num caminho previsível.
COPY --from=builder --chown=selecon:nodejs /app/packages/db/prisma ./apps/api-deploy/packages/db/prisma
# Copia o prisma CLI da fase de build. No layout pnpm, o binário fica dentro do
# store .pnpm — usamos glob find na fase builder para copiar para um path fixo.
COPY --from=builder --chown=selecon:nodejs /app/prisma-cli ./apps/api-deploy/node_modules/prisma

COPY --chown=selecon:nodejs docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER selecon
EXPOSE 3000

# Verifica a rota pública de ponta a ponta (passa pelo proxy do web até a api real),
# não só a api isolada — mesmo caminho que um cliente/EB real usaria.
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["./entrypoint.sh"]
