# Portal Integrado do Instituto Selecon

Monorepo do portal institucional e transacional do Instituto Selecon, unificando portal
público, concursos, atendimento omnichannel, canal de denúncias, anúncios e área
administrativa.

> Consulte `docs/PROMPT-MESTRE-CLAUDE-NOVO-SITE-SELECON.md` para a especificação completa,
> `docs/IMPLEMENTATION_PLAN.md` para o estado do projeto e `docs/TEST_REPORT.md` para os
> resultados reais de validação (lint/typecheck/test/build/E2E) de cada fase.

## Estrutura

```text
apps/
  web/       Next.js (App Router) — portal público, área do candidato, administração
  api/       NestJS + Fastify — API REST modular, OpenAPI
  worker/    Jobs assíncronos (BullMQ) e adapters de integração
packages/
  ui/            Design system compartilhado (tokens + componentes)
  db/            Prisma schema, migrations, seeds
  contracts/     Schemas Zod e tipos compartilhados
  auth/          RBAC/ABAC — roles, permissions, policies
  integrations/  Interfaces + mocks de integrações externas
  observability/ Logger estruturado + bootstrap OpenTelemetry
  config/        tsconfig base, eslint config, validação de env
e2e/             Suíte Playwright de ponta a ponta (fora do workspace pnpm)
infrastructure/  Templates CloudFormation (RDS, pipeline) para o Elastic Beanstalk
docs/            Arquitetura, decisões (ADR), segurança, migração, operação, testes
```

## Rotas

**Público:** `/`, `/concursos`, `/concursos/[slug]`, `/noticias`, `/noticias/[slug]`,
`/institucional/[slug]`, `/atendimento`, `/atendimento/consultar`, `/denuncias`,
`/denuncias/consultar`, `/area-do-candidato`, `/politica-de-privacidade`, `/termos-de-uso`.

**Administrativo** (autenticado, RBAC): `/admin`, `/admin/concursos`, `/admin/conteudo`,
`/admin/noticias`, `/admin/atendimento`, `/admin/denuncias`, `/admin/anuncios`,
`/admin/usuarios`, `/admin/perfis`, `/admin/auditoria`, `/admin/configuracoes`.

## Como rodar localmente

Pré-requisitos: Node.js 22.x, pnpm 10.x, Docker (ou Postgres/Redis nativos).

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

### E2E (Playwright)

```bash
pnpm --filter @selecon/api seed:e2e   # normaliza a senha dos usuários de demonstração
cd e2e && pnpm install --ignore-workspace
npx playwright test --project=desktop-chromium
npx playwright test --project=mobile-chromium
```

## Scripts principais

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Infraestrutura e implantação na AWS

Arquitetura de implantação: `GitHub -> AWS CodePipeline -> AWS CodeBuild -> AWS Elastic
Beanstalk (Docker, container único)` — o mesmo padrão usado nos outros projetos do
Instituto Selecon. **A arquitetura anterior (ECS Fargate + AWS CDK) foi abandonada** — ver
`docs/ASSUMPTIONS.md`. O código de infraestrutura (`infrastructure/cloudformation`, CloudFormation
puro) está pronto e validado localmente (`cfn-lint`), sem credenciais reais neste sandbox —
nenhum recurso AWS foi provisionado por esta sessão.

**Bootstrap único** (um operador humano, uma vez, com credenciais reais, nesta ordem —
cada script mostra o plano de mudanças e pede confirmação explícita):

```bash
scripts/bootstrap-rds-dev.sh              # RDS PostgreSQL + security groups
scripts/bootstrap-elasticbeanstalk-dev.sh # Application + Environment do Elastic Beanstalk
scripts/bootstrap-codepipeline-eb-dev.sh  # ECR + CodeBuild + CodePipeline
```

A partir daí, o fluxo normal é apenas `git push origin feat/fase-1-design-system` — a
pipeline builda, testa, publica a imagem Docker (web+api no mesmo container — ver
`Dockerfile`/`docker/entrypoint.sh`) e implanta automaticamente. Detalhes completos em
`docs/OPERATIONS_RUNBOOK.md` e `docs/ARCHITECTURE.md`.

```bash
scripts/check-aws-dev.sh   # somente leitura — inventário do ambiente
scripts/rollback-eb-dev.sh # reverte o Elastic Beanstalk para a versão anterior
```

## Status do projeto

Todas as fases funcionais (portal público, concursos, atendimento, denúncias, anúncios, CMS,
área administrativa) estão implementadas e validadas localmente: lint, typecheck, testes de
unidade/integração e a suíte E2E (Playwright, 22 fluxos, desktop + mobile) passam de ponta a
ponta contra Postgres/Redis reais. Nenhuma integração externa real (Microsoft Graph, WhatsApp
Cloud API, sistema do candidato) está habilitada — todas usam implementações mock documentadas
em `docs/INTEGRATIONS.md`. Nenhuma infraestrutura AWS foi provisionada por esta sessão. Detalhes
completos em `docs/IMPLEMENTATION_PLAN.md`, `docs/TEST_REPORT.md` e `docs/ASSUMPTIONS.md`.
