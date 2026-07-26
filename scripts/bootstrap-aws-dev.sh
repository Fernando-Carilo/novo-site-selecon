#!/usr/bin/env bash
# Ativação única do Portal Selecon no ambiente AWS DEV (seção 24 do prompt mestre de
# infraestrutura). Roda no AWS CloudShell (ou qualquer shell com aws-cli e credenciais
# reais configuradas) — nunca executado neste sandbox de desenvolvimento (sem
# credenciais AWS reais aqui).
#
# O que este script faz:
#   1. valida conta e região;
#   2. confirma que os recursos existentes citados no prompt mestre realmente existem
#      (nunca assume — sempre confere antes de prosseguir);
#   3. instala as dependências do CDK;
#   4. roda `cdk synth` e `cdk diff`;
#   5. pede confirmação explícita antes de cada `cdk deploy`;
#   6. implanta SeleconPortalDevStack;
#   7. implanta SeleconPortalPipelineStack (só se a CodeConnection já estiver
#      autorizada — caso não esteja, imprime o passo manual exato e para);
#   8. imprime URL, nomes de recursos e os próximos passos.
#
# O que este script NUNCA faz:
#   - excluir ou substituir qualquer recurso existente;
#   - assumir um account ID, região ou ID de recurso diferente do informado;
#   - esconder um erro (roda com `set -euo pipefail` — qualquer falha para o script);
#   - usar credenciais fixas (usa exclusivamente as credenciais já configuradas no
#     ambiente onde o script roda — variáveis de ambiente ou perfil da AWS CLI).

set -euo pipefail

