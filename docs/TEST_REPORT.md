# Relatório de Testes

Este relatório é atualizado ao final de cada fase com resultados reais de execução — nunca
com afirmações genéricas sem evidência (regra 20 do prompt mestre).

## Fase 0 — Fundação (executado em 2026-07-26)

Ambiente: Node.js 22.22.2, pnpm 10.33.0, PostgreSQL 16, Redis 7 (instâncias locais nativas —
Docker não estava disponível no sandbox de execução desta sessão; ver nota abaixo).

### Comandos executados e resultado real

| Comando | Resultado |
|---|---|
| `pnpm install` | ✅ Sucesso — 11 workspaces, 682 pacotes resolvidos |
| `pnpm --filter @selecon/db exec prisma validate` | ✅ Schema válido |
| `pnpm --filter @selecon/db exec prisma migrate dev --name init` | ✅ Migração aplicada — 7 schemas Postgres criados (`identity`, `content`, `contests`, `service`, `whistleblowing`, `advertising`, `governance`) |
| `pnpm --filter @selecon/db exec tsx prisma/seed.ts` | ✅ Seed fictício aplicado sem erros |
| `pnpm format` (prettier --check) | ✅ Todos os arquivos formatados |
| `pnpm lint` | ✅ 17/17 pacotes/apps sem erros |
| `pnpm typecheck` | ✅ 17/17 pacotes/apps sem erros |
| `pnpm test` | ✅ 17/17 pacotes com testes executados, **17 testes passando**, 0 falhas |
| `pnpm build` | ✅ 10/10 pacotes/apps com build gerado com sucesso |

### Testes por pacote (Vitest)

| Pacote | Arquivo de teste | Testes |
|---|---|---|
| `@selecon/config` | `src/env.test.ts` | 3 passando |
| `@selecon/contracts` | `src/contest/contest.test.ts` | 2 passando |
| `@selecon/auth` | `src/policy.test.ts` | 4 passando |
| `@selecon/integrations` | `src/health-check.test.ts` | 4 passando |
| `@selecon/observability` | `src/correlation.test.ts` | 2 passando |
| `@selecon/api` | `src/health/health.service.test.ts` | 1 passando |
| `@selecon/worker` | `src/jobs/example-job.test.ts` | 1 passando |
| `@selecon/db`, `@selecon/ui`, `@selecon/web` | — | sem testes ainda (nenhuma regra de negócio de UI/domínio implementada nesta fase) |

**Total: 17 testes, 17 passando, 0 falhando.**

### Smoke tests manuais de runtime (com Postgres/Redis reais)

- `apps/web` (`next start`): `GET /` → `200`, `GET /concursos` → `200`, conteúdo renderizado
  confirmado via `curl`.
- `apps/api` (`node dist/main.js`): `GET /health/live` → `200 {"status":"ok"}`;
  `GET /health/ready` → `200 {"status":"ok"}` (checagem real de conexão Postgres + Redis);
  `GET /docs` (OpenAPI/Swagger UI) → `200`.
- `apps/worker` (`node dist/main.js`): conectou ao Redis real, log `"apps/worker pronto e
  conectado ao Redis"`, encerramento gracioso (`SIGTERM`) confirmado.

### Nota sobre o ambiente de validação

O `docker-compose.yml` (Postgres + Redis) não pôde ser executado neste sandbox porque o
daemon Docker não estava disponível (`dockerd` sem permissão para configurar cgroups/ulimits
no container de execução desta sessão). A validação foi feita com instâncias nativas de
PostgreSQL 16 e Redis 7 já presentes no ambiente, usando a mesma `DATABASE_URL`/`REDIS_URL` de
desenvolvimento. O `docker-compose.yml` em si foi revisado mas não testado ponta a ponta nesta
sessão — recomenda-se validar `docker compose up -d db redis` em um ambiente com Docker
funcional antes de considerar a Fase 0 encerrada em definitivo.

## Metas de cobertura (lembrete para fases futuras)

- Mínimo 80% em regras de domínio e serviços críticos;
- Mínimo 90% em autenticação, autorização, geração/verificação de códigos de denúncia e
  versionamento de documentos;
- Cobertura não substitui qualidade — casos negativos e de abuso são obrigatórios a partir da
  Fase 3 (concursos) e essenciais nas Fases 5 e 6.
