#!/usr/bin/env bash
# BOOTSTRAP DA PIPELINE — script único de configuração inicial do caminho de
# implantação principal (CodePipeline + CodeBuild + ECR + CDK).
#
# O que este script faz, em ordem:
#   1. Valida que a AWS CodeConnection já existente e AVAILABLE (ver
#      EXPECTED_CONNECTION_ARN abaixo) realmente existe e está com esse status.
#   2. Instala as dependências do CDK e roda `cdk synth`/`cdk diff`/`cdk deploy`
#      SOMENTE em SeleconPortalPipelineStack (nunca em SeleconPortalDevStack —
#      essa é criada/atualizada pelo próprio pipeline, no estágio Deploy).
#
# O que este script NUNCA faz:
#   - criar uma nova AWS CodeConnection — usa EXCLUSIVAMENTE a conexão já autorizada
#     informada abaixo; se ela não existir ou não estiver AVAILABLE, o script falha
#     em vez de criar outra;
#   - docker build, docker push, ou qualquer manipulação de imagem de container;
#   - tocar em SeleconPortalDevStack (VPC, ALB, cluster, RDS, serviços ECS etc.);
#   - guardar um token do GitHub em variável de ambiente ou no Secrets Manager —
#     a autenticação é inteiramente resolvida pela CodeConnection;
#   - excluir ou substituir qualquer recurso existente;
#   - iniciar a pipeline manualmente (ela dispara sozinha a partir do primeiro push
#     em feat/fase-1-design-system depois que a stack estiver implantada —
#     CodeStarConnectionsSourceAction já registra o webhook necessário automaticamente).
#
# Depois que este script terminar com sucesso, o caminho normal de implantação passa
# a ser: `git push origin feat/fase-1-design-system` — nada mais precisa ser rodado
# manualmente. Ver docs/OPERATIONS_RUNBOOK.md.
#
# Nunca executado neste sandbox de desenvolvimento (sem credenciais AWS reais aqui).

set -euo pipefail

EXPECTED_ACCOUNT="518825425828"
EXPECTED_REGION="us-east-1"
# CodeConnection já existente e autorizada (AVAILABLE) — informada explicitamente pelo
# operador. Este script NUNCA cria uma CodeConnection; só valida e usa esta.
EXPECTED_CONNECTION_ARN="arn:aws:codeconnections:us-east-1:518825425828:connection/5ff3c8d6-23b7-4459-8023-52cba5c0e33c"
PIPELINE_STACK_NAME="SeleconPortalPipelineStack"
DEV_STACK_NAME="SeleconPortalDevStack"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CDK_DIR="$REPO_ROOT/infrastructure/cdk"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33m[aviso]\033[0m %s\n' "$1"; }
fail() { printf '\033[1;31m[erro]\033[0m %s\n' "$1"; exit 1; }

command -v aws >/dev/null 2>&1 || fail "aws-cli não encontrado no PATH. Rode este script no AWS CloudShell."
command -v node >/dev/null 2>&1 || fail "Node.js não encontrado no PATH."
command -v pnpm >/dev/null 2>&1 || fail "pnpm não encontrado no PATH. Rode: corepack enable && corepack prepare pnpm@10 --activate"

log "1/5 — Validando conta e região"
CALLER_ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
CURRENT_REGION="${AWS_REGION:-$(aws configure get region || true)}"
[[ "$CALLER_ACCOUNT" == "$EXPECTED_ACCOUNT" ]] || fail "Conta atual ($CALLER_ACCOUNT) difere da esperada ($EXPECTED_ACCOUNT). Abortando por segurança."
[[ "$CURRENT_REGION" == "$EXPECTED_REGION" ]] || fail "Região atual ($CURRENT_REGION) difere da esperada ($EXPECTED_REGION). Exporte AWS_REGION=$EXPECTED_REGION."
echo "Conta: $CALLER_ACCOUNT | Região: $CURRENT_REGION — OK"

log "2/5 — Validando a CodeConnection existente (nunca cria uma nova)"
CONNECTION_ARN="$EXPECTED_CONNECTION_ARN"
CONNECTION_JSON="$(aws codestar-connections get-connection --connection-arn "$CONNECTION_ARN" 2>/dev/null || true)"
[[ -n "$CONNECTION_JSON" ]] || fail "CodeConnection $CONNECTION_ARN não encontrada nesta conta/região. Este script nunca cria uma nova — confirme o ARN com o operador que já autorizou a conexão no Console."

CONNECTION_STATUS="$(echo "$CONNECTION_JSON" | node -pe "JSON.parse(require('fs').readFileSync(0)).Connection.ConnectionStatus")"
[[ "$CONNECTION_STATUS" == "AVAILABLE" ]] || fail "CodeConnection $CONNECTION_ARN existe mas não está AVAILABLE (status atual: $CONNECTION_STATUS). Autorize-a manualmente no Console AWS (Developer Tools -> Settings -> Connections) e rode este script novamente — ele nunca cria outra conexão."
echo "CodeConnection AVAILABLE confirmada: $CONNECTION_ARN"

log "3/5 — Instalando dependências do CDK"
(cd "$CDK_DIR" && pnpm install --ignore-workspace --frozen-lockfile)

log "4/5 — cdk synth / cdk diff — SOMENTE $PIPELINE_STACK_NAME"
CDK_CONTEXT_ARGS=(-c "codeConnectionArn=$CONNECTION_ARN")

# Saídas opcionais de SeleconPortalDevStack, se a stack já existir (deploys
# subsequentes) — usadas apenas pelo estágio SmokeTest para checar target health.
# Na primeiríssima execução (stack ainda não existe) ficam vazias e são omitidas;
# o SmokeTest lida com isso normalmente (ver buildspec-smoke.yml).
if aws cloudformation describe-stacks --stack-name "$DEV_STACK_NAME" >/dev/null 2>&1; then
  WEB_TG_ARN="$(aws cloudformation describe-stacks --stack-name "$DEV_STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='WebTargetGroupArn'].OutputValue | [0]" --output text 2>/dev/null || true)"
  API_TG_ARN="$(aws cloudformation describe-stacks --stack-name "$DEV_STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='ApiTargetGroupArn'].OutputValue | [0]" --output text 2>/dev/null || true)"
  [[ -n "$WEB_TG_ARN" && "$WEB_TG_ARN" != "None" ]] && CDK_CONTEXT_ARGS+=(-c "webTargetGroupArn=$WEB_TG_ARN")
  [[ -n "$API_TG_ARN" && "$API_TG_ARN" != "None" ]] && CDK_CONTEXT_ARGS+=(-c "apiTargetGroupArn=$API_TG_ARN")
