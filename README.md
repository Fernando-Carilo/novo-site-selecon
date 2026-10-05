# Portal Integrado do Instituto Selecon

Monorepo do novo portal institucional e transacional do Instituto Selecon, unificando
portal público, concursos, atendimento omnichannel, canal de denúncias e área
administrativa.

> Consulte `docs/PROMPT-MESTRE-CLAUDE-NOVO-SITE-SELECON.md` para a especificação completa
> e `docs/IMPLEMENTATION_PLAN.md` para o estado atual do projeto e o plano de fases.

## Estrutura

```text
apps/
  web/       Next.js (App Router) — portal público, candidato, administração
  api/       NestJS + Fastify — API REST modular, OpenAPI
  worker/    Jobs assíncronos (BullMQ) e adapters de integração
packages/
  ui/            Design system compartilhado
  db/            Prisma schema, migrations, seeds
  contracts/     Schemas Zod e tipos compartilhados
  auth/          RBAC/ABAC — roles, permissions, policies
  integrations/  Interfaces + mocks de integrações externas
  observability/ Logger estruturado + bootstrap OpenTelemetry
  config/        tsconfig base, eslint config, validação de env
infra/           Infraestrutura como código (referência, sem provisionamento real)
docs/            Documentação de arquitetura, decisões, segurança, migração, operação
```

## Como rodar localmente

Pré-requisitos: Node.js 22.x, pnpm 10.x, Docker.

```bash
corepack enable
pnpm install
cp .env.example .env
docker compose up -d db redis
pnpm --filter @selecon/db exec prisma migrate dev
pnpm --filter @selecon/db exec prisma db seed
pnpm dev
```

- `apps/web` em http://localhost:3000
- `apps/api` em http://localhost:3001 (OpenAPI em `/docs`, health em `/health/live` e `/health/ready`)

## Scripts principais

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Scripts do portal (`apps/web`)

```bash
pnpm --filter @selecon/web dev            # servidor de desenvolvimento
pnpm --filter @selecon/web test           # testes do provider de conteúdo e formatadores
pnpm --filter @selecon/web inventory      # regenera docs/migration/content-inventory.csv
pnpm --filter @selecon/web links:check    # valida links internos/âncoras (com o servidor no ar)
```

## Status do projeto

**Portal público (Fase 2 + páginas de concursos da Fase 3) entregue com conteúdo real** migrado do
site atual: home, catálogo e página do edital, institucional, serviços, notícias, transparência,
integridade, atendimento/Fale Conosco, área do candidato e área comercial. Publicações, notícias e
filas de atendimento/comercial são integradas à **Central de Serviços Selecon** por contrato
(`docs/CENTRAL_DE_SERVICOS.md`), com dataset estático como carga inicial.

Nenhuma integração externa real (Microsoft Graph, WhatsApp Cloud API, sistema do candidato,
Central de Serviços) foi exercitada contra ambiente real — todas usam adapters com mock documentado.
Nenhuma infraestrutura AWS foi provisionada. Detalhes em `docs/IMPLEMENTATION_PLAN.md` e
`docs/ASSUMPTIONS.md`.
