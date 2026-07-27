# Infraestrutura como código — Portal Selecon (DEV)

## Estratégia de adoção (seção 20 do prompt mestre)

A infraestrutura DEV atual (`selecon-portal-dev-preview`) foi provisionada manualmente via
CloudFormation, fora deste CDK: VPC `vpc-0b5fb2dcfb604f371`, cluster ECS
`selecon-portal-dev`, ALB `selecon-portal-dev-alb`, serviço `selecon-portal-dev-web` e os
três repositórios ECR (`selecon-portal/{web,api,worker}-dev`).

Este CDK adota a **estratégia B**: referencia esses recursos por atributos explícitos
(`Vpc.fromVpcAttributes`, `Cluster.fromClusterAttributes`, `Repository.fromRepositoryName`,
`SecurityGroup.fromSecurityGroupId` — nunca `fromLookup`, que exigiria uma chamada real à
API da AWS só para sintetizar o template) e **gerencia apenas os recursos novos**:

- `SeleconPortalDevStack` (`lib/selecon-portal-stack.ts`): RDS PostgreSQL, ElastiCache
  (Valkey), bucket S3 de uploads, Secrets Manager, roles IAM, log groups, os serviços
  ECS de **api** e **worker** (que ainda não existem — o serviço **web** já existe e
  continua fora do controle deste stack, apenas referenciado), circuit breaker de
  deployment (rollback automático) nos serviços novos, e alarmes CloudWatch (CPU/memória
  da API, target health, CPU/storage/conexões do RDS) publicando num tópico SNS.
- `SeleconPortalPipelineStack` (`lib/pipeline-stack.ts`): CodePipeline com os 6 estágios
  exigidos — Source → Validate → BuildImages → Migrations → Deploy → SmokeTest, cada um
  com seu próprio projeto CodeBuild e buildspec (`buildspec-validate.yml`,
  `buildspec-images.yml`, `buildspec-migrations.yml`, `buildspec-deploy.yml`,
  `buildspec-smoke.yml`, todos na raiz do repositório) — condicionada a uma CodeConnection
  já autorizada (ver bloqueio abaixo).

As duas stacks são **independentes entre si** (nenhuma depende de outputs da outra via
`cdk.Fn.importValue`/props obrigatórias): `SeleconPortalPipelineStack` pode ser sintetizada
e implantada sozinha, mesmo antes de `SeleconPortalDevStack` existir. Isso resolve o
problema de "ovo e galinha" do primeiro deploy — ver `docs/ASSUMPTIONS.md`.

Nada aqui recria, substitui ou apaga o VPC, o cluster, o ALB ou o serviço `web` existentes.

## Caminho principal: pipeline CodePipeline + CodeBuild

Desde a introdução da pipeline, **`scripts/build-push-deploy-dev.sh` não é mais o caminho
principal de implantação** — ele foi rebaixado a ferramenta de recuperação manual (ver
banner no topo do próprio arquivo). O caminho principal é:

1. Configuração única, por um operador com credenciais reais no AWS CloudShell:
   ```bash
   scripts/bootstrap-codepipeline-dev.sh
   ```
   Esse script cria/reaproveita a AWS CodeConnection do GitHub, imprime o ARN e as
   instruções de autorização manual no Console (único passo humano real de todo o
   fluxo), espera o status ficar `AVAILABLE` e então sintetiza/implanta **somente**
   `SeleconPortalPipelineStack`. **Nunca faz `docker build`.**
2. A partir daí, todo `git push origin feat/fase-1-design-system` dispara a pipeline
   automaticamente (a `CodeStarConnectionsSourceAction` já registra o webhook
   necessário — nenhum passo adicional de configuração de trigger é preciso).
