import * as cdk from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import type { DevConfig } from "../config/dev";

export interface PipelineStackProps extends cdk.StackProps {
  config: DevConfig;
  /** ARN da AWS CodeConnection já autorizada manualmente no console (único passo manual
   * real desta pipeline — seção 23/34 do prompt mestre). */
  codeConnectionArn: string;
  /** ARN do secret com as credenciais do RDS (username/password gerados pelo
   * `rds.Credentials.fromSecret`) — saída `DatabaseSecretArn` de SeleconPortalDevStack.
   * Passado via contexto (-c databaseSecretArn=...) porque as duas stacks são
   * independentes (nenhuma referência cross-stack implícita que forçaria acoplamento). */
  databaseSecretArn?: string;
  /** Endpoint do RDS (host) — saída `DatabaseEndpoint` de SeleconPortalDevStack. Não é
   * segredo (é apenas o hostname), por isso passado como valor simples. */
  databaseHost?: string;
  /** ARNs dos target groups web/api — saídas de SeleconPortalDevStack — usados apenas
   * pelo estágio SmokeTest para checar a saúde dos targets. Opcionais: sem eles, o
   * SmokeTest ainda roda os checks HTTP, só pula a checagem de target health. */
  webTargetGroupArn?: string;
  apiTargetGroupArn?: string;
}

const BUILD_IMAGE = codebuild.LinuxBuildImage.STANDARD_7_0;

/**
 * Pipeline com os 6 estágios exigidos (seção 15 do prompt mestre): Source -> Validate ->
 * BuildImages -> Migrations -> Deploy -> SmokeTest. Cada estágio usa seu próprio
 * buildspec (buildspec-*.yml na raiz do repositório — seção 16) e projeto CodeBuild
 * dedicado, para que uma falha em qualquer estágio pare o pipeline antes do próximo.
 * Nunca implantado neste sandbox — sem CodeConnection autorizada nem credenciais AWS
 * reais disponíveis.
 */
