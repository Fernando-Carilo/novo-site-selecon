import * as cdk from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import type { DevConfig } from "../config/dev";

export interface PipelineStackProps extends cdk.StackProps {
  config: DevConfig;
  /** ARN da AWS CodeConnection já autorizada manualmente no console (único passo manual
   * real desta pipeline) — ver scripts/bootstrap-codepipeline-dev.sh. */
  codeConnectionArn: string;
  /** ARNs dos target groups web/api — saídas de SeleconPortalDevStack — usados apenas
   * pelo estágio SmokeTest para checar a saúde dos targets. Opcionais: sem eles, o
   * SmokeTest ainda roda os checks HTTP, só pula a checagem de target health. */
  webTargetGroupArn?: string;
  apiTargetGroupArn?: string;
}

const BUILD_IMAGE = codebuild.LinuxBuildImage.STANDARD_7_0;

/**
 * Pipeline com os 6 estágios: Source -> Validate -> BuildImages -> Migrations -> Deploy
 * -> SmokeTest. Cada estágio usa seu próprio buildspec (buildspec-*.yml na raiz do
 * repositório) e projeto CodeBuild dedicado, para que uma falha em qualquer estágio
 * pare o pipeline antes do próximo.
 *
 * Esta stack só implanta `SeleconPortalDevStack` (nunca uma stack de PRD — não existe
 * nem uma referência a um ambiente de PRD neste repositório). Não cria, remove nem
 * substitui VPC, ALB, cluster ECS ou o serviço `selecon-portal-dev-web` existentes —
 * ver a validação de segurança em buildspec-deploy.yml (analisa `cdk diff` e falha o
 * build automaticamente diante de qualquer sinal de substituição/remoção destrutiva).
 *
 * As task definitions de api/worker (geridas pelo CDK) e do serviço web (não gerido
 * pelo CDK, atualizado via AWS CLI em buildspec-deploy.yml) sempre apontam para a tag
 * IMUTÁVEL do commit implantado (`imageTag`, resolvida a partir de
 * CODEBUILD_RESOLVED_SOURCE_VERSION em buildspec-images.yml) — nunca a tag mutável
 * "dev" (que também é publicada, só como conveniência para inspeção manual).
 *
 * Nenhuma credencial de banco passa pelo ambiente do CodeBuild: as migrações rodam como
 * uma task Fargate avulsa (`aws ecs run-task`, dentro da VPC) que recebe DATABASE_URL
 * pelos mesmos segredos do Secrets Manager já configurados na task definition da api —
 * ver buildspec-migrations.yml e packages/db/src/client.ts.
 *
 * Nunca implantado neste sandbox — sem CodeConnection autorizada nem credenciais AWS
 * reais disponíveis.
 */