EXPECTED_ACCOUNT="518825425828"
EXPECTED_REGION="us-east-1"
VPC_ID="vpc-0b5fb2dcfb604f371"
CLUSTER_NAME="selecon-portal-dev"
ALB_NAME="selecon-portal-dev-alb"
STACK_NAME="selecon-portal-dev-preview"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CDK_DIR="$REPO_ROOT/infrastructure/cdk"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33m[aviso]\033[0m %s\n' "$1"; }
fail() { printf '\033[1;31m[erro]\033[0m %s\n' "$1"; exit 1; }

confirm() {
  local prompt="$1"
  read -r -p "$prompt [digite 'sim' para continuar] " answer
  if [[ "$answer" != "sim" ]]; then
    echo "Cancelado pelo operador."
    exit 1
  fi
}

command -v aws >/dev/null 2>&1 || fail "aws-cli não encontrado no PATH. Rode este script no AWS CloudShell."
command -v node >/dev/null 2>&1 || fail "Node.js não encontrado no PATH."
command -v pnpm >/dev/null 2>&1 || fail "pnpm não encontrado no PATH. Rode: corepack enable && corepack prepare pnpm@10 --activate"

log "1/8 — Validando conta e região"
CALLER_ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
CURRENT_REGION="${AWS_REGION:-$(aws configure get region || true)}"

[[ "$CALLER_ACCOUNT" == "$EXPECTED_ACCOUNT" ]] || fail "Conta atual ($CALLER_ACCOUNT) difere da esperada ($EXPECTED_ACCOUNT). Abortando por segurança."
[[ "$CURRENT_REGION" == "$EXPECTED_REGION" ]] || fail "Região atual ($CURRENT_REGION) difere da esperada ($EXPECTED_REGION). Exporte AWS_REGION=$EXPECTED_REGION."
echo "Conta: $CALLER_ACCOUNT | Região: $CURRENT_REGION — OK"

log "2/8 — Confirmando recursos existentes (nunca assumidos, sempre verificados)"
aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query 'Stacks[0].StackStatus' --output text \
  || fail "Stack CloudFormation '$STACK_NAME' não encontrada — confirme se este é o ambiente correto."
aws ec2 describe-vpcs --vpc-ids "$VPC_ID" --query 'Vpcs[0].VpcId' --output text \
  || fail "VPC '$VPC_ID' não encontrada."
aws ecs describe-clusters --clusters "$CLUSTER_NAME" --query 'clusters[0].status' --output text \
  || fail "Cluster ECS '$CLUSTER_NAME' não encontrado."
ALB_ARN="$(aws elbv2 describe-load-balancers --names "$ALB_NAME" --query 'LoadBalancers[0].LoadBalancerArn' --output text)"
[[ -n "$ALB_ARN" && "$ALB_ARN" != "None" ]] || fail "ALB '$ALB_NAME' não encontrado."
LISTENER_ARN="$(aws elbv2 describe-listeners --load-balancer-arn "$ALB_ARN" --query 'Listeners[?Port==`80`].ListenerArn | [0]' --output text)"
[[ -n "$LISTENER_ARN" && "$LISTENER_ARN" != "None" ]] || fail "Listener HTTP:80 do ALB não encontrado."
echo "Recursos existentes confirmados. ALB ARN: $ALB_ARN | Listener ARN: $LISTENER_ARN"

log "3/8 — Instalando dependências do CDK"
(cd "$CDK_DIR" && pnpm install --ignore-workspace --frozen-lockfile)

log "4/8 — cdk synth"
read -r -p "E-mail para receber alarmes do CloudWatch (Enter para pular): " ALARM_EMAIL
ALARM_CONTEXT_ARGS=()
[[ -n "$ALARM_EMAIL" ]] && ALARM_CONTEXT_ARGS+=(-c "alarmEmail=$ALARM_EMAIL")

(cd "$CDK_DIR" && npx cdk synth SeleconPortalDevStack -c "albListenerArn=$LISTENER_ARN" "${ALARM_CONTEXT_ARGS[@]}")

log "5/8 — cdk diff (revise antes de prosseguir)"
(cd "$CDK_DIR" && npx cdk diff SeleconPortalDevStack -c "albListenerArn=$LISTENER_ARN" "${ALARM_CONTEXT_ARGS[@]}") || true

confirm "Revisou o diff acima? Prosseguir com 'cdk deploy SeleconPortalDevStack'?"

log "6/8 — cdk deploy SeleconPortalDevStack"
(cd "$CDK_DIR" && npx cdk deploy SeleconPortalDevStack -c "albListenerArn=$LISTENER_ARN" "${ALARM_CONTEXT_ARGS[@]}" --require-approval broadening)

DB_SECRET_ARN="$(aws cloudformation describe-stacks --stack-name SeleconPortalDevStack --query "Stacks[0].Outputs[?OutputKey=='DatabaseSecretArn'].OutputValue | [0]" --output text)"
DB_HOST="$(aws cloudformation describe-stacks --stack-name SeleconPortalDevStack --query "Stacks[0].Outputs[?OutputKey=='DatabaseEndpoint'].OutputValue | [0]" --output text)"
API_TG_ARN="$(aws cloudformation describe-stacks --stack-name SeleconPortalDevStack --query "Stacks[0].Outputs[?OutputKey=='ApiTargetGroupArn'].OutputValue | [0]" --output text)"
echo "DatabaseSecretArn: $DB_SECRET_ARN"
echo "DatabaseEndpoint:  $DB_HOST"
echo "ApiTargetGroupArn: $API_TG_ARN"

log "7/8 — CodeConnection e pipeline"
CONNECTION_ARN="$(aws codeconnections list-connections --query "Connections[?ConnectionName=='selecon-portal-github'].ConnectionArn | [0]" --output text 2>/dev/null || echo "")"

if [[ -z "$CONNECTION_ARN" || "$CONNECTION_ARN" == "None" ]]; then
  warn "CodeConnection 'selecon-portal-github' ainda não existe. Criando (ficará PENDING até autorização manual)..."
  CONNECTION_ARN="$(aws codeconnections create-connection --provider-type GitHub --connection-name selecon-portal-github --query 'ConnectionArn' --output text)"
  echo "ConnectionArn: $CONNECTION_ARN"
  echo
  echo "=========================================================================="
  echo " ÚNICO PASSO MANUAL RESTANTE (seção 25 do prompt mestre):"
  echo " 1. Console AWS -> Developer Tools -> Settings -> Connections"
  echo " 2. Encontre a conexão 'selecon-portal-github' com status PENDING"
  echo " 3. Clique em 'Update pending connection' e autorize o GitHub"
  echo " 4. Selecione o repositório Fernando-Carilo/novo-site-selecon"
  echo " 5. Rode este script novamente para implantar a pipeline"
  echo "=========================================================================="
  exit 0
fi

STATUS="$(aws codeconnections get-connection --connection-arn "$CONNECTION_ARN" --query 'Connection.ConnectionStatus' --output text)"
echo "CodeConnection: $CONNECTION_ARN (status: $STATUS)"

if [[ "$STATUS" != "AVAILABLE" ]]; then
  warn "CodeConnection ainda não está AVAILABLE (status atual: $STATUS). Autorize no console e rode este script novamente."
  exit 0
fi

log "8/8 — cdk deploy SeleconPortalPipelineStack"
(cd "$CDK_DIR" && npx cdk synth SeleconPortalPipelineStack \
  -c "codeConnectionArn=$CONNECTION_ARN" -c "databaseSecretArn=$DB_SECRET_ARN" \
  -c "databaseHost=$DB_HOST" -c "apiTargetGroupArn=$API_TG_ARN")

confirm "Prosseguir com 'cdk deploy SeleconPortalPipelineStack'?"

(cd "$CDK_DIR" && npx cdk deploy SeleconPortalPipelineStack \
  -c "codeConnectionArn=$CONNECTION_ARN" -c "databaseSecretArn=$DB_SECRET_ARN" \
  -c "databaseHost=$DB_HOST" -c "apiTargetGroupArn=$API_TG_ARN" --require-approval broadening)

PIPELINE_NAME="$(aws cloudformation describe-stacks --stack-name SeleconPortalPipelineStack --query "Stacks[0].Outputs[?OutputKey=='PipelineName'].OutputValue | [0]" --output text 2>/dev/null || echo "selecon-portal-dev")"

log "Ativação concluída"
echo "Pipeline: $PIPELINE_NAME"
echo "URL do portal: http://selecon-portal-dev-alb-1790035663.us-east-1.elb.amazonaws.com"
echo
echo "Próximos passos:"
echo "  - Qualquer push em feat/fase-1-design-system agora dispara o pipeline automaticamente."
echo "  - Rode scripts/check-aws-dev.sh para validar o estado de todos os recursos a qualquer momento."
echo "  - Rollback: veja infrastructure/README.md e docs/OPERATIONS_RUNBOOK.md."
