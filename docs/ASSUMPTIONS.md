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

## 10. `buildspec-migrations.yml` (estágio Migrations do pipeline) — pendência resolvida

Ao preparar a ativação manual do ambiente DEV (`scripts/build-push-deploy-dev.sh`), foram
encontrados e corrigidos bugs reais que impediam qualquer execução de `prisma migrate deploy`
em produção: `prisma` (a CLI) estava em `devDependencies` de `packages/db` (removida da imagem
de produção por `pnpm deploy --prod`), e o pacote `pg` (usado só no `buildspec-migrations.yml`
para o advisory lock) nunca foi uma dependência do projeto. Corrigido em
`apps/api/src/scripts/run-migrations.ts` (usa o Prisma Client já existente via `$queryRawUnsafe`
para o lock, sem depender de `pg`) + `prisma` movida para `dependencies`.

A pendência registrada originalmente aqui — `buildspec-migrations.yml` ainda usar `docker run`
local, inalcançável por estar o RDS privado à VPC — **foi resolvida na rodada seguinte** (ver
item 11): o estágio agora usa `aws ecs run-task` com uma task definition dedicada.

## 11. Substituição completa do caminho de implantação por CodePipeline + CodeBuild

A pedido explícito ("PARE a estratégia de build Docker no AWS CloudShell... Quero substituir
`scripts/build-push-deploy-dev.sh` por uma implantação profissional usando AWS CodePipeline +
CodeBuild + ECR + ECS/CDK"), o caminho principal de implantação deixou de ser um script manual
de CloudShell e passou a ser a pipeline dos 6 estágios já existente em
`infrastructure/cdk/lib/pipeline-stack.ts` (Source → Validate → BuildImages → Migrations →
Deploy → SmokeTest). `scripts/build-push-deploy-dev.sh` e `scripts/bootstrap-aws-dev.sh` foram
rebaixados a ferramentas de recuperação manual (banner explícito no topo de cada arquivo);
`scripts/bootstrap-codepipeline-dev.sh` (novo) é o único script que ativa a pipeline em si, e
`scripts/rollback-ecs-dev.sh` (novo) cobre rollback operacional de ECS sem tocar em migrações
de banco.

Decisões e bugs relevantes desta rodada, todos verificados **sem** credenciais AWS reais nem
acesso a registry Docker (ambos confirmados indisponíveis neste sandbox:
`aws sts get-caller-identity` retorna `InvalidClientTokenId`; `docker pull` retorna `403
Forbidden`):

- **Migrations via `aws ecs run-task`, nunca `docker run` local no CodeBuild.** O RDS é
  privado à VPC e o projeto CodeBuild não tem `vpcConfig` — não haveria rota de rede possível.
  A task de migração roda numa família dedicada (`selecon-portal-dev-migrate`), nunca
  reaproveitando a família `api` (mesmo a task definition atual da api já apontando para a
  imagem do commit neste ponto — ver item 12), para não poluir o histórico de revisões do
  serviço real com uma entrada que nunca foi usada por ele.
- **Bootstrap ovo-e-galinha resolvido tornando as duas stacks independentes.** O primeiro
  `cdk deploy` de `SeleconPortalDevStack` precisa de uma imagem já publicada no ECR (o ECS
  espera o serviço estabilizar); a própria stack ainda não existe no primeiríssimo run da
  pipeline. `SeleconPortalPipelineStack` não depende de nenhum output de
  `SeleconPortalDevStack` via props obrigatórias (os antigos `databaseSecretArn`/
  `databaseHost` foram removidos — a única dependência remanescente,
  `webTargetGroupArn`/`apiTargetGroupArn`, é opcional e só afeta uma checagem de conveniência
  no SmokeTest) — isso permite implantar a pipeline antes da stack de dados existir. A ordem
  dos estágios (ver item 12) garante que a stack já exista antes de qualquer tentativa de
  migração.
- **Tagging imutável por commit.** As três imagens são publicadas com a tag do commit
  (`CODEBUILD_RESOLVED_SOURCE_VERSION:0:12`) e também com `:dev` (conveniência). As task
  definitions de api/worker (geridas pelo CDK) usam o contexto `imageTag`, nunca a tag `:dev`,
  em implantações reais da pipeline — a stack só usa `:dev` como fallback para um `cdk
  synth`/`cdk diff` manual sem contexto.
- **Preservação de propriedades de task definition.** Toda transformação de task definition
  (migração e serviço `web`) usa `del()` apenas dos campos imutáveis que
  `describe-task-definition` devolve mas `register-task-definition` rejeita como entrada
  (`taskDefinitionArn`, `revision`, `status`, `requiresAttributes`, `compatibilities`,
  `registeredAt`, `registeredBy`, `deregisteredAt`) — nunca uma lista branca de campos, que
  descartaria silenciosamente volumes/tags/`ephemeralStorage`/etc. não previstos.
- **Bug de `jq` encontrado e corrigido antes de chegar a qualquer arquivo final:**
  `.taskDefinition | .containerDefinitions = (.taskDefinition.containerDefinitions | ...)`
  falha com `Cannot iterate over null (null)` porque, após o pipe para `.taskDefinition`, uma
  referência subsequente a `.taskDefinition.containerDefinitions` procura uma chave aninhada
  inexistente. Padrão correto, usado em ambos os buildspecs:
  `.taskDefinition as $td | $td | .containerDefinitions = ($td.containerDefinitions | ...)`.
  Verificado isoladamente com `jq` standalone antes e depois da correção.
- **Duas classes de bug de YAML nos buildspecs, encontradas sistematicamente (não por
  inspeção visual):** parseando cada um dos 5 `buildspec-*.yml` com `yaml.safe_load` do Python
  e checando que todo item de `commands:` é uma `str` (não um `dict`), depois reconstruindo um
  script bash sintético (join dos comandos) e rodando `bash -n` + `shellcheck` nele.
  1. *Colon+espaço vira mapeamento implícito:* um item de `commands:` como
     `- echo "texto: $VAR"`, sem aspas YAML envolvendo o item inteiro, é interpretado como um
     mapeamento (`echo "texto` → `$VAR"`) por causa da ambiguidade de fluxo-em-bloco do YAML.
     Corrigido envolvendo o comando inteiro em aspas simples no nível do YAML:
     `- 'echo "texto: $VAR"'`. Encontradas 3 ocorrências: duas introduzidas nesta rodada
     (`buildspec-migrations.yml`, `buildspec-deploy.yml`) e uma pré-existente, de uma rodada
     anterior (`buildspec-validate.yml`, linha do `pnpm audit`).
  2. *Folding de linha quebra continuação de bash:* um item de `commands:` escrito como um
     escalar simples de duas linhas terminado em `\` (continuação de bash pretendida) tem sua
     quebra de linha substituída por um único espaço pelo YAML antes mesmo do bash processar o
     texto — o `\` termina antes de um espaço literal, não de uma quebra de linha real.
     Corrigido convertendo esses itens para escalares de bloco (`- |`), que preservam quebras
     de linha literais. Duas ocorrências, ambas em `buildspec-deploy.yml` (`cdk synth`/`cdk
     deploy` com seus blocos `|| { ...; exit 1; }`).

Lição operacional para qualquer buildspec futuro: `bash -n`/`shellcheck` rodado diretamente
contra o `.yml` não captura nenhuma dessas duas classes de bug (o parser YAML já terá
corrompido o texto antes); é necessário extrair os comandos via um parser YAML real primeiro.

## 12. Correção da ordem dos estágios: Deploy antes de Migrations, sem skip gracioso

A primeira versão desta pipeline (item 11) usava a ordem Source → Validate → BuildImages →
**Migrations → Deploy** → SmokeTest, com o estágio Migrations "pulando" (`exit 0`) sem aplicar
nenhuma migração sempre que `SeleconPortalDevStack` ou o serviço da api ainda não existissem —
o que é exatamente o caso no primeiríssimo run da pipeline. Isso foi identificado como um
defeito real: uma pipeline "bem-sucedida" no primeiro run nunca chegava a aplicar nenhuma
migração, e nada no fluxo forçava uma correção posterior automática.

**Corrigido invertendo a ordem:** Source → Validate → BuildImages → **Deploy → Migrations** →
SmokeTest. Deploy agora executa `cdk deploy SeleconPortalDevStack` (criando a stack já no
primeiro run) e atualiza os três serviços para a imagem do commit, esperando-os atingir steady
state, antes de Migrations rodar. Isso funciona mesmo no primeiríssimo run porque o health
check usado para considerar o serviço da api estável (`GET /api/health/ready`) só executa
`SELECT 1` — não depende de nenhuma tabela migrada (ver `apps/api/src/health/health.service.ts`)
— então o ECS/ALB consideram o serviço saudável antes mesmo da primeira migração real.
Migrations, rodando depois, **agora falha (nunca pula/ignora)** se a stack ou o serviço da api
não existirem/não estiverem `ACTIVE` nesse ponto — essa situação passou a ser sempre um erro
real (Deploy falhou silenciosamente, ou a ordem dos estágios foi alterada incorretamente),
nunca mais um caso esperado de bootstrap.

Arquivos afetados: `infrastructure/cdk/lib/pipeline-stack.ts` (ordem das stages e wiring de
artefatos — `Deploy` agora consome o artefato `Images` diretamente, e `Migrations` também,
eliminando o artefato intermediário `Migrations` que só existia para a ordem antiga),
`buildspec-deploy.yml` e `buildspec-migrations.yml` (comentários de cabeçalho e a lógica de
skip trocada por falha), `infrastructure/README.md`, `docs/ARCHITECTURE.md`,
`docs/OPERATIONS_RUNBOOK.md`, `scripts/bootstrap-codepipeline-dev.sh`.

Nesta mesma rodada, `scripts/bootstrap-codepipeline-dev.sh` também deixou de criar/reaproveitar
uma AWS CodeConnection dinamicamente: passou a usar exclusivamente o ARN de uma conexão já
existente e já `AVAILABLE`
(`arn:aws:codeconnections:us-east-1:518825425828:connection/5ff3c8d6-23b7-4459-8023-52cba5c0e33c`),
informado explicitamente pelo operador — o script valida existência e status e falha se
qualquer um dos dois não for satisfeito, mas nunca chama `codestar-connections
create-connection`.

## 13. Abandono completo de ECS/Fargate/CDK em favor de Elastic Beanstalk (Docker)

A pedido explícito ("Precisamos abandonar a arquitetura atual baseada em ECS/Fargate e
CDK para deploy da aplicação... O padrão definitivo deste projeto deve ser o mesmo
utilizado nos outros projetos do Instituto Selecon: GitHub -> CodePipeline -> CodeBuild
-> Elastic Beanstalk com Docker"), toda a arquitetura de implantação construída nas
rodadas anteriores (itens 11 e 12 acima) foi **removida do repositório**: o app CDK
inteiro (`infrastructure/cdk/`), os 5 `buildspec-*.yml` (validate/images/migrations/
deploy/smoke) e os scripts `bootstrap-aws-dev.sh`/`bootstrap-codepipeline-dev.sh`/
`build-push-deploy-dev.sh`/`rollback-ecs-dev.sh` foram apagados (não apenas
descontinuados — de fato removidos do Git; consultar o histórico se precisar).

**Recursos da arquitetura anterior não foram excluídos da conta AWS.** VPC
`vpc-0b5fb2dcfb604f371`, cluster ECS `selecon-portal-dev`, ALB
`selecon-portal-dev-alb`, serviço `selecon-portal-dev-web` e os 3 repositórios ECR
(`selecon-portal/{web,api,worker}-dev`) continuam existindo — nada neste repositório os
toca, cria ou remove automaticamente. A decisão de desativá-los manualmente (fora deste
fluxo) fica a critério de um operador humano.

Nova arquitetura, decisões de design e por quê:

- **Container único (web + api) em vez de 3 serviços separados.** `Dockerfile` (raiz)
  builda `apps/web` (Next.js standalone) e `apps/api` (NestJS) na mesma imagem, rodando
  lado a lado via `docker/entrypoint.sh`. Isso é viável sem nenhuma mudança de código
  porque `apps/web`'s proxy server-to-server (`apps/web/app/api/[...path]/route.ts`) já
  usa `API_INTERNAL_URL` com fallback para `http://localhost:3001/api` — exatamente o
  necessário quando os dois processos rodam no mesmo container/localhost.
- **`apps/worker` (BullMQ) fica fora deste ambiente DEV.** Nenhuma fila assíncrona real é
  processada em produção ainda. O código do worker continua no repositório para
  desenvolvimento local (`docker-compose`, `pnpm docker:build:worker`), só não é
  implantado nesta pipeline.
- **Redis local efêmero no container, sem ElastiCache — auditado e confirmado.**
  Auditoria de todos os imports/usos de Redis e BullMQ no monorepo (`grep` por
  `ioredis`, `new Redis(`, `bullmq`, `REDIS_URL` em `apps/*` e `packages/*`): o único
  arquivo que importa `ioredis` é `apps/api/src/health/health.service.ts`, usado
  exclusivamente por `HealthService.readiness()` (chamado por `/api/health` e
  `/api/health/ready`) — nenhuma outra rota, middleware, sessão ou rate-limit de
  `apps/api` usa Redis. `apps/worker` é o único lugar que importa `bullmq`, e não faz
  parte deste deploy (ver item acima). Conclusão: **`apps/api` depende de Redis**
  (a validação de schema em `packages/config/src/env.ts` exige `REDIS_URL`, e o
  próprio health check o usa de verdade), então — em vez de remover Redis do
  container — ele é mantido, mas **apenas como um `redis-server` local, sem
  persistência (`--save "" --appendonly no`), exclusivo de DEV**. Decisão
  explicitamente permitida pelo requisito 6, que só proíbe colocar **PostgreSQL**
  dentro do container, nunca Redis. **Proibido em HML/PRD:** se alguma
  funcionalidade real vier a depender de Redis compartilhado entre instâncias (cache,
  filas do worker, sessões), a promoção para HML/PRD exige um ElastiCache gerenciado
  antes do primeiro deploy naqueles ambientes — nunca reaproveitar este `redis-server`
  local fora de DEV (ver comentário correspondente no `Dockerfile`).
- **`GET /api/health` novo, com status HTTP real.** Adicionada uma rota
  (`apps/api/src/health/health.controller.ts`) que reaproveita
  `HealthService.readiness()` mas, diferente de `/api/health/ready` (pré-existente,
  mantida como está para não afetar outros consumidores/testes), responde HTTP 503
  (não 200) quando alguma dependência está fora do ar — necessário para o health check
  do Elastic Beanstalk realmente detectar uma instância não saudável via código HTTP.
- **Migrações no boot do container, nunca mais via task ECS avulsa.** Reaproveita
  `apps/api/src/scripts/run-migrations.ts` (já existente, com `pg_advisory_lock`), agora
  chamado por `docker/entrypoint.sh` antes de `apps/api`/`apps/web` subirem. Se a
  migração falhar, o container inteiro falha — nenhuma implantação com schema quebrado é
  considerada bem-sucedida pelo Elastic Beanstalk.
- **CloudFormation puro, sem CDK, para RDS e pipeline.** Nenhuma entrega desta rodada
  (buildspec, Dockerfile, Dockerrun, configuração de CodePipeline/CodeBuild, scripts)
  usa CDK — consistente com o padrão dos outros projetos do Instituto e com o pedido
  explícito de simplificação. `infrastructure/cloudformation/rds.yml` e
  `infrastructure/cloudformation/pipeline.yml` são templates independentes entre si.
- **Application/Environment do Elastic Beanstalk via AWS CLI, não CloudFormation.**
  `AWS::ElasticBeanstalk::Environment` tem um schema de `OptionSettings` propenso a
  efeitos colaterais em atualizações incrementais (algumas opções exigem substituição
  completa do ambiente se alteradas via CloudFormation). Para uma única instância DEV,
  criar/atualizar via `aws elasticbeanstalk create-environment`/`update-environment`
  (em `scripts/bootstrap-elasticbeanstalk-dev.sh`) dá controle mais direto e mais fácil
  de auditar do que depurar um `UPDATE_ROLLBACK_FAILED` de uma stack CloudFormation de EB.
- **Plano de mudanças antes de aplicar, via change sets do CloudFormation.**
  `scripts/bootstrap-rds-dev.sh` e `scripts/bootstrap-codepipeline-eb-dev.sh` usam
  `create-change-set` + `describe-change-set` (mostrando Add/Modify/Remove por recurso)
  antes de `execute-change-set`, com confirmação explícita — o equivalente, para
  CloudFormation, ao gate "digite SIM" já usado nos scripts anteriores.
- **DATABASE_URL nunca no Git.** Composta em tempo de bootstrap a partir do segredo do
  Secrets Manager (usuário/senha) + endpoint do RDS (host/porta/nome, saídas do
  CloudFormation) e definida diretamente como propriedade de ambiente do Elastic
  Beanstalk — uma das opções explicitamente permitidas pelo requisito de segurança
  ("usar variáveis do Elastic Beanstalk, Secrets Manager ou SSM").
- **Validado com `cfn-lint`** (instalado localmente neste sandbox, sem exigir
  credenciais AWS — puramente análise estática dos templates): encontrou e corrigiu 2
  bugs reais antes da entrega — um caractere não-ASCII (`—`) em campos
  `GroupDescription` de `AWS::EC2::SecurityGroup` (que só aceitam um conjunto restrito
  de caracteres ASCII) e uma versão do engine PostgreSQL (`16.6`) já sinalizada como
  obsoleta para criação de novas instâncias RDS.

## 14. Bug real encontrado em produção: `apt-get` não existe na imagem do CodeBuild

Com a pipeline já implantada e rodando de verdade (não mais só validada localmente), o
estágio Build falhou: `buildspec.yml` executava `apt-get update -y`/`apt-get install -y
postgresql redis-server` (herdado do antigo `buildspec-validate.yml` da arquitetura
ECS/CDK) para rodar lint/typecheck/testes com Postgres/Redis efêmeros dentro do próprio
CodeBuild. O projeto CodeBuild usa `aws/codebuild/amazonlinux2-x86_64-standard:5.0`
(Amazon Linux 2), que não tem `apt-get`/`apt` — só `yum`/`dnf`. Esse comando nunca
poderia ter funcionado nessa imagem.

**Corrigido removendo completamente essa etapa**, não substituindo por `yum`: o
`buildspec.yml` agora só autentica no ECR, faz `docker build`/`push` (tag do commit +
`:latest`) e gera `Dockerrun.aws.json` — nada de `pnpm install`, lint, typecheck ou
testes rodando diretamente no runner do CodeBuild (isso já acontece dentro do
`Dockerfile`, que faz `pnpm install` e `pnpm turbo run build` no seu próprio multi-stage
com a imagem `node:22-alpine`, sem depender de nenhum pacote do sistema operacional do
CodeBuild). `Dockerrun.aws.json.template` (o arquivo separado com placeholder `sed`) foi
removido — o `Dockerrun.aws.json` agora é gerado inteiramente inline, via heredoc, no
próprio `buildspec.yml`.

**Consequência a monitorar:** nem o `buildspec.yml` nem o `Dockerfile` rodam
lint/typecheck/testes antes do build de produção — a pipeline não tem, hoje, nenhum
gate de qualidade automático antes do deploy. `pnpm lint`/`pnpm typecheck`/`pnpm test`
continuam existindo no monorepo e devem ser rodados manualmente antes de um push, ou
reintroduzidos como um estágio Validate separado no futuro, se um gate automático for
desejado.

Também corrigida, na mesma rodada: a porta pública do container, que estava em `8080`
(convenção antiga da tentativa anterior), foi trocada para `3000` (`ENV PORT`, `EXPOSE`,
`HEALTHCHECK` no `Dockerfile`, e `ContainerPort` no `Dockerrun.aws.json` gerado, via a
variável `CONTAINER_PORT` do CodeBuild). `infrastructure/cloudformation/pipeline.yml`
ganhou duas variáveis de ambiente novas no `CodeBuildProject` — `ECR_REPOSITORY_URI`
(URI completa do ECR, evita reconstruir a string a partir de conta+região+nome) e
`CONTAINER_PORT` (`3000`) — para casar com o que o `buildspec.yml` agora espera
encontrar já pronto no ambiente do CodeBuild.

## 15. Bug real encontrado em produção: rate limit do Docker Hub durante `docker build`

Com o `apt-get` corrigido (item 14), o estágio Build voltou a falhar — desta vez no
próprio `docker build`, ao puxar a imagem base `node:22-alpine`:
`failed to solve: unexpected status from HEAD request to registry-1.docker.io/...:
429 Too Many Requests`. O Docker Hub aplica rate limit a pulls anônimos (sem login);
CodeBuild não estava autenticado no Docker Hub (só no ECR privado, para publicar a
imagem final).

**Corrigido trocando a imagem base pelo mirror da Docker Official Image no Amazon ECR
Public Gallery:** `node:22-alpine` → `public.ecr.aws/docker/library/node:22-alpine`,
nos 4 Dockerfiles do repositório (o da raiz, usado pela pipeline, e os 3 de
`apps/web`/`apps/api`/`apps/worker`, usados só localmente via `pnpm docker:build`/
`pnpm docker:test` — trocados por consistência e porque o mesmo rate limit pode
afetar builds locais). ECR Public não tem o mesmo limite agressivo de pulls anônimos
do Docker Hub para contas AWS. Nenhuma mudança funcional: mesma imagem, mesma tag,
outro registry. `apk add` (usado em todos os estágios) não é afetado — usa os
repositórios do próprio Alpine, não o Docker Hub.

Também removido `--platform=linux/amd64` do `FROM` do `Dockerfile` da raiz (não dos 3
Dockerfiles locais, que mantêm o pin para build de imagem amd64 mesmo a partir de uma
máquina de desenvolvedor ARM, ex. Apple Silicon). No Dockerfile da pipeline o pin era
redundante — o runner do CodeBuild e a instância EC2 do Elastic Beanstalk (`t3.micro`)
já são amd64 nativamente — e o próprio BuildKit sinalizava isso como um lint
(`FromPlatformFlagConstDisallowed`). Não foi a causa da falha, só uma limpeza.
