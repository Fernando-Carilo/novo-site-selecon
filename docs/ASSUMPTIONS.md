# Premissas Adotadas

Este documento registra premissas adotadas para permitir avanço contínuo do trabalho,
conforme a regra 3.12 do prompt mestre: dúvidas menores não interrompem a execução —
são registradas aqui e o trabalho continua.

## 1. Protótipo visual (`selecon-portal-v2.html`) ausente no pacote recebido

**Status: pendência real, não bloqueante para a Fase 0.**

O pacote de anexos recebido nesta sessão contém:

- `PROMPT-MESTRE-CLAUDE-NOVO-SITE-SELECON.md` / `.txt`;
- `README-ENTREGAVEIS.md`;
- `COMANDO-INICIAL-PARA-CLAUDE.txt`.

O `README-ENTREGAVEIS.md` referencia `selecon-portal-v2.html` (16 telas navegáveis) e uma
pasta `previews/` com capturas de tela, mas **nenhum dos dois foi efetivamente enviado**
nesta sessão. Uma busca no sistema de arquivos confirmou a ausência completa do arquivo.

**Premissa adotada:** a Fase 0 (fundação, tooling, monorepo, CI, docker-compose, docs) não
depende do protótipo visual e será executada integralmente agora. A Fase 1 (design system e
shells visuais) e todo trabalho de fidelidade de UI ao protótipo ficam **bloqueados** até que
o arquivo `selecon-portal-v2.html` seja fornecido. Os tokens de design da seção 5.2 do prompt
mestre (cores, tipografia) já foram extraídos textualmente e serão aplicados desde já, pois
não dependem do HTML.

**Ação pendente do solicitante:** anexar `selecon-portal-v2.html` (e, se possível, a pasta
`previews/`) para desbloquear a Fase 1 com fidelidade total ao protótipo aprovado.

## 2. Estado inicial do repositório

O repositório `novo-site-selecon` estava **vazio** (sem nenhum commit) no início desta sessão,
já no branch `claude/new-session-e7n8z6`. Não havia código, README, `package.json` ou histórico
prévio a preservar. Portanto, toda a estrutura de monorepo criada na Fase 0 é nova, sem risco de
sobrescrever trabalho existente.

## 3. Stack técnica

Adotada a stack sugerida na seção 6.1 do prompt mestre sem alterações, pois nenhuma limitação de
ambiente ou preferência do time foi informada. Detalhes e justificativas em `docs/DECISIONS/`.

## 4. Autenticação e SSO

Como não há Identity Provider (Azure AD / OIDC) configurado ou credenciais fornecidas, a Fase 0
usa um **provider de autenticação de desenvolvimento local** (credenciais de seed, sem
integração externa real), com a interface já desenhada para substituição por OIDC real na Fase 1.
Nenhuma integração é declarada como operacional.

## 5. Integrações externas (Microsoft Graph, WhatsApp Cloud API, sistema do candidato)

Nenhuma credencial foi fornecida. Todas as integrações serão implementadas como
interfaces/adapters com implementação mock local, conforme regra 3.10. Nenhuma é declarada como
operacional até teste real com credenciais do Instituto.

## 6. Infraestrutura AWS

Nenhum provisionamento real de recursos AWS será feito nesta fase. `infra/` conterá apenas
código como referência (IaC) e documentação, sem `apply`/`deploy` real, conforme regra 3.12 e
seção 21.8 do prompt mestre — autorização explícita será solicitada antes de qualquer
provisionamento.

## 7. Dados de teste e seeds

Todos os dados de seed (concursos, usuários, tickets, denúncias, campanhas) serão fictícios,
claramente identificados como demo, sem qualquer semelhança com pessoas ou casos reais.

## 8. Localização real do código de infraestrutura

A premissa 6 previa `infra/` como diretório de IaC de referência. Na prática, o código real de
CDK (pipeline de 6 estágios, ECS, alarmes, scripts de ativação) foi criado em
`infrastructure/cdk` — `infra/` permaneceu vazio e não foi versionado. `docs/ARCHITECTURE.md`,
`README.md` e `infrastructure/README.md` referenciam o caminho correto.

## 9. Expansão do design system sem retrofit das páginas existentes

Ao adicionar novos componentes reutilizáveis a `packages/ui` (Badge, Alert, TextField/SelectField,
Card, EmptyState, Skeleton, Pagination), optou-se por **não** substituir a marcação equivalente já
existente em cada página administrativa (que já usa os mesmos tokens de design diretamente via
Tailwind e está coberta pela suíte E2E). Uma migração retroativa em massa, feita sob pressão de
tempo logo após estabilizar a suíte E2E, teria alto risco de regressão sem benefício funcional —
apenas cosmético. Os novos componentes ficam disponíveis, tipados, com lint/typecheck/build
verificados, prontos para adoção incremental em código novo ou em uma fase futura dedicada a essa
migração.

## 10. `buildspec-migrations.yml` (estágio Migrations do pipeline) tem um bug conhecido, não corrigido nesta rodada

Ao preparar a ativação manual do ambiente DEV (`scripts/build-push-deploy-dev.sh`), foram
encontrados e corrigidos bugs reais que impediam qualquer execução de `prisma migrate deploy`
em produção: `prisma` (a CLI) estava em `devDependencies` de `packages/db` (removida da imagem
de produção por `pnpm deploy --prod`), e o pacote `pg` (usado só no `buildspec-migrations.yml`
para o advisory lock) nunca foi uma dependência do projeto. Corrigido em
`apps/api/src/scripts/run-migrations.ts` (usa o Prisma Client já existente via `$queryRawUnsafe`
para o lock, sem depender de `pg`) + `prisma` movida para `dependencies`.

`scripts/build-push-deploy-dev.sh` já usa a versão corrigida via `aws ecs run-task` (a única
forma de alcançar o RDS, que é privado à VPC — nem CloudShell nem os projetos CodeBuild do
pipeline, que não têm `vpcConfig`, conseguem se conectar diretamente a ele).

**Pendência real:** `buildspec-migrations.yml` (usado pelo estágio Migrations de
`SeleconPortalPipelineStack`, que não foi tocado nesta rodada — só `SeleconPortalDevStack` foi
ativada) ainda tem a versão antiga e quebrada (tenta `docker run` local com `pg` inexistente, e
o `MigrationsProject` do CodeBuild não tem `vpcConfig` nem permissão IAM para `ecs:RunTask`).
Antes de ativar `SeleconPortalPipelineStack`, `buildspec-migrations.yml` e
`infrastructure/cdk/lib/pipeline-stack.ts` precisam do mesmo tratamento: substituir o
`docker run` por `aws ecs run-task` usando a task definition da api (mesmas subnets/security
groups do serviço), com as permissões IAM (`ecs:RunTask`, `ecs:DescribeTasks`, `iam:PassRole`)
adicionadas ao papel do `MigrationsProject`.
