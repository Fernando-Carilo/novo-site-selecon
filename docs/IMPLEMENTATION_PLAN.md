# Plano de Implementação — Portal Integrado Selecon

> Referência: `docs/PROMPT-MESTRE-CLAUDE-NOVO-SITE-SELECON.md` (seções 17 e 21).
> Este documento é vivo: deve ser atualizado ao final de cada fase com o que foi
> efetivamente entregue, testado e o que ficou pendente.

## Estado do repositório no início do trabalho

- Repositório `novo-site-selecon` estava **vazio** (zero commits) no branch
  `claude/new-session-e7n8z6`.
- Nenhum código, `package.json`, README ou histórico prévio existia.
- O protótipo visual `selecon-portal-v2.html` **não foi enviado** junto com os demais
  anexos desta sessão (ver `docs/ASSUMPTIONS.md`, item 1). Isso bloqueia fidelidade visual
  total na Fase 1, mas não bloqueia a Fase 0.

## Estrutura de monorepo adotada

```text
novo-site-selecon/
├─ apps/
│  ├─ web/                 # Next.js (App Router) — portal público, candidato, admin
│  ├─ api/                 # NestJS + Fastify — API modular, OpenAPI
│  └─ worker/               # Jobs assíncronos (BullMQ), adapters de integração
├─ packages/
│  ├─ ui/                   # Design system (tokens + componentes) compartilhado
│  ├─ db/                   # Prisma schema, migrations, seeds, repositories
│  ├─ contracts/             # Zod schemas / DTOs / tipos de evento compartilhados
│  ├─ auth/                  # RBAC/ABAC: roles, permissions, policies
│  ├─ integrations/           # Interfaces + mocks: CandidateProvider, EmailProvider, MessagingProvider, Storage
│  ├─ observability/           # Logger estruturado + bootstrap OpenTelemetry
│  └─ config/                 # tsconfig base, eslint config, validação de env (Zod)
├─ infra/                    # IaC (Terraform) — apenas código de referência, sem apply
├─ docs/
├─ .github/workflows/
├─ docker-compose.yml
└─ pnpm-workspace.yaml
```

Justificativas técnicas detalhadas estão registradas em `docs/DECISIONS/` (ADRs).

## Fases (visão geral)

| Fase | Escopo                                                              | Status                                                                                   |
| ---- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 0    | Descoberta e fundação (monorepo, tooling, CI, docker-compose, docs) | **Em execução nesta sessão**                                                             |
| 1    | Design system e shells (público/admin), RBAC inicial, Storybook     | Bloqueada parcialmente: aguarda `selecon-portal-v2.html` para fidelidade visual completa |
| 2    | CMS e portal institucional                                          | Não iniciada                                                                             |
| 3    | Concursos e página do edital                                        | Não iniciada                                                                             |
| 4    | Área do candidato e adapters                                        | Não iniciada                                                                             |
| 5    | Atendimento omnichannel                                             | Não iniciada                                                                             |
| 6    | Canal de denúncias                                                  | Não iniciada                                                                             |
| 7    | Anúncios e governança comercial                                     | Não iniciada                                                                             |
| 8    | Segurança, performance e operação                                   | Não iniciada                                                                             |
| 9    | Migração e go-live                                                  | Não iniciada                                                                             |

Cada fase subsequente exige uma sessão de trabalho dedicada (o escopo total descrito no
prompt mestre — omnichannel completo, canal de denúncias segregado, anúncios com governança,
infraestrutura AWS produtiva e migração de três portais — corresponde a um programa de meses
de um time multidisciplinar, não a uma única sessão). Este plano será atualizado a cada fase
concluída com entregas reais, não aspiracionais.

## Fase 0 — Escopo detalhado e critério de saída

**Objetivo:** projeto executando localmente, lint/typecheck/test/build verdes, documentação
base criada, sem qualquer integração externa real ou provisionamento de infraestrutura.

Entregas desta fase:

1. Estrutura de monorepo (`pnpm` + Turborepo) com `apps/web`, `apps/api`, `apps/worker` e os
   pacotes compartilhados listados acima.
2. Tooling compartilhado: TypeScript `strict`, ESLint (flat config), Prettier, Vitest.
3. `apps/web`: Next.js App Router mínimo, com tokens de design (seção 5.2) aplicados via
   Tailwind CSS, layout público básico (header/footer) e página inicial placeholder.
4. `apps/api`: NestJS + Fastify com módulo de health check (liveness/readiness) e OpenAPI
   básico exposto em `/docs`.
5. `apps/worker`: processo mínimo com fila BullMQ configurável (Redis) e um job de exemplo.
6. `packages/db`: schema Prisma cobrindo o modelo de dados mínimo da seção 8 do prompt
   mestre (identidade, conteúdo, concursos, atendimento, denúncias em schema segregado,
   anúncios, governança/auditoria), com migração inicial e seed fictício.
7. `packages/contracts`, `packages/auth`, `packages/integrations`, `packages/observability`:
   esqueleto funcional com interfaces documentadas (`CandidateProvider`, `EmailProvider`,
   `MessagingProvider`) e mocks locais, sem nenhuma credencial ou chamada de rede real.
8. `docker-compose.yml`: Postgres + Redis para desenvolvimento local.
9. `.github/workflows/ci.yml`: pipeline de PR com install (lockfile imutável), lint,
   typecheck, testes e build.
10. Documentação base listada na regra 3.5 do prompt mestre (este conjunto de arquivos).

**Critério de saída (definition of done da Fase 0):**

- `pnpm install` conclui sem erros;
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` executam e passam (resultados
  reais documentados em `docs/TEST_REPORT.md`, não afirmações genéricas);
- `docker compose up -d db redis` sobe as dependências locais;
- `pnpm --filter @selecon/db prisma migrate dev` aplica a migração inicial com sucesso;
- CI configurado (não necessariamente executado em um runner real nesta sessão, mas
  validado localmente com os mesmos comandos).

## Próximos passos após a Fase 0

1. Solicitar `selecon-portal-v2.html` para destravar fidelidade visual da Fase 1.
2. Iniciar Fase 1: tokens completos, componentes acessíveis (Radix/shadcn), shells
   público e administrativo, autenticação de desenvolvimento, RBAC inicial, catálogo de
   componentes.
3. Antes de qualquer integração real (Microsoft Graph, WhatsApp Cloud API, sistema do
   candidato) ou provisionamento AWS: apresentar lista de credenciais/permissões
   necessárias e aguardar autorização explícita, conforme regra 3.12 e seção 21.8.
