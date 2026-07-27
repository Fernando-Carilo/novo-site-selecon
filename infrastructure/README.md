# Infraestrutura como código — Portal Selecon (DEV)

## Mudança de arquitetura (leia antes de qualquer coisa)

Esta pasta continha, até uma rodada anterior deste projeto, uma stack AWS CDK
completa (VPC referenciado por atributos, ECS Fargate para os serviços api/worker,
RDS, ElastiCache, CodePipeline com 6 estágios). **Essa arquitetura foi abandonada por
decisão explícita** — ver `docs/ASSUMPTIONS.md` — em favor do padrão já usado nos
outros projetos do Instituto Selecon:

```
GitHub -> AWS CodePipeline -> AWS CodeBuild -> AWS Elastic Beanstalk (Docker)
```

O código do CDK (`infrastructure/cdk/`) e os 5 `buildspec-*.yml` da arquitetura
anterior foram **removidos** deste repositório (não apenas descontinuados — de fato
apagados, ver histórico do Git se precisar consultá-los). Esta pasta agora contém
apenas templates **CloudFormation** puros (sem CDK), usados pelos scripts de
bootstrap na raiz do repositório.

**Recursos da arquitetura anterior (VPC `vpc-0b5fb2dcfb604f371`, cluster ECS
`selecon-portal-dev`, ALB `selecon-portal-dev-alb`, serviço `selecon-portal-dev-web`,
os 3 repositórios ECR `selecon-portal/{web,api,worker}-dev`) não foram excluídos —
nada neste repositório os toca, criam ou removem automaticamente.** Continuam
existindo na conta até que um operador decida, manualmente e fora deste fluxo,
desativá-los.

## Arquitetura atual

```
Fernando-Carilo/novo-site-selecon (branch feat/fase-1-design-system)
        │  git push
        ▼
  AWS CodeConnection (já existente e autorizada)
        │
        ▼
  CodePipeline "selecon-portal-dev"  (infrastructure/cloudformation/pipeline.yml)
   ├─ Source  — CodeStarSourceConnection
   ├─ Build   — CodeBuild (buildspec.yml na raiz): lint/typecheck/test, build,
   │            docker build (container único web+api), push para ECR,
   │            gera Dockerrun.aws.json
   └─ Deploy  — ElasticBeanstalk (Application "selecon-portal",
                Environment "selecon-portal-dev")
                        │
                        ▼
        RDS PostgreSQL  (infrastructure/cloudformation/rds.yml)
```

Duas stacks CloudFormation, independentes entre si:

- **`infrastructure/cloudformation/rds.yml`** → stack `selecon-portal-dev-rds`: RDS
  PostgreSQL (`db.t4g.micro`, sem Multi-AZ, `DeletionPolicy: Snapshot`), Secrets
  Manager (senha gerada, nunca no Git), `AppSecurityGroup` (atribuído às instâncias
  EC2 do Elastic Beanstalk) e `DataSecurityGroup` (RDS, só aceita conexões do
  `AppSecurityGroup`).
- **`infrastructure/cloudformation/pipeline.yml`** → stack
  `selecon-portal-dev-pipeline`: repositório ECR único (`selecon-portal/app-dev`),
  bucket de artefatos S3, CodeBuild, CodePipeline (3 estágios), roles IAM. Referencia
  a CodeConnection já existente por ARN — nunca cria uma nova.

A Application/Environment do Elastic Beanstalk **não** são geridos por CloudFormation
neste momento — são criados/atualizados via AWS CLI por
`scripts/bootstrap-elasticbeanstalk-dev.sh` (recursos gerenciados por CloudFormation
para Elastic Beanstalk exigem lidar com um schema de `OptionSettings` propenso a
efeitos colaterais estranhos em atualizações; a AWS CLI dá controle mais direto e
mais fácil de auditar para uma única instância DEV).

## Container único (web + api)

`Dockerfile` (raiz do repositório) builda `apps/web` (Next.js, output standalone) e
`apps/api` (NestJS + Fastify) na mesma imagem, rodando lado a lado — ver
`docker/entrypoint.sh`. `apps/worker` (BullMQ) fica fora deste ambiente DEV: nenhuma
fila assíncrona real é processada em produção ainda, e não há ElastiCache
provisionado. O container roda um `redis-server` local efêmero só para satisfazer a
variável `REDIS_URL` (obrigatória no schema de env de `apps/api`) e o endpoint
`/api/health` — nunca um cache compartilhado ou persistente. Ver `docs/ASSUMPTIONS.md`
para a justificativa completa.

