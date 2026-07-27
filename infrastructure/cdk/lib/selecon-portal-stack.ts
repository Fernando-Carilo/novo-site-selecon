import * as cdk from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cloudwatch_actions from "aws-cdk-lib/aws-cloudwatch-actions";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as rds from "aws-cdk-lib/aws-rds";
import * as elasticache from "aws-cdk-lib/aws-elasticache";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as logs from "aws-cdk-lib/aws-logs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as servicediscovery from "aws-cdk-lib/aws-servicediscovery";
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

    // Tag imutável da imagem a implantar (commit SHA curto, resolvido pela pipeline em
    // buildspec-images.yml) — "dev" só serve de fallback para `cdk synth`/`cdk diff`
    // manuais sem contexto (nunca usado pela pipeline real, que sempre passa
    // -c imageTag=<commit>). As task definitions nunca apontam para uma tag mutável em
    // implantações reais — ver docs/ASSUMPTIONS.md.
    const imageTag = (this.node.tryGetContext("imageTag") as string | undefined) ?? "dev";

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
      image: ecs.ContainerImage.fromEcrRepository(webRepo, imageTag),
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
      image: ecs.ContainerImage.fromEcrRepository(apiRepo, imageTag),
      portMappings: [{ containerPort: 3001 }],
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: "api", logGroup: apiLogGroup }),
      environment: {
        NODE_ENV: "production",
        API_PORT: "3001",
        // REDIS_URL é obrigatório em packages/config/src/env.ts (Zod) — sem ele o
        // container falha na validação de env já no boot (EssentialContainerExited).
        // Não é sensível (sem authToken configurado no cache cluster), por isso vai em
        // "environment", não em "secrets".
        REDIS_URL: `redis://${cacheCluster.attrRedisEndpointAddress}:${cacheCluster.attrRedisEndpointPort}`,
      },
      // O segredo do RDS (após o attachment automático feito pela integração
      // Secrets Manager + RDS) contém host/port/dbname/username/password como campos
      // separados de um único JSON — não uma connection string pronta. O ECS Secret só
      // mapeia UM campo por variável de ambiente, então cada pedaço vai para sua própria
      // variável; `packages/db/src/client.ts` monta a `DATABASE_URL` real a partir delas
      // antes de instanciar o Prisma Client.
      secrets: {
        DB_HOST: ecs.Secret.fromSecretsManager(dbCredentialsSecret, "host"),
        DB_PORT: ecs.Secret.fromSecretsManager(dbCredentialsSecret, "port"),
        DB_NAME: ecs.Secret.fromSecretsManager(dbCredentialsSecret, "dbname"),
        DB_USER: ecs.Secret.fromSecretsManager(dbCredentialsSecret, "username"),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(dbCredentialsSecret, "password"),
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
      image: ecs.ContainerImage.fromEcrRepository(workerRepo, imageTag),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: "worker", logGroup: workerLogGroup }),
      environment: {
        NODE_ENV: "production",
        REDIS_URL: `redis://${cacheCluster.attrRedisEndpointAddress}:${cacheCluster.attrRedisEndpointPort}`,
      },
      secrets: {
        DB_HOST: ecs.Secret.fromSecretsManager(dbCredentialsSecret, "host"),
        DB_PORT: ecs.Secret.fromSecretsManager(dbCredentialsSecret, "port"),
        DB_NAME: ecs.Secret.fromSecretsManager(dbCredentialsSecret, "dbname"),
        DB_USER: ecs.Secret.fromSecretsManager(dbCredentialsSecret, "username"),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(dbCredentialsSecret, "password"),
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

    // --- Descoberta de serviço privada (DNS via Cloud Map) — apps/web fala com apps/api
    // servidor-a-servidor (nunca pelo navegador; ver apps/web/app/api/[...path]/route.ts).
    // Como web e api rodam em tasks Fargate separadas (sem localhost em comum), o serviço
    // web (já existente, gerenciado fora deste CDK) precisa de um endereço interno estável
    // para a API — daí este namespace de DNS privado associado à VPC. É resolvível por
    // qualquer recurso da VPC automaticamente (nenhuma mudança adicional é necessária no
    // serviço web existente para RESOLVER o nome; só sua variável de ambiente
    // API_INTERNAL_URL precisa apontar para cá — ver scripts/build-push-deploy-dev.sh).
    const serviceDiscoveryNamespace = new servicediscovery.PrivateDnsNamespace(
      this,
      "ServiceDiscoveryNamespace",
      { name: "selecon-portal.internal", vpc },
    );

    const apiService = new ecs.FargateService(this, "ApiService", {
      cluster,
      taskDefinition: apiTaskDefinition,
      desiredCount: 1,
      securityGroups: [webTaskSecurityGroup],
      assignPublicIp: true, // subnets públicas nesta fase DEV (ver nota do RDS acima)
      serviceName: "selecon-portal-dev-api",
      // Rollback automático (seção 17) — se a nova revisão da task não atingir o
      // steady state, o ECS reverte para a revisão anterior sozinho.
      circuitBreaker: { enable: true, rollback: true },
      cloudMapOptions: {
        cloudMapNamespace: serviceDiscoveryNamespace,
        name: "api",
        dnsRecordType: servicediscovery.DnsRecordType.A,
      },
    });

    const workerService = new ecs.FargateService(this, "WorkerService", {
      cluster,
      taskDefinition: workerTaskDefinition,
      desiredCount: 1,
      securityGroups: [webTaskSecurityGroup],
      assignPublicIp: true,
      serviceName: "selecon-portal-dev-worker",
      circuitBreaker: { enable: true, rollback: true },
    });

    const apiTargetGroup = new elbv2.ApplicationTargetGroup(this, "ApiTargetGroup", {
      vpc,
      port: 3001,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: { path: "/api/health/ready", healthyHttpCodes: "200" },
      targets: [apiService],
    });

    // --- Observabilidade: alarmes mínimos (seção 20) — definido antes da listener rule
    // porque os alarmes de target group só podem ser criados depois que o target group
    // está de fato anexado a um load balancer (a API do CDK lança erro em
    // `.metrics.*` num target group "solto"). ---
    const alarmTopic = new sns.Topic(this, "AlarmTopic", {
      topicName: `selecon-portal-${config.tags.Ambiente}-alarms`,
    });
    const alarmEmail = this.node.tryGetContext("alarmEmail") as string | undefined;
    if (alarmEmail) {
      alarmTopic.addSubscription(new subscriptions.EmailSubscription(alarmEmail));
    } else {
      new cdk.CfnOutput(this, "MissingAlarmEmailWarning", {
        value:
          "alarmEmail não informado via contexto — nenhuma assinatura foi criada no tópico de alarmes. Passe -c alarmEmail=<endereço> ou assine o SNS topic manualmente depois do deploy.",
      });
    }

    function alarmAction(alarm: cloudwatch.Alarm) {
      alarm.addAlarmAction(new cloudwatch_actions.SnsAction(alarmTopic));
    }

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

      // Só existem depois que o target group está anexado ao listener acima.
      alarmAction(
        new cloudwatch.Alarm(this, "ApiTaskCountLowAlarm", {
          alarmName: `selecon-portal-${config.tags.Ambiente}-api-running-tasks-low`,
          metric: apiTargetGroup.metrics.healthyHostCount({ period: cdk.Duration.minutes(1) }),
          threshold: 1,
          evaluationPeriods: 2,
          comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
        }),
      );
      alarmAction(
        new cloudwatch.Alarm(this, "ApiTargetUnhealthyAlarm", {
          alarmName: `selecon-portal-${config.tags.Ambiente}-api-target-unhealthy`,
          metric: apiTargetGroup.metrics.unhealthyHostCount({ period: cdk.Duration.minutes(1) }),
          threshold: 0,
          evaluationPeriods: 2,
          comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        }),
      );
    } else {
      new cdk.CfnOutput(this, "MissingListenerArnWarning", {
        value:
          "albListenerArn não informado via contexto (-c albListenerArn=...) — a regra /api/* e os alarmes de target group não foram criados. Rode `aws elbv2 describe-listeners --load-balancer-arn <arn-do-alb>` para obter o ARN.",
      });
    }

    alarmAction(
      new cloudwatch.Alarm(this, "ApiServiceCpuHighAlarm", {
        alarmName: `selecon-portal-${config.tags.Ambiente}-api-cpu-high`,
        metric: apiService.metricCpuUtilization({ period: cdk.Duration.minutes(5) }),
        threshold: 85,
        evaluationPeriods: 3,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      }),
    );
    alarmAction(
      new cloudwatch.Alarm(this, "ApiServiceMemoryHighAlarm", {
        alarmName: `selecon-portal-${config.tags.Ambiente}-api-memory-high`,
        metric: apiService.metricMemoryUtilization({ period: cdk.Duration.minutes(5) }),
        threshold: 85,
        evaluationPeriods: 3,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      }),
    );
    alarmAction(
      new cloudwatch.Alarm(this, "RdsCpuHighAlarm", {
        alarmName: `selecon-portal-${config.tags.Ambiente}-rds-cpu-high`,
        metric: database.metricCPUUtilization({ period: cdk.Duration.minutes(5) }),
        threshold: 85,
        evaluationPeriods: 3,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      }),
    );
    alarmAction(
      new cloudwatch.Alarm(this, "RdsFreeStorageLowAlarm", {
        alarmName: `selecon-portal-${config.tags.Ambiente}-rds-free-storage-low`,
        metric: database.metricFreeStorageSpace({ period: cdk.Duration.minutes(5) }),
        threshold: 2 * 1024 * 1024 * 1024, // 2 GiB
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      }),
    );
    alarmAction(
      new cloudwatch.Alarm(this, "RdsConnectionsHighAlarm", {
        alarmName: `selecon-portal-${config.tags.Ambiente}-rds-connections-high`,
        metric: database.metricDatabaseConnections({ period: cdk.Duration.minutes(5) }),
        threshold: 80,
        evaluationPeriods: 3,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      }),
    );

    new cdk.CfnOutput(this, "DatabaseSecretArn", { value: dbCredentialsSecret.secretArn });
    new cdk.CfnOutput(this, "AppSecretsArn", { value: appSecrets.secretArn });
    new cdk.CfnOutput(this, "UploadsBucketName", { value: uploadsBucket.bucketName });
    new cdk.CfnOutput(this, "CacheClusterEndpoint", {
      value: cacheCluster.attrRedisEndpointAddress,
    });
    new cdk.CfnOutput(this, "DatabaseEndpoint", { value: database.dbInstanceEndpointAddress });
    new cdk.CfnOutput(this, "ApiServiceName", { value: apiService.serviceName });
    new cdk.CfnOutput(this, "WorkerServiceName", { value: workerService.serviceName });
    new cdk.CfnOutput(this, "ApiInternalUrl", {
      value: "http://api.selecon-portal.internal:3001/api",
      description:
        "Valor a definir como API_INTERNAL_URL no serviço web existente (proxy servidor-a-servidor de apps/web).",
    });
    new cdk.CfnOutput(this, "WebTaskDefinitionFamily", { value: webTaskDefinition.family });
    new cdk.CfnOutput(this, "ApiTargetGroupArn", { value: apiTargetGroup.targetGroupArn });
  }
}
