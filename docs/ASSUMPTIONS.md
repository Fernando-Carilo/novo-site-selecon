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
  reaproveitando a família `api`, porque no momento em que Migrations roda (antes de Deploy) o
  serviço da api ainda está com a imagem antiga — registrar sob a família `api` colidiria com
  o que o serviço realmente usa.
- **Bootstrap ovo-e-galinha resolvido tornando as duas stacks independentes.** O primeiro
  `cdk deploy` de `SeleconPortalDevStack` precisa de uma imagem já publicada no ECR (o ECS
  espera o serviço estabilizar); a própria stack ainda não existe no primeiríssimo run da
  pipeline. Resolvido em duas frentes: (a) `SeleconPortalPipelineStack` não depende de nenhum
  output de `SeleconPortalDevStack` via props obrigatórias (os antigos `databaseSecretArn`/
  `databaseHost` foram removidos — a única dependência remanescente,
  `webTargetGroupArn`/`apiTargetGroupArn`, é opcional e só afeta uma checagem de conveniência
  no SmokeTest); (b) o estágio Migrations detecta a ausência da stack/serviço
  (`cloudformation describe-stacks` retornando "não encontrado", ou o serviço da api não
  `ACTIVE`) e passa adiante com `exit 0` só nesse caso, preservando a ordem "migrar antes de
  implantar" em todos os runs seguintes.
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
