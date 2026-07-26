#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { SeleconPortalStack } from "../lib/selecon-portal-stack";
import { PipelineStack } from "../lib/pipeline-stack";
import { devConfig } from "../config/dev";

const app = new cdk.App();

new SeleconPortalStack(app, "SeleconPortalDevStack", {
  env: devConfig.env,
  config: devConfig,
  description: "Recursos novos do Portal Selecon (DEV): RDS, Redis/Valkey, S3, Secrets, ECS api/worker",
});

/**
 * A CodeConnection para o GitHub exige autorização manual no console (bloqueio real
 * documentado na seção 34 do prompt mestre). Passe o ARN já autorizado via contexto
 * (-c codeConnectionArn=...) para sintetizar a pipeline; caso contrário, esta stack é
 * pulada e um aviso é impresso.
 */
const codeConnectionArn = app.node.tryGetContext("codeConnectionArn") as string | undefined;
if (codeConnectionArn) {
  new PipelineStack(app, "SeleconPortalPipelineStack", {
    env: devConfig.env,
    config: devConfig,
    codeConnectionArn,
    description: "Pipeline CI/CD do Portal Selecon (DEV): CodeBuild + CodePipeline",
  });
} else {
  // eslint-disable-next-line no-console
  console.warn(
    "codeConnectionArn não informado via contexto — SeleconPortalPipelineStack não foi sintetizada. " +
      "Autorize a CodeConnection no console AWS e rode novamente com -c codeConnectionArn=<arn>.",
  );
}
