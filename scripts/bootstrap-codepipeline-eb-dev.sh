#!/usr/bin/env bash
# Implanta (cria ou atualiza) a pipeline GitHub -> CodePipeline -> CodeBuild ->
# Elastic Beanstalk do Portal Selecon (DEV) via CloudFormation
# (infrastructure/cloudformation/pipeline.yml). Único script de bootstrap desta
# pipeline — NÃO faz nenhum docker build (isso acontece dentro do CodeBuild, a cada
# execução da pipeline). Roda no AWS CloudShell — nunca executado neste sandbox (sem
# credenciais AWS reais aqui).
#
# Pré-requisitos: scripts/bootstrap-rds-dev.sh e scripts/bootstrap-elasticbeanstalk-dev.sh
# já executados com sucesso (a Application/Environment do Elastic Beanstalk devem
# existir antes do primeiro deploy da pipeline).
#
# O que este script NUNCA faz:
#   - criar uma nova AWS CodeConnection — usa EXCLUSIVAMENTE a conexão já existente e
#     já AVAILABLE informada abaixo; falha se ela não existir ou não estiver AVAILABLE;
#   - excluir a Application/Environment do Elastic Beanstalk, o RDS, ou qualquer
#     recurso existente;
#   - aplicar mudanças sem mostrar o change set e pedir confirmação explícita;
#   - disparar a pipeline manualmente — ela dispara sozinha a partir do primeiro push
#     em feat/fase-1-design-system (a ação CodeStarSourceConnection já registra o
#     webhook necessário).

set -euo pipefail

EXPECTED_ACCOUNT="518825425828"
EXPECTED_REGION="us-east-1"
STACK_NAME="selecon-portal-dev-pipeline"
TEMPLATE_FILE="infrastructure/cloudformation/pipeline.yml"
CODECONNECTION_ARN="arn:aws:codeconnections:us-east-1:518825425828:connection/5ff3c8d6-23b7-4459-8023-52cba5c0e33c"
EB_APPLICATION_NAME="selecon-portal"
EB_ENVIRONMENT_NAME="selecon-portal-dev"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
fail() { printf '\033[1;31m[erro]\033[0m %s\n' "$1"; exit 1; }

command -v aws >/dev/null 2>&1 || fail "aws-cli não encontrado no PATH."

log "1/5 — Validando conta e região"
CALLER_ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
CURRENT_REGION="${AWS_REGION:-$(aws configure get region || true)}"
[[ "$CALLER_ACCOUNT" == "$EXPECTED_ACCOUNT" ]] || fail "Conta atual ($CALLER_ACCOUNT) difere da esperada ($EXPECTED_ACCOUNT)."
[[ "$CURRENT_REGION" == "$EXPECTED_REGION" ]] || fail "Região atual ($CURRENT_REGION) difere da esperada ($EXPECTED_REGION). Exporte AWS_REGION=$EXPECTED_REGION."
echo "Conta: $CALLER_ACCOUNT | Região: $CURRENT_REGION — OK"

log "2/5 — Validando a CodeConnection existente (nunca cria uma nova)"
CONNECTION_JSON="$(aws codestar-connections get-connection --connection-arn "$CODECONNECTION_ARN" 2>/dev/null || true)"
[[ -n "$CONNECTION_JSON" ]] || fail "CodeConnection $CODECONNECTION_ARN não encontrada. Este script nunca cria uma nova."
CONNECTION_STATUS="$(echo "$CONNECTION_JSON" | node -pe "JSON.parse(require('fs').readFileSync(0)).Connection.ConnectionStatus")"
[[ "$CONNECTION_STATUS" == "AVAILABLE" ]] || fail "CodeConnection existe mas não está AVAILABLE (status: $CONNECTION_STATUS). Autorize no Console AWS e rode de novo."
echo "CodeConnection AVAILABLE: $CODECONNECTION_ARN"