3. Os 6 estágios da pipeline (cada um com seu próprio projeto CodeBuild e buildspec):

   | Estágio      | Buildspec                  | O que faz |
   | ------------ | --------------------------- | --------- |
   | Source       | —                            | Checkout via CodeConnection |
   | Validate     | `buildspec-validate.yml`     | `pnpm install`, lint, typecheck, testes, build (Postgres/Redis efêmeros no próprio runner) |
   | BuildImages  | `buildspec-images.yml`       | Docker build dos 3 Dockerfiles, push para ECR com tag imutável do commit (`web-dev:<sha>` etc.) e tag `:dev` mutável, confirma os digests publicados |
   | Migrations   | `buildspec-migrations.yml`   | Registra uma task definition avulsa (`selecon-portal-dev-migrate`) com a imagem do commit e roda `prisma migrate deploy` via `aws ecs run-task` (o CodeBuild não tem acesso de rede ao RDS, que é privado à VPC); valida exit code e `prisma migrate status` |
   | Deploy       | `buildspec-deploy.yml`       | `cdk synth`/`cdk diff` (com verificação automática de mudanças destrutivas) e `cdk deploy` **somente** de `SeleconPortalDevStack`, seguido da atualização manual do serviço `web` (não gerenciado pelo CDK) para a mesma tag de imagem; espera todos os 3 serviços atingirem steady state |
   | SmokeTest    | `buildspec-smoke.yml`        | `GET /` e `GET /api/health/ready` contra o DNS do ALB — falha o build se a resposta não for HTTP 200 |

Nenhuma credencial de banco passa pelo ambiente do CodeBuild: as migrações rodam como uma
task Fargate avulsa dentro da VPC, usando os mesmos segredos do Secrets Manager já
configurados na task definition da api.

**Primeiro run da pipeline:** `SeleconPortalDevStack` ainda não existe até o estágio Deploy
rodar `cdk deploy` pela primeira vez. O estágio Migrations, que roda antes do Deploy,
detecta essa ausência e passa adiante sem erro (`exit 0`) nesse caso — migrações reais
passam a rodar a partir do segundo run em diante, preservando a ordem "migrar antes de
implantar código novo" em todos os runs subsequentes.

## Ferramentas de recuperação manual (não são mais o caminho principal)

| Script | Uso |
| ------ | --- |
| `scripts/check-aws-dev.sh` | Somente leitura — inventário do que já existe |
| `scripts/bootstrap-aws-dev.sh` | `cdk deploy` manual e isolado de `SeleconPortalDevStack` (assume que as imagens já existem no ECR; nunca faz build) |
| `scripts/build-push-deploy-dev.sh` | Build+push+deploy manual completo num único CloudShell (emergência, pipeline indisponível) |
| `scripts/rollback-ecs-dev.sh` | Reverte um serviço ECS para a task definition anterior (nunca desfaz migrações de banco) |

## Estado de validação (o que é real e o que não é)

O que **foi executado de fato** neste ambiente de desenvolvimento (evidência verificável,
não apenas declarada):

```
$ npx tsc --noEmit
(sem saída — 0 erros)

$ npx cdk synth SeleconPortalDevStack
(gera cdk.out/SeleconPortalDevStack.template.json — exit code 0, mesmo sem
 -c albListenerArn=... — os alarmes de target group ficam condicionados à mesma
 flag que cria a listener rule, para não tentar medir um target group "solto")

$ npx cdk synth SeleconPortalDevStack -c albListenerArn=<arn> -c alarmEmail=<endereço> -c imageTag=<sha>
(exit code 0 — cria a listener rule, os 2 alarmes de target group, a assinatura SNS, e
 aponta os 3 containers para a tag de imagem informada)

$ npx cdk synth SeleconPortalPipelineStack -c codeConnectionArn=<arn>
(exit code 0, mesmo sem webTargetGroupArn/apiTargetGroupArn — o estágio SmokeTest apenas
 pula a checagem de target health quando ausentes)
```

Bugs reais encontrados e corrigidos durante o desenvolvimento desta pipeline (documentados
em detalhe, com a técnica de verificação usada, em `docs/ASSUMPTIONS.md`):

1. Os alarmes de target group (`apiTargetGroup.metrics.healthyHostCount()`/
   `unhealthyHostCount()`) faziam o `cdk synth` falhar com `TargetGroupNeedsAttachedLoad`
   sempre que `albListenerArn` não era informado — corrigido movendo os dois alarmes para
   dentro do mesmo bloco condicional que cria a listener rule.
2. Um bug de precedência em `jq` (`.taskDefinition | .containerDefinitions =
   (.taskDefinition.containerDefinitions | ...)`) fazia a transformação de task definition
   falhar com `Cannot iterate over null (null)` — corrigido com o padrão
   `.taskDefinition as $td | $td | .containerDefinitions = ($td.containerDefinitions | ...)`.