export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);
    const {
      config,
      codeConnectionArn,
      databaseSecretArn,
      databaseHost,
      webTargetGroupArn,
      apiTargetGroupArn,
    } = props;

    const artifactBucket = new s3.Bucket(this, "PipelineArtifactsBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [{ expiration: cdk.Duration.days(30) }],
    });

    const webRepo = ecr.Repository.fromRepositoryName(this, "WebRepo", config.ecrRepositories.web);
    const apiRepo = ecr.Repository.fromRepositoryName(this, "ApiRepo", config.ecrRepositories.api);
    const workerRepo = ecr.Repository.fromRepositoryName(
      this,
      "WorkerRepo",
      config.ecrRepositories.worker,
    );

    const sharedEnvVars: Record<string, codebuild.BuildEnvironmentVariable> = {
      AWS_ACCOUNT_ID: { value: config.env.account },
      AWS_REGION: { value: config.env.region },
      WEB_REPOSITORY_URI: { value: webRepo.repositoryUri },
      API_REPOSITORY_URI: { value: apiRepo.repositoryUri },
      WORKER_REPOSITORY_URI: { value: workerRepo.repositoryUri },
      ECS_CLUSTER_NAME: { value: config.ecsClusterName },
    };

    // --- Validate: lint, typecheck, testes (Postgres/Redis efêmeros no runner), build ---
    const validateProject = new codebuild.PipelineProject(this, "ValidateProject", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec-validate.yml"),
      environment: { buildImage: BUILD_IMAGE, privileged: false },
    });

    // --- BuildImages: docker build + push das 3 imagens, tag = commit SHA ---
    const imagesProject = new codebuild.PipelineProject(this, "ImagesProject", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec-images.yml"),
      environment: { buildImage: BUILD_IMAGE, privileged: true },
      environmentVariables: sharedEnvVars,
    });
    webRepo.grantPullPush(imagesProject);
    apiRepo.grantPullPush(imagesProject);
    workerRepo.grantPullPush(imagesProject);

    // --- Migrations: prisma migrate deploy, execução única e travada por advisory lock ---
    const migrationsEnvVars: Record<string, codebuild.BuildEnvironmentVariable> = {
      ...sharedEnvVars,
    };
    let dbSecretRef: secretsmanager.ISecret | undefined;
    if (databaseSecretArn && databaseHost) {
      dbSecretRef = secretsmanager.Secret.fromSecretCompleteArn(
        this,
        "DatabaseSecretRef",
        databaseSecretArn,
      );
      // O secret guarda username/password (gerados pelo rds.Credentials.fromSecret);
      // buildspec-migrations.yml monta a DATABASE_URL combinando essas duas variáveis
      // com o host (não sensível) e o nome do banco — nunca fica em texto puro no
      // CodeBuild nem no repositório.
      migrationsEnvVars.DB_USERNAME = {
        value: `${databaseSecretArn}:username`,
        type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
      };
      migrationsEnvVars.DB_PASSWORD = {
        value: `${databaseSecretArn}:password`,
        type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
      };
      migrationsEnvVars.DB_HOST = { value: databaseHost };
      migrationsEnvVars.DB_NAME = { value: config.databaseName };
    } else {
      new cdk.CfnOutput(this, "MissingDatabaseConfigWarning", {
        value:
          "databaseSecretArn/databaseHost não informados via contexto — o estágio Migrations não terá DATABASE_URL configurado. Passe -c databaseSecretArn=<arn> -c databaseHost=<endpoint> (saídas DatabaseSecretArn/DatabaseEndpoint de SeleconPortalDevStack).",
      });
    }

    const migrationsProject = new codebuild.PipelineProject(this, "MigrationsProject", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec-migrations.yml"),
      environment: { buildImage: BUILD_IMAGE, privileged: true },
      environmentVariables: migrationsEnvVars,
    });
    apiRepo.grantPull(migrationsProject);
    dbSecretRef?.grantRead(migrationsProject);

    // --- Deploy: registra novas revisões das task definitions e atualiza os serviços ---
    const deployProject = new codebuild.PipelineProject(this, "DeployProject", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec-deploy.yml"),
      environment: { buildImage: BUILD_IMAGE, privileged: false },
      environmentVariables: sharedEnvVars,
    });
    deployProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:RegisterTaskDefinition",
          "ecs:DescribeTaskDefinition",
        ],
        resources: ["*"], // restringir ao cluster/serviços do portal antes de ir para HML/PRD
      }),
    );
    deployProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["iam:PassRole"],
        resources: ["*"],
        conditions: { StringEquals: { "iam:PassedToService": "ecs-tasks.amazonaws.com" } },
      }),
    );

    // --- SmokeTest: valida a URL pública real após o deploy ---
    const smokeTestProject = new codebuild.PipelineProject(this, "SmokeTestProject", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec-smoke.yml"),
      environment: { buildImage: BUILD_IMAGE, privileged: false },
      environmentVariables: {
        ECS_CLUSTER_NAME: { value: config.ecsClusterName },
        ...(webTargetGroupArn ? { WEB_TARGET_GROUP_ARN: { value: webTargetGroupArn } } : {}),
        ...(apiTargetGroupArn ? { API_TARGET_GROUP_ARN: { value: apiTargetGroupArn } } : {}),
      },
    });
    smokeTestProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ecs:DescribeServices", "elasticloadbalancing:DescribeTargetHealth"],
        resources: ["*"],
      }),
    );

    const sourceOutput = new codepipeline.Artifact("Source");
    const imagesOutput = new codepipeline.Artifact("Images");
    const migrationsOutput = new codepipeline.Artifact("Migrations");

    new codepipeline.Pipeline(this, "Pipeline", {
      pipelineName: `selecon-portal-${config.tags.Ambiente}`,
      artifactBucket,
      stages: [
        {
          stageName: "Source",
          actions: [
            new codepipeline_actions.CodeStarConnectionsSourceAction({
              actionName: "GitHub",
              owner: "Fernando-Carilo",
              repo: "novo-site-selecon",
              branch: "feat/fase-1-design-system",
              connectionArn: codeConnectionArn,
              output: sourceOutput,
            }),
          ],
        },
        {
          stageName: "Validate",
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: "LintTypecheckTestBuild",
              project: validateProject,
              input: sourceOutput,
            }),
          ],
        },
        {
          stageName: "BuildImages",
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: "DockerBuildAndPush",
              project: imagesProject,
              input: sourceOutput,
              outputs: [imagesOutput],
            }),
          ],
        },
        {
          stageName: "Migrations",
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: "PrismaMigrateDeploy",
              project: migrationsProject,
              input: imagesOutput,
              outputs: [migrationsOutput],
            }),
          ],
        },
        {
          stageName: "Deploy",
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: "UpdateEcsServices",
              project: deployProject,
              input: migrationsOutput,
            }),
          ],
        },
        {
          stageName: "SmokeTest",
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: "ValidatePublicUrl",
              project: smokeTestProject,
              input: sourceOutput,
            }),
          ],
        },
      ],
    });
  }
}