log "3/5 — Confirmando que a Application/Environment do Elastic Beanstalk já existem"
aws elasticbeanstalk describe-environments --application-name "$EB_APPLICATION_NAME" \
  --environment-names "$EB_ENVIRONMENT_NAME" --query 'Environments[0].Status' --output text 2>/dev/null | grep -qv '^None$\|^$' \
  || fail "Environment '$EB_ENVIRONMENT_NAME' não encontrado. Rode scripts/bootstrap-elasticbeanstalk-dev.sh primeiro."
echo "Application '$EB_APPLICATION_NAME' / Environment '$EB_ENVIRONMENT_NAME' confirmados."

log "4/5 — Determinando se é criação ou atualização da stack da pipeline"
if aws cloudformation describe-stacks --stack-name "$STACK_NAME" >/dev/null 2>&1; then
  CHANGE_SET_TYPE="UPDATE"
  echo "Stack '$STACK_NAME' já existe — gerando change set de ATUALIZAÇÃO."
else
  CHANGE_SET_TYPE="CREATE"
  echo "Stack '$STACK_NAME' não existe — esta execução vai CRIAR:"
  echo "  - AppRepository (novo repositório ECR: selecon-portal/app-dev)"
  echo "  - ArtifactBucket (novo bucket S3, privado, para artefatos da pipeline)"
  echo "  - CodeBuildServiceRole, CodePipelineServiceRole (novas roles IAM)"
  echo "  - CodeBuildProject (novo projeto CodeBuild)"
  echo "  - Pipeline (novo CodePipeline: Source -> Build -> Deploy)"
fi
echo "Nada relacionado a ECS/Fargate/VPC/ALB/CDK é criado, alterado ou removido por esta stack."

CHANGE_SET_NAME="pipeline-$(date +%Y%m%d%H%M%S)"
aws cloudformation create-change-set \
  --stack-name "$STACK_NAME" \
  --change-set-name "$CHANGE_SET_NAME" \
  --change-set-type "$CHANGE_SET_TYPE" \
  --template-body "file://$REPO_ROOT/$TEMPLATE_FILE" \
  --parameters "ParameterKey=CodeConnectionArn,ParameterValue=$CODECONNECTION_ARN" \
  --capabilities CAPABILITY_IAM >/dev/null

echo "Aguardando o change set ficar pronto para revisão..."
aws cloudformation wait change-set-create-complete --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME" || true

CHANGE_SET_STATUS="$(aws cloudformation describe-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME" --query 'Status' --output text)"
if [[ "$CHANGE_SET_STATUS" == "FAILED" ]]; then
  REASON="$(aws cloudformation describe-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME" --query 'StatusReason' --output text)"
  if [[ "$REASON" == *"didn't contain changes"* ]]; then
    echo "Nenhuma mudança a aplicar — a stack já reflete o template atual."
    aws cloudformation delete-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME" >/dev/null
    exit 0
  fi
  fail "Change set falhou: $REASON"
fi

echo
echo "Plano de mudanças:"
aws cloudformation describe-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME" \
  --query 'Changes[].ResourceChange.{Action:Action,Resource:LogicalResourceId,Type:ResourceType,Replacement:Replacement}' \
  --output table

echo
echo "Rollback: reverter esta stack não afeta o Elastic Beanstalk nem o RDS (recursos"
echo "de outras stacks) — apenas a pipeline/CodeBuild/ECR/bucket de artefatos. Em caso"
echo "de falha durante a aplicação, o CloudFormation reverte automaticamente."
read -r -p "Executar este change set ('$CHANGE_SET_NAME')? (digite SIM em maiúsculas para continuar): " CONFIRM
if [[ "$CONFIRM" != "SIM" ]]; then
  echo "Cancelado pelo operador. Removendo o change set não aplicado..."
  aws cloudformation delete-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME" >/dev/null
  exit 1
fi

log "5/5 — Executando o change set"
aws cloudformation execute-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME"
aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME" 2>/dev/null \
  || aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME"

log "Concluído"
aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query 'Stacks[0].Outputs' --output table

echo
echo "A partir de agora, todo 'git push origin feat/fase-1-design-system' dispara a"
echo "pipeline automaticamente: Source -> Build -> Deploy. Acompanhe com:"
echo "  aws codepipeline get-pipeline-state --name selecon-portal-dev"