else
  warn "$DEV_STACK_NAME ainda não existe (normal na primeira execução) — será criada pelo próprio pipeline (estágio Deploy), não por este script."
fi

(cd "$CDK_DIR" && npx cdk synth "$PIPELINE_STACK_NAME" "${CDK_CONTEXT_ARGS[@]}")

(cd "$CDK_DIR" && npx cdk diff "$PIPELINE_STACK_NAME" "${CDK_CONTEXT_ARGS[@]}") \
  || fail "cdk diff falhou (erro real, não apenas diferenças) — corrija a causa raiz antes de continuar."

echo
echo "Revise o diff acima. Esta stack cria APENAS recursos da pipeline (CodePipeline,"
echo "projetos CodeBuild, bucket de artefatos, IAM) — nunca VPC, ALB, cluster ECS,"
echo "RDS ou o serviço web existente (isso pertence a $DEV_STACK_NAME, não tocada aqui)."
read -r -p "Prosseguir com 'cdk deploy $PIPELINE_STACK_NAME' (digite SIM em maiúsculas para continuar): " CONFIRM
[[ "$CONFIRM" == "SIM" ]] || { echo "Cancelado pelo operador."; exit 1; }

log "5/5 — cdk deploy $PIPELINE_STACK_NAME"
(cd "$CDK_DIR" && npx cdk deploy "$PIPELINE_STACK_NAME" "${CDK_CONTEXT_ARGS[@]}" --require-approval never)

PIPELINE_NAME="$(aws cloudformation describe-stacks --stack-name "$PIPELINE_STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='PipelineName'].OutputValue | [0]" --output text 2>/dev/null || echo "selecon-portal-dev")"

log "Concluído"
echo "Pipeline implantada: $PIPELINE_NAME"
echo "Console: https://$EXPECTED_REGION.console.aws.amazon.com/codesuite/codepipeline/pipelines/$PIPELINE_NAME/view?region=$EXPECTED_REGION"
echo
echo "A partir de agora, todo 'git push origin feat/fase-1-design-system' dispara a"
echo "pipeline automaticamente: Source -> Validate -> BuildImages -> Deploy -> Migrations"
echo "-> SmokeTest. Nenhum passo manual adicional é necessário."
echo
echo "Nota sobre o primeiro run: $DEV_STACK_NAME ainda não existe até o estágio Deploy"
echo "rodar 'cdk deploy' pela primeira vez — o que já acontece ANTES do estágio Migrations"
echo "nesta ordem, então as migrações reais rodam já no primeiro run (Migrations falha,"
echo "nunca pula, se a stack/serviço da api não existirem nesse ponto). Ver"
echo "buildspec-migrations.yml e docs/ASSUMPTIONS.md."
echo
echo "Para acompanhar o primeiro run:"
echo "  aws codepipeline get-pipeline-state --name $PIPELINE_NAME"
echo
echo "Para validação somente-leitura do ambiente a qualquer momento: scripts/check-aws-dev.sh"
echo "Para rollback manual de ECS (não desfaz migrações de banco): scripts/rollback-ecs-dev.sh"