export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);
    const { config, codeConnectionArn, webTargetGroupArn, apiTargetGroupArn } = props;

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
      AWS_DEFAULT_REGION: { value: config.env.region },
      WEB_REPOSITORY_URI: { value: webRepo.repositoryUri },
      API_REPOSITORY_URI: { value: apiRepo.repositoryUri },
      WORKER_REPOSITORY_URI: { value: workerRepo.repositoryUri },
      ECS_CLUSTER_NAME: { value: config.ecsClusterName },
    };

    // --- Validate: lint, typecheck, testes (Postgres/Redis efêmeros no runner), build ---
    const validateProject = new codebuild.PipelineProject(this, "ValidateProject", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec-validate.yml"),
      environment: {
        buildImage: BUILD_IMAGE,
        privileged: false,
        computeType: codebuild.ComputeType.MEDIUM,
      },
      timeout: cdk.Duration.minutes(30),
    });

    // --- BuildImages: docker build + push das 3 imagens (tag imutável = commit SHA
    // curto + tag de conveniência "dev"), com confirmação dos digests publicados ---
    const imagesProject = new codebuild.PipelineProject(this, "ImagesProject", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec-images.yml"),
      environment: {
        buildImage: BUILD_IMAGE,
        privileged: true, // necessário para o daemon Docker do build
        computeType: codebuild.ComputeType.LARGE, // monorepo: 3 builds Docker completos
      },
      environmentVariables: sharedEnvVars,
      timeout: cdk.Duration.minutes(90),
      cache: codebuild.Cache.local(
        codebuild.LocalCacheMode.DOCKER_LAYER,
        codebuild.LocalCacheMode.CUSTOM,
      ),
    });
    webRepo.grantPullPush(imagesProject);
    apiRepo.grantPullPush(imagesProject);
    workerRepo.grantPullPush(imagesProject);
    imagesProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ecr:DescribeImages"],
        resources: [webRepo.repositoryArn, apiRepo.repositoryArn, workerRepo.repositoryArn],
      }),
    );

    // --- Migrations: prisma migrate deploy, execução única via task Fargate avulsa
    // (aws ecs run-task), travada por pg_advisory_lock dentro do próprio processo
    // (ver apps/api/src/scripts/run-migrations.ts). Nenhuma credencial de banco passa
    // por aqui — a task recebe DATABASE_URL pelos segredos já configurados na task
    // definition da api. Passa adiante sem erro se SeleconPortalDevStack ainda não
    // existir (primeiro run da pipeline — ver buildspec-migrations.yml). ---
    const migrationsProject = new codebuild.PipelineProject(this, "MigrationsProject", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec-migrations.yml"),
      environment: {
        buildImage: BUILD_IMAGE,
        privileged: false, // não faz docker build/run — só aws ecs run-task
        computeType: codebuild.ComputeType.SMALL,
      },
      environmentVariables: sharedEnvVars,
      timeout: cdk.Duration.minutes(20),
    });
    migrationsProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "cloudformation:DescribeStacks",
          "ecs:DescribeServices",
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition",
          "ecs:RunTask",
          "ecs:DescribeTasks",
        ],
        resources: ["*"], // restringir ao cluster/stack do portal antes de ir para HML/PRD
      }),
    );
    migrationsProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["iam:PassRole"],
        resources: ["*"],
        conditions: { StringEquals: { "iam:PassedToService": "ecs-tasks.amazonaws.com" } },
      }),
    );

    // --- Deploy: cdk synth/diff (com validação de segurança automática) + cdk deploy
    // de SeleconPortalDevStack + atualização do serviço web existente (não gerido pelo
    // CDK) para a imagem do commit atual ---
    const deployProject = new codebuild.PipelineProject(this, "DeployProject", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec-deploy.yml"),
      environment: {
        buildImage: BUILD_IMAGE,
        privileged: false,
        computeType: codebuild.ComputeType.MEDIUM,
      },
      environmentVariables: sharedEnvVars,
      timeout: cdk.Duration.minutes(45),
    });
    // Permite ao CodeBuild assumir os papéis de bootstrap do CDK (criados por
    // `cdk bootstrap`) — é assim que `cdk deploy` funciona sem precisar enumerar aqui
    // toda permissão de todo serviço que a stack usa (RDS, ElastiCache, S3, IAM etc.).
    deployProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [`arn:aws:iam::${config.env.account}:role/cdk-*`],
      }),
    );
    deployProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "cloudformation:DescribeStacks",
          "cloudformation:DescribeStackEvents",
          "elasticloadbalancing:DescribeLoadBalancers",
          "elasticloadbalancing:DescribeListeners",
          "ecs:DescribeServices",
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition",
          "ecs:UpdateService",
        ],
        resources: ["*"], // restringir ao cluster/serviços/stack do portal antes de ir para HML/PRD
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
      timeout: cdk.Duration.minutes(15),
    });
    smokeTestProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "ecs:DescribeServices",
          "elasticloadbalancing:DescribeLoadBalancers",
          "elasticloadbalancing:DescribeTargetHealth",
        ],
        resources: ["*"],
      }),
    );

    const sourceOutput = new codepipeline.Artifact("Source");
    const imagesOutput = new codepipeline.Artifact("Images");
    const migrationsOutput = new codepipeline.Artifact("Migrations");

    const pipelineName = `selecon-portal-${config.tags.Ambiente}`;

    new codepipeline.Pipeline(this, "Pipeline", {
      pipelineName,
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
              actionName: "CdkDeployAndUpdateServices",
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

    new cdk.CfnOutput(this, "PipelineName", { value: pipelineName });
  }
}
