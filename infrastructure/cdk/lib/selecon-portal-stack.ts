import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as rds from "aws-cdk-lib/aws-rds";
import * as elasticache from "aws-cdk-lib/aws-elasticache";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as logs from "aws-cdk-lib/aws-logs";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import type { DevConfig } from "../config/dev";

export interface SeleconPortalStackProps extends cdk.StackProps {
  config: DevConfig;
}

/**
 * Recursos NOVOS e exclusivos do Portal Selecon (Lote 3/4 do prompt mestre de
 * infraestrutura). Não cria nem substitui o VPC, o cluster ECS, o ALB ou o serviço
 * `selecon-portal-dev-web` — todos são apenas referenciados por atributos explícitos
 * (estratégia B da seção 20: "referenciar por parâmetros/lookup sem destruir").
 *
 * IMPORTANTE: este código nunca foi implantado (`cdk deploy`) neste sandbox — não há
 * credenciais AWS reais disponíveis para isso (ver docs/OPERATIONS_RUNBOOK.md). Foi
 * validado apenas com `cdk synth`/`tsc`, que não fazem chamadas à API da AWS porque
 * todos os recursos existentes são importados via atributos (não via `fromLookup`).
 */
export class SeleconPortalStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SeleconPortalStackProps) {
    super(scope, id, props);
    const { config } = props;

    cdk.Tags.of(this).add("Projeto", config.tags.Projeto);
    cdk.Tags.of(this).add("Ambiente", config.tags.Ambiente);
    cdk.Tags.of(this).add("ManagedBy", config.tags.ManagedBy);

    // --- Rede existente (importada, nunca criada aqui) ---
    const vpc = ec2.Vpc.fromVpcAttributes(this, "ExistingVpc", {
      vpcId: config.vpcId,
      availabilityZones: [...config.availabilityZones],
      publicSubnetIds: [...config.publicSubnetIds],
    });

