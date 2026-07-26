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

Nada aqui recria, substitui ou apaga o VPC, o cluster, o ALB ou o serviço `web` existentes.

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

$ npx cdk synth SeleconPortalDevStack -c albListenerArn=<arn> -c alarmEmail=<endereço>
(exit code 0 — cria a listener rule, os 2 alarmes de target group e a assinatura SNS)

$ npx cdk synth SeleconPortalPipelineStack -c codeConnectionArn=<arn>
(exit code 0, mesmo sem databaseSecretArn/databaseHost/apiTargetGroupArn — cada um
 degrada com um aviso em vez de falhar)

$ npx cdk synth SeleconPortalPipelineStack -c codeConnectionArn=<arn> \
    -c databaseSecretArn=<arn> -c databaseHost=<endpoint> -c apiTargetGroupArn=<arn>
(exit code 0 — todos os 6 estágios com as variáveis de ambiente completas)
```

Um bug real foi encontrado e corrigido durante essa validação: os alarmes de target
group (`apiTargetGroup.metrics.healthyHostCount()`/`unhealthyHostCount()`) faziam o
`cdk synth` falhar com `TargetGroupNeedsAttachedLoad` sempre que `albListenerArn` não
era informado — porque o CDK não permite calcular métricas de um target group ainda não
anexado a um load balancer. Corrigido movendo esses dois alarmes para dentro do mesmo
bloco condicional que cria a listener rule.

Isso comprova que o código compila e que os templates CloudFormation resultantes são
sintaticamente válidos — nenhuma dessas etapas faz chamadas à API da AWS (por isso não
exige credenciais reais).

O que **não foi executado** e continua bloqueado neste sandbox:

- `cdk bootstrap` / `cdk deploy` reais — exigem credenciais AWS reais. Este ambiente só
  possui um placeholder de proxy (`AWS_ACCESS_KEY_ID` com 14 caracteres, chaves reais
  AKIA/ASIA têm 20+) e não tem `aws-cli` instalado.
- Qualquer criação real de RDS, ElastiCache, S3, Secrets Manager, serviços ECS ou
  pipeline.

Nunca declare este código como "implantado" ou "funcionando na AWS" sem apresentar a saída
de um `cdk deploy` real (ARNs criados, `aws cloudformation describe-stacks`, etc.).

## Único bloqueio manual real do pipeline

A `CodeStarConnectionsSourceAction` (`lib/pipeline-stack.ts`) exige uma **AWS CodeConnection
para o GitHub já autorizada no console** — este é o único passo que não pode ser feito por
código (requer OAuth interativo no console da AWS). Passos:

1. Console AWS → Developer Tools → Settings → Connections → Create connection → GitHub.
2. Autorizar o app na organização `Fernando-Carilo`.
3. Copiar o ARN gerado (`arn:aws:codeconnections:us-east-1:518825425828:connection/...`).
4. Sintetizar/implantar com `cdk deploy SeleconPortalPipelineStack -c codeConnectionArn=<arn>`.

Sem esse ARN, `bin/app.ts` pula a stack da pipeline e imprime um aviso — não falha
silenciosamente.

## Antes do primeiro `cdk deploy` real

`config/dev.ts` documenta cada valor informado como estado atual da conta AWS. Confirme
com a AWS real antes de implantar (nenhum destes comandos foi executado neste sandbox):

```sh
aws cloudformation describe-stacks --stack-name selecon-portal-dev-preview
aws ec2 describe-subnets --subnet-ids subnet-087fddfd8000fe905 subnet-0cb67ad4109c9151f
aws elbv2 describe-load-balancers --names selecon-portal-dev-alb
aws elbv2 describe-listeners --load-balancer-arn <arn-do-alb>   # necessário para -c albListenerArn=...
```

## Comandos

```sh
cd infrastructure/cdk
pnpm install --ignore-workspace
npx tsc --noEmit
npx cdk synth SeleconPortalDevStack -c albListenerArn=<arn> -c alarmEmail=<endereço>
npx cdk synth SeleconPortalPipelineStack -c codeConnectionArn=<arn> \
  -c databaseSecretArn=<arn> -c databaseHost=<endpoint> -c apiTargetGroupArn=<arn>

# Só quando houver credenciais AWS reais e a CodeConnection autorizada — nessa ordem
# (a pipeline depende das saídas DatabaseSecretArn/DatabaseEndpoint/ApiTargetGroupArn
# da primeira stack):
npx cdk deploy SeleconPortalDevStack -c albListenerArn=<arn> -c alarmEmail=<endereço>
# copie DatabaseSecretArn, DatabaseEndpoint e ApiTargetGroupArn do output acima, então:
npx cdk deploy SeleconPortalPipelineStack -c codeConnectionArn=<arn> \
  -c databaseSecretArn=<arn> -c databaseHost=<endpoint> -c apiTargetGroupArn=<arn>
```

Veja `scripts/bootstrap-aws-dev.sh` na raiz do repositório para a sequência completa e
guiada (confirmação explícita antes de cada `cdk deploy`).

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
