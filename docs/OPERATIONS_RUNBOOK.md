# Runbook de Operação

> Este documento cobre o ambiente de **desenvolvimento local**. Para deploy, rollback,
> observabilidade (CloudWatch/SNS) e ativação da infraestrutura AWS, ver `infrastructure/README.md`
> — o código está pronto e `cdk synth`-validado, mas nenhum recurso foi provisionado por esta
> sessão (sandbox sem credenciais reais); a ativação é feita por um operador humano.

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

## 4. Health checks

- `apps/api`: `GET /health/live` (processo no ar) e `GET /health/ready` (verifica conexão com
  Postgres e Redis).
- `apps/worker`: log estruturado de "worker ready" no boot; health check HTTP dedicado será
  adicionado quando houver jobs reais de integração.

## 5. Solução de problemas comuns

| Sintoma                                  | Causa provável                                        | Ação                                                                     |
| ---------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| `apps/api` falha no boot com erro de env | Variável obrigatória ausente/`​ .env` não criado      | Copiar `.env.example` para `.env` e preencher valores de desenvolvimento |
| Prisma migrate falha                     | Postgres não está no ar                               | `docker compose up -d db` e checar `docker compose logs db`              |
| Porta em uso                             | Outro processo local usando a mesma porta (3000/3001) | Ajustar `PORT` no `.env` ou finalizar o processo conflitante             |
| `POST /auth/login` retorna 429 durante testes manuais repetidos | Rate limit de força bruta (10 requisições/60s por IP) | Esperar a janela expirar, ou elevar temporariamente `AUTH_LOGIN_RATE_LIMIT` no `.env` local — nunca em produção |

## 6. Suíte E2E local (`e2e/`)

```bash
pnpm --filter @selecon/api seed:e2e   # normaliza a senha dos usuários de demonstração
cd e2e && pnpm install --ignore-workspace
npx playwright test --project=desktop-chromium --workers=1
npx playwright test --project=mobile-chromium --workers=1
```

Requer `apps/api` (build compilado) e `apps/web` (build de produção, `next start`) rodando —
não é executada contra `pnpm dev` porque o objetivo é validar o comportamento de produção
(inclusive o proxy `/api/*` de `apps/web`). Ver `docs/TEST_REPORT.md` para os resultados mais
recentes e os bugs reais já encontrados e corrigidos por essa suíte.

## 7. Implantação DEV na AWS

> A arquitetura de implantação mudou: **ECS Fargate + AWS CDK foi abandonado** em favor
> de **Elastic Beanstalk (Docker, container único)**, o mesmo padrão usado nos outros
> projetos do Instituto Selecon — ver `docs/ASSUMPTIONS.md` para a justificativa.

O caminho principal de implantação é uma pipeline CodePipeline + CodeBuild de 3 estágios
(Source → Build → Deploy), disparada automaticamente a cada
`git push origin feat/fase-1-design-system`. Detalhes completos em
`infrastructure/README.md` e `docs/ARCHITECTURE.md`.

Bootstrap único, feito por um operador humano com credenciais reais no CloudShell, nesta
ordem (cada script mostra o plano de mudanças e pede confirmação explícita):

```bash
scripts/bootstrap-rds-dev.sh              # RDS PostgreSQL + security groups
scripts/bootstrap-elasticbeanstalk-dev.sh # Application + Environment do Elastic Beanstalk
scripts/bootstrap-codepipeline-eb-dev.sh  # ECR + CodeBuild + CodePipeline
```

A partir daí, nenhum comando manual adicional é necessário — todo push implanta
automaticamente: lint/typecheck/test/build, `docker build` da imagem única (web+api),
push para o ECR, e implantação no Elastic Beanstalk. As migrações do Prisma rodam
**dentro do próprio container**, no boot, antes da aplicação aceitar requisições — nunca
mais como uma task ECS avulsa.

### 7.1 Rollback

Para reverter uma implantação problemática do Elastic Beanstalk para a versão anterior:

```bash
scripts/rollback-eb-dev.sh
```

Esse script lista as versões da aplicação, identifica a versão atual e a anterior via
`describe-environments`/`describe-application-versions` (nunca presumidas por nome) e,
com confirmação explícita, aplica `update-environment --version-label <anterior>`.
**Nunca desfaz migrações de banco automaticamente** — se a versão anterior depende de um
schema mais antigo, avalie manualmente antes de reverter.

### 7.2 Ferramentas de recuperação/validação

| Script | Uso |
| ------ | --- |
| `scripts/check-aws-dev.sh` | Somente leitura — inventário do ambiente (RDS, ECR, Elastic Beanstalk, CodePipeline, CodeConnection, URL pública) |

Nenhum desses procedimentos (incluindo a pipeline) foi executado nesta sessão — o código
foi validado localmente (`bash -n`, `shellcheck`, parsing YAML, `cfn-lint`), mas o deploy
real é responsabilidade do operador com credenciais AWS.