Os Dockerfiles antigos (`apps/web/Dockerfile`, `apps/api/Dockerfile`,
`apps/worker/Dockerfile`) continuam existindo, mas só para desenvolvimento/teste local
(`pnpm docker:build`, `pnpm docker:test`) — não são mais usados por nenhuma pipeline
AWS.

## Ordem de bootstrap (uma única vez)

```bash
scripts/bootstrap-rds-dev.sh              # 1. RDS + security groups
scripts/bootstrap-elasticbeanstalk-dev.sh # 2. Application + Environment do EB
scripts/bootstrap-codepipeline-eb-dev.sh  # 3. Pipeline (ECR + CodeBuild + CodePipeline)
```

Cada script mostra o plano (recursos a criar/atualizar/reutilizar, via change set do
CloudFormation quando aplicável) e pede confirmação explícita (`digite SIM em
maiúsculas`) antes de qualquer ação real. Nenhum dos três cria, altera ou remove
VPC/ALB/cluster ECS/serviço web existentes.

Depois dos três, o fluxo normal é `git push origin feat/fase-1-design-system` — a
pipeline builda, testa, publica a imagem e implanta automaticamente.

## Rollback

- **Aplicação (versão implantada):** `scripts/rollback-eb-dev.sh` — volta o
  Environment para a versão anterior do Elastic Beanstalk. Nunca desfaz migrações de
  banco automaticamente.
- **Infraestrutura (RDS, pipeline):** o CloudFormation reverte automaticamente
  (`UPDATE_ROLLBACK_COMPLETE`) qualquer `execute-change-set` que falhe durante a
  aplicação. O RDS nunca é excluído sem snapshot (`DeletionPolicy: Snapshot`).

## Migrações do Prisma

`prisma migrate deploy` roda **dentro do próprio container**, no boot, antes de
`apps/api`/`apps/web` começarem a atender requisições — controlado por
`pg_advisory_lock` (ver `apps/api/src/scripts/run-migrations.ts` e
`docker/entrypoint.sh`). Se a migração falhar, o container inteiro falha (o Elastic
Beanstalk nunca marca uma implantação com schema quebrado como bem-sucedida). Nunca
usa `ecs run-task` (não há mais ECS nesta arquitetura).

## Validação (sem tocar na AWS)

```sh
# YAML dos templates CloudFormation e do buildspec
python3 -c "import yaml; yaml.safe_load(open('infrastructure/cloudformation/rds.yml'))"
python3 -c "import yaml; yaml.safe_load(open('infrastructure/cloudformation/pipeline.yml'))"
cfn-lint infrastructure/cloudformation/rds.yml infrastructure/cloudformation/pipeline.yml

# Scripts
bash -n scripts/bootstrap-rds-dev.sh && shellcheck scripts/bootstrap-rds-dev.sh
bash -n scripts/bootstrap-elasticbeanstalk-dev.sh && shellcheck scripts/bootstrap-elasticbeanstalk-dev.sh
bash -n scripts/bootstrap-codepipeline-eb-dev.sh && shellcheck scripts/bootstrap-codepipeline-eb-dev.sh
bash -n scripts/rollback-eb-dev.sh && shellcheck scripts/rollback-eb-dev.sh
bash -n scripts/check-aws-dev.sh && shellcheck scripts/check-aws-dev.sh
bash -n docker/entrypoint.sh && shellcheck docker/entrypoint.sh
```

Nada neste repositório executa `aws`, `docker build/push` ou qualquer chamada real à
AWS a partir deste sandbox de desenvolvimento — todos os comandos acima rodam
localmente, sem credenciais reais.

## Custos (DEV)

Configuração deliberadamente econômica: `db.t4g.micro` sem Multi-AZ, uma única
instância EC2 `t3.micro` no Elastic Beanstalk (sem load balancer), sem
CloudFront/WAF nesta fase, lifecycle de 30 dias nos artefatos da pipeline e nas
imagens do ECR (mantém as 20 mais recentes). O RDS é o principal gerador de custo
contínuo (cobrado por hora mesmo ocioso).
