# Runbook de Operação

> Nesta fase (Fase 0), cobre apenas o ambiente de **desenvolvimento local**. Runbooks de
> produção (deploy, rollback, incidentes, DR) serão adicionados na Fase 8, quando houver
> infraestrutura AWS real provisionada.

## 1. Ambiente local — pré-requisitos

- Node.js 22.x (ver `.nvmrc`);
- pnpm 10.x (`corepack enable` habilita a versão fixada em `package.json#packageManager`);
- Docker + Docker Compose (para Postgres e Redis locais).

## 2. Subir o ambiente

```bash
pnpm install
docker compose up -d db redis
pnpm --filter @selecon/db exec prisma migrate dev
pnpm --filter @selecon/db exec prisma db seed
pnpm dev
```

`pnpm dev` inicia `apps/web`, `apps/api` e `apps/worker` em paralelo via Turborepo.

## 3. Comandos principais

| Comando                  | Efeito                                               |
| ------------------------ | ---------------------------------------------------- |
| `pnpm lint`              | ESLint em todos os pacotes/apps                      |
| `pnpm typecheck`         | `tsc --noEmit` em todos os pacotes/apps              |
| `pnpm test`              | Vitest em todos os pacotes/apps                      |
| `pnpm build`             | Build de produção de todos os pacotes/apps           |
| `pnpm dev`               | Modo desenvolvimento (watch)                         |
| `docker compose down -v` | Derruba e remove volumes locais (perde dados locais) |

## 4. Health checks (Fase 0)

- `apps/api`: `GET /health/live` (processo no ar) e `GET /health/ready` (verifica conexão com
  Postgres e Redis).
- `apps/worker`: log estruturado de "worker ready" no boot; health check HTTP dedicado será
  adicionado quando houver jobs reais de integração (Fase 5+).

## 5. Solução de problemas comuns (Fase 0)

| Sintoma                                  | Causa provável                                        | Ação                                                                     |
| ---------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| `apps/api` falha no boot com erro de env | Variável obrigatória ausente/`​ .env` não criado      | Copiar `.env.example` para `.env` e preencher valores de desenvolvimento |
| Prisma migrate falha                     | Postgres não está no ar                               | `docker compose up -d db` e checar `docker compose logs db`              |
| Porta em uso                             | Outro processo local usando a mesma porta (3000/3001) | Ajustar `PORT` no `.env` ou finalizar o processo conflitante             |

## 6. Pendências para runbook de produção (Fase 8)

- Procedimento de deploy (zero-downtime), rollback automático, migrations em job separado;
- RTO/RPO documentados, plano de contingência para inscrições e publicações críticas;
- Dashboards e alarmes (CloudWatch) referenciados a partir daqui;
- Procedimento de restauração de backup testado (restore drill).
