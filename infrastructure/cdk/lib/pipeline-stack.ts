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
   * real desta pipeline — seção 23/34 do prompt mestre). */
  codeConnectionArn: string;
}

/**
 * Pipeline: GitHub -> CodePipeline -> CodeBuild (lint, typecheck, testes, build, docker
 * build, push ECR) -> deploy ECS. As migrações Prisma (`prisma migrate deploy`, nunca
 * `migrate dev`) rodam como uma etapa isolada do CodeBuild, não em cada réplica da API
 * (seção 24). Nunca implantado neste sandbox — sem CodeConnection autorizada nem
 * credenciais AWS reais disponíveis.
 */
export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);
    const { config, codeConnectionArn } = props;

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

    const buildProject = new codebuild.PipelineProject(this, "BuildProject", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec.yml"),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true, // necessário para `docker build` dentro do CodeBuild
      },
      environmentVariables: {
        AWS_ACCOUNT_ID: { value: config.env.account },
        AWS_REGION: { value: config.env.region },
        WEB_REPOSITORY_URI: { value: webRepo.repositoryUri },
        API_REPOSITORY_URI: { value: apiRepo.repositoryUri },
        WORKER_REPOSITORY_URI: { value: workerRepo.repositoryUri },
        ECS_CLUSTER_NAME: { value: config.ecsClusterName },
      },
    });

    webRepo.grantPullPush(buildProject);
    apiRepo.grantPullPush(buildProject);
    workerRepo.grantPullPush(buildProject);
    buildProject.addToRolePolicy(
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
    buildProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["iam:PassRole"],
        resources: ["*"],
        conditions: { StringEquals: { "iam:PassedToService": "ecs-tasks.amazonaws.com" } },
      }),
    );

    const sourceOutput = new codepipeline.Artifact("Source");
    const buildOutput = new codepipeline.Artifact("Build");

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
          stageName: "BuildAndDeploy",
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: "BuildTestAndDeploy",
              project: buildProject,
              input: sourceOutput,
              outputs: [buildOutput],
            }),
          ],
        },
      ],
    });
  }
}
