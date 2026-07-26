/**
 * Parâmetros do ambiente DEV — identificadores de recursos já provisionados manualmente
 * (fora deste CDK) via CloudFormation (stack `selecon-portal-dev-preview`, CREATE_COMPLETE).
 *
 * Estratégia adotada (seção 20 do prompt mestre): opção B — referenciar os recursos
 * existentes por atributos explícitos (sem `fromLookup`, que exigiria uma chamada de API
 * AWS ao sintetizar) e gerenciar por este CDK apenas os recursos NOVOS do portal (RDS,
 * Redis/Valkey, S3, Secrets Manager, IAM, CloudWatch, CodeBuild/CodePipeline). Nada aqui
 * recria ou substitui o cluster ECS, o ALB ou o serviço `selecon-portal-dev-web` já
 * existentes — eles são apenas referenciados.
 *
 * Estes valores foram informados pelo solicitante como o estado real da conta AWS DEV.
 * Este código nunca foi executado neste sandbox (sem credenciais AWS reais disponíveis —
 * ver docs/OPERATIONS_RUNBOOK.md, seção "Bloqueios"). Antes do primeiro `cdk deploy` real,
 * confirme cada valor com `aws cloudformation describe-stacks --stack-name
 * selecon-portal-dev-preview` e ajuste o que divergir.
 */
export const devConfig = {
  env: {
    account: "518825425828",
    region: "us-east-1",
  },

  vpcId: "vpc-0b5fb2dcfb604f371",
  publicSubnetIds: ["subnet-087fddfd8000fe905", "subnet-0cb67ad4109c9151f"],
  /** Zonas de disponibilidade correspondentes às subnets acima, na mesma ordem — preencher
   * a partir de `aws ec2 describe-subnets` antes do primeiro deploy real. */
  availabilityZones: ["us-east-1a", "us-east-1b"],

  ecsClusterName: "selecon-portal-dev",
  existingWebServiceName: "selecon-portal-dev-web",

  albSecurityGroupId: "sg-01d2d938d49e1d6c0",
  webTaskSecurityGroupId: "sg-0a08c3436d5c92aa2",

  ecrRepositories: {
    web: "selecon-portal/web-dev",
    api: "selecon-portal/api-dev",
    worker: "selecon-portal/worker-dev",
  },

  /** Nome do banco de dados novo e exclusivo do portal — nunca reutilizar os RDS
   * existentes de outros sistemas (ver docs/OPERATIONS_RUNBOOK.md). */
  databaseName: "selecon_portal_dev",
  dbInstanceIdentifier: "selecon-portal-dev",

  redisClusterId: "selecon-portal-dev",

  s3BucketNamePrefix: "selecon-portal-dev-uploads",

  logRetentionDays: 14,

  tags: {
    Projeto: "portal-selecon",
    Ambiente: "dev",
    ManagedBy: "cdk",
  },
} as const;

export type DevConfig = typeof devConfig;