3. Duas classes de bug de YAML nos buildspecs (colon+espaço virando mapeamento implícito;
   folding de linha quebrando continuação de bash com `\`) — encontradas sistematicamente
   parseando cada buildspec com `yaml.safe_load` e rodando `bash -n`/`shellcheck` no script
   reconstruído a partir dos `commands:`.

Isso comprova que o código compila e que os templates CloudFormation resultantes são
sintaticamente válidos — nenhuma dessas etapas faz chamadas à API da AWS (por isso não
exige credenciais reais).

O que **não foi executado** e continua bloqueado neste sandbox:

- `cdk bootstrap` / `cdk deploy` reais — exigem credenciais AWS reais (`aws sts
  get-caller-identity` retorna `InvalidClientTokenId` neste ambiente).
- Qualquer criação real de RDS, ElastiCache, S3, Secrets Manager, serviços ECS, pipeline,
  CodeConnection, ou execução real de `docker build`/`docker push` (`docker pull`/`docker
  run` retornam `403 Forbidden` do registry neste sandbox).

Nunca declare este código como "implantado" ou "funcionando na AWS" sem apresentar a saída
de um `cdk deploy` real (ARNs criados, `aws cloudformation describe-stacks`, etc.).

## Único bloqueio manual real do pipeline

A `CodeStarConnectionsSourceAction` (`lib/pipeline-stack.ts`) exige uma **AWS CodeConnection
para o GitHub já autorizada no console** — este é o único passo que não pode ser feito por
código (requer OAuth interativo no console da AWS). `scripts/bootstrap-codepipeline-dev.sh`
automatiza tudo em volta desse passo (cria/reaproveita a conexão, imprime o ARN, espera o
status ficar `AVAILABLE`) — só a autorização em si precisa ser feita manualmente:

1. Console AWS → Developer Tools → Settings → Connections (ou o link impresso pelo script).
2. Encontrar a conexão `selecon-portal-github-dev` → "Update pending connection".
3. Autorizar/instalar o GitHub App no repositório `Fernando-Carilo/novo-site-selecon`.
4. Confirmar — o status muda para `Available` e o script retoma automaticamente.

Sem uma conexão `AVAILABLE`, `bin/app.ts` pula a stack da pipeline e imprime um aviso — não
falha silenciosamente.

## Comandos (referência manual — o normal é usar os scripts acima)

```sh
cd infrastructure/cdk
pnpm install --ignore-workspace
npx tsc --noEmit
npx cdk synth SeleconPortalDevStack -c albListenerArn=<arn> -c alarmEmail=<endereço> -c imageTag=<sha>
npx cdk synth SeleconPortalPipelineStack -c codeConnectionArn=<arn>

# Só quando houver credenciais AWS reais — as duas stacks são independentes, podem ser
# implantadas em qualquer ordem:
npx cdk deploy SeleconPortalPipelineStack -c codeConnectionArn=<arn>
npx cdk deploy SeleconPortalDevStack -c albListenerArn=<arn> -c alarmEmail=<endereço> -c imageTag=<sha>
```

## Custos (DEV — seção 30 do prompt mestre)

Configuração deliberadamente econômica: `db.t4g.micro` sem Multi-AZ, `cache.t4g.micro` de
nó único, uma task por serviço, sem CloudFront/WAF nesta fase, retenção de logs de 14 dias,
lifecycle de 30 dias nos artefatos da pipeline. Os principais geradores de custo em DEV são
o RDS e o ElastiCache (cobrados por hora mesmo ociosos) — pare-os fora do horário de uso se
o custo precisar ser reduzido ainda mais.

## HTTPS, CloudFront e domínio (seção 25)

Não incluídos nesta primeira versão do CDK — a URL do ALB (HTTP) permanece a forma de
acesso enquanto o domínio definitivo (`portal-dev.selecon.org.br` ou equivalente) e o
certificado ACM não forem confirmados. Adicionar depois de validado: `acm.Certificate`,
`cloudfront.Distribution` apontando para o ALB como origem, `wafv2.CfnWebACL` associado à
distribution, e a alteração de DNS restrita ao subdomínio DEV.