    const webTaskSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "ExistingWebTaskSecurityGroup",
      config.webTaskSecurityGroupId,
      { mutable: false },
    );

    const cluster = ecs.Cluster.fromClusterAttributes(this, "ExistingCluster", {
      clusterName: config.ecsClusterName,
      vpc,
      securityGroups: [],
    });

    const webRepo = ecr.Repository.fromRepositoryName(this, "WebRepo", config.ecrRepositories.web);
    const apiRepo = ecr.Repository.fromRepositoryName(this, "ApiRepo", config.ecrRepositories.api);
    const workerRepo = ecr.Repository.fromRepositoryName(
      this,
      "WorkerRepo",
      config.ecrRepositories.worker,
    );

    // --- Security groups NOVOS para os recursos de dados (isolados do resto da conta) ---
    const dataSecurityGroup = new ec2.SecurityGroup(this, "DataSecurityGroup", {
      vpc,
      description: "Acesso a RDS e Redis do Portal Selecon — apenas das tasks do portal",
      allowAllOutbound: false,
    });
    dataSecurityGroup.addIngressRule(
      webTaskSecurityGroup,
      ec2.Port.tcp(5432),
      "PostgreSQL a partir das tasks do portal (web/api/worker)",
    );
    dataSecurityGroup.addIngressRule(
      webTaskSecurityGroup,
      ec2.Port.tcp(6379),
      "Redis/Valkey a partir das tasks do portal (web/api/worker)",
    );

    // --- PostgreSQL (RDS) — banco exclusivo do portal, nunca reutiliza os RDS existentes
    // de outros sistemas (atendimento-selecon-postgres, certamedb, database-1,
    // nexaprova-postgres, selecon-denuncias-db) ---
    const dbCredentialsSecret = new secretsmanager.Secret(this, "DatabaseCredentials", {
      secretName: `selecon-portal/${config.tags.Ambiente}/database`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: "selecon_portal" }),
        generateStringKey: "password",
        excludePunctuation: true,
        passwordLength: 32,
      },
    });

    const database = new rds.DatabaseInstance(this, "Database", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      instanceIdentifier: config.dbInstanceIdentifier,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC }, // ambiente DEV usa as subnets
      // públicas já provisionadas; sem acesso público real (publiclyAccessible: false +
      // security group restrito). Promover para subnets privadas dedicadas ao migrar
      // para HML/PRD (ver docs/MIGRATION_PLAN.md).
      publiclyAccessible: false,
      securityGroups: [dataSecurityGroup],
      credentials: rds.Credentials.fromSecret(dbCredentialsSecret),
      databaseName: config.databaseName,
      allocatedStorage: 20,
      storageEncrypted: true,
      multiAz: false,
      backupRetention: cdk.Duration.days(3),
      deletionProtection: false, // aceitável apenas em DEV (seção 14 do prompt mestre)
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
    });

    // --- Redis/Valkey (ElastiCache) — nó único, sem replicação, adequado a DEV ---
    const cacheSubnetGroup = new elasticache.CfnSubnetGroup(this, "CacheSubnetGroup", {
      description: "Subnets para o Redis/Valkey do Portal Selecon (DEV)",
      subnetIds: [...config.publicSubnetIds],
    });

    const cacheCluster = new elasticache.CfnCacheCluster(this, "CacheCluster", {
      cacheNodeType: "cache.t4g.micro",
      engine: "valkey",
      numCacheNodes: 1,
      clusterName: config.redisClusterId,
      cacheSubnetGroupName: cacheSubnetGroup.ref,
      vpcSecurityGroupIds: [dataSecurityGroup.securityGroupId],
    });

    // --- S3 — uploads (documentos de concursos, anexos de atendimento/denúncias, banners) ---
    const uploadsBucket = new s3.Bucket(this, "UploadsBucket", {
      bucketName: `${config.s3BucketNamePrefix}-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      lifecycleRules: [
        {
          id: "abort-incomplete-uploads",
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        },
      ],
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: ["*"], // restringir à origem definitiva do portal ao confirmar o domínio
          allowedHeaders: ["*"],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // --- Secrets adicionais (sessão, integrações) ---
    const appSecrets = new secretsmanager.Secret(this, "AppSecrets", {
      secretName: `selecon-portal/${config.tags.Ambiente}/app`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: "sessionSecret",
        excludePunctuation: true,
        passwordLength: 48,
      },
    });

    // --- Log groups (um por serviço, seção 19) ---
    const webLogGroup = new logs.LogGroup(this, "WebLogGroup", {
      logGroupName: `/selecon-portal/${config.tags.Ambiente}/web`,
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const apiLogGroup = new logs.LogGroup(this, "ApiLogGroup", {
      logGroupName: `/selecon-portal/${config.tags.Ambiente}/api`,
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const workerLogGroup = new logs.LogGroup(this, "WorkerLogGroup", {
      logGroupName: `/selecon-portal/${config.tags.Ambiente}/worker`,
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // --- IAM: role de execução (pull de imagem + logs) e role de tarefa (acesso a
    // Secrets Manager e S3, mínimo privilégio) ---
    const executionRole = new iam.Role(this, "TaskExecutionRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonECSTaskExecutionRolePolicy"),
      ],
    });
    dbCredentialsSecret.grantRead(executionRole);
    appSecrets.grantRead(executionRole);

    const taskRole = new iam.Role(this, "TaskRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });
    uploadsBucket.grantReadWrite(taskRole);
    dbCredentialsSecret.grantRead(taskRole);
    appSecrets.grantRead(taskRole);

    // --- Task definitions (web/api/worker) — apontam para o commit SHA via parâmetro de
    // deploy (o pipeline substitui a tag da imagem; ver infrastructure/cdk/lib/pipeline-stack.ts
    // e buildspec.yml na raiz do repositório). Nenhum serviço novo é criado para "web" —
    // o serviço `selecon-portal-dev-web` já existe e continua gerenciado externamente
    // (o pipeline atualiza sua task definition). Os serviços de api e worker, que ainda
    // não existem, são criados aqui. ---
    const webTaskDefinition = new ecs.FargateTaskDefinition(this, "WebTaskDefinition", {
      family: "selecon-portal-dev-web",
      cpu: 256,
      memoryLimitMiB: 512,
      executionRole,
      taskRole,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });
    webTaskDefinition.addContainer("web", {
      image: ecs.ContainerImage.fromEcrRepository(webRepo, "dev"),
      portMappings: [{ containerPort: 3000 }],
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: "web", logGroup: webLogGroup }),
      environment: { NODE_ENV: "production", HOSTNAME: "0.0.0.0", PORT: "3000" },
    });

    const apiTaskDefinition = new ecs.FargateTaskDefinition(this, "ApiTaskDefinition", {
      family: "selecon-portal-dev-api",
      cpu: 256,
      memoryLimitMiB: 512,
      executionRole,
      taskRole,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });
    apiTaskDefinition.addContainer("api", {
      image: ecs.ContainerImage.fromEcrRepository(apiRepo, "dev"),
      portMappings: [{ containerPort: 3001 }],
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: "api", logGroup: apiLogGroup }),
      environment: { NODE_ENV: "production", API_PORT: "3001" },
      secrets: {
        DATABASE_URL: ecs.Secret.fromSecretsManager(dbCredentialsSecret),
        DEV_SESSION_SECRET: ecs.Secret.fromSecretsManager(appSecrets, "sessionSecret"),
      },
    });

    const workerTaskDefinition = new ecs.FargateTaskDefinition(this, "WorkerTaskDefinition", {
      family: "selecon-portal-dev-worker",
      cpu: 256,
      memoryLimitMiB: 512,
      executionRole,
      taskRole,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });
    workerTaskDefinition.addContainer("worker", {
      image: ecs.ContainerImage.fromEcrRepository(workerRepo, "dev"),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: "worker", logGroup: workerLogGroup }),
      environment: { NODE_ENV: "production" },
      secrets: {
        DATABASE_URL: ecs.Secret.fromSecretsManager(dbCredentialsSecret),
      },
    });

    // --- ALB existente — referenciado (não recriado). A regra /api/* aponta para o novo
    // serviço da API; o serviço web (já existente) continua atendendo o restante. ---
    const albSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "ExistingAlbSecurityGroup",
      config.albSecurityGroupId,
      { mutable: false },
    );

    const apiService = new ecs.FargateService(this, "ApiService", {
      cluster,
      taskDefinition: apiTaskDefinition,
      desiredCount: 1,
      securityGroups: [webTaskSecurityGroup],
      assignPublicIp: true, // subnets públicas nesta fase DEV (ver nota do RDS acima)
      serviceName: "selecon-portal-dev-api",
    });

    const workerService = new ecs.FargateService(this, "WorkerService", {
      cluster,
      taskDefinition: workerTaskDefinition,
      desiredCount: 1,
      securityGroups: [webTaskSecurityGroup],
      assignPublicIp: true,
      serviceName: "selecon-portal-dev-worker",
    });

    const apiTargetGroup = new elbv2.ApplicationTargetGroup(this, "ApiTargetGroup", {
      vpc,
      port: 3001,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: { path: "/health/ready", healthyHttpCodes: "200" },
      targets: [apiService],
    });

    // A listener rule abaixo assume que o listener HTTP:80 do ALB existente já foi
    // criado fora deste CDK (a stack de preview via CloudFormation). Referencie o ARN
    // real do listener (obtido via `aws elbv2 describe-listeners`) antes do deploy —
    // preenchido como parâmetro de contexto para não fazer lookup em tempo de synth.
    const existingListenerArn = this.node.tryGetContext("albListenerArn") as string | undefined;
    if (existingListenerArn) {
      const listener = elbv2.ApplicationListener.fromApplicationListenerAttributes(
        this,
        "ExistingHttpListener",
        {
          listenerArn: existingListenerArn,
          securityGroup: albSecurityGroup,
        },
      );
      new elbv2.ApplicationListenerRule(this, "ApiListenerRule", {
        listener,
        priority: 10,
        conditions: [elbv2.ListenerCondition.pathPatterns(["/api/*"])],
        action: elbv2.ListenerAction.forward([apiTargetGroup]),
      });
    } else {
      new cdk.CfnOutput(this, "MissingListenerArnWarning", {
        value:
          "albListenerArn não informado via contexto (-c albListenerArn=...) — a regra /api/* não foi criada. Rode `aws elbv2 describe-listeners --load-balancer-arn <arn-do-alb>` para obter o ARN.",
      });
    }

    new cdk.CfnOutput(this, "DatabaseSecretArn", { value: dbCredentialsSecret.secretArn });
    new cdk.CfnOutput(this, "AppSecretsArn", { value: appSecrets.secretArn });
    new cdk.CfnOutput(this, "UploadsBucketName", { value: uploadsBucket.bucketName });
    new cdk.CfnOutput(this, "CacheClusterEndpoint", {
      value: cacheCluster.attrRedisEndpointAddress,
    });
    new cdk.CfnOutput(this, "DatabaseEndpoint", { value: database.dbInstanceEndpointAddress });
    new cdk.CfnOutput(this, "ApiServiceName", { value: apiService.serviceName });
    new cdk.CfnOutput(this, "WorkerServiceName", { value: workerService.serviceName });
    new cdk.CfnOutput(this, "WebTaskDefinitionFamily", { value: webTaskDefinition.family });
  }
}
