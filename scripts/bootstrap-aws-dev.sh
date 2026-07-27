#!/usr/bin/env bash
# FERRAMENTA DE RECUPERAÇÃO MANUAL — NÃO é mais o caminho principal de implantação.
#
# O caminho principal agora é a pipeline CodePipeline/CodeBuild: rode
# scripts/bootstrap-codepipeline-dev.sh (uma única vez, para autorizar a CodeConnection
# e criar a pipeline) e, a partir daí, todo push em feat/fase-1-design-system implanta
# automaticamente (build das imagens, cdk deploy, migrações, smoke tests — tudo dentro
# do CodeBuild, nunca neste CloudShell). Ver docs/OPERATIONS_RUNBOOK.md.
#
# Use este script só se precisar implantar SeleconPortalDevStack manualmente e de
# forma isolada (ex.: diagnosticar um problema de CDK sem esperar a pipeline rodar) —
# nunca faz Docker build; assume que as imagens (`:dev` ou uma tag de commit) já
# existem no ECR. Nunca executado neste sandbox (sem credenciais AWS reais aqui).
#
# O que este script NUNCA faz:
#   - excluir ou substituir qualquer recurso existente (VPC, ALB, cluster, serviço web);
#   - assumir um account ID, região ou ID de recurso diferente do informado;
#   - esconder um erro (roda com `set -euo pipefail` — qualquer falha para o script);
#   - tocar em CodeConnection ou na stack da pipeline (isso é
#     scripts/bootstrap-codepipeline-dev.sh).

set -euo pipefail

EXPECTED_ACCOUNT="518825425828"
EXPECTED_REGION="us-east-1"
VPC_ID="vpc-0b5fb2dcfb604f371"
CLUSTER_NAME="selecon-portal-dev"
ALB_NAME="selecon-portal-dev-alb"
STACK_NAME="SeleconPortalDevStack"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CDK_DIR="$REPO_ROOT/infrastructure/cdk"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33m[aviso]\033[0m %s\n' "$1"; }
fail() { printf '\033[1;31m[erro]\033[0m %s\n' "$1"; exit 1; }

confirm_sim() {
  local prompt="$1"
  read -r -p "$prompt (digite SIM em maiúsculas para continuar): " answer
  if [[ "$answer" != "SIM" ]]; then
    echo "Cancelado pelo operador."
    exit 1
  fi
}

command -v aws >/dev/null 2>&1 || fail "aws-cli não encontrado no PATH. Rode este script no AWS CloudShell."
command -v node >/dev/null 2>&1 || fail "Node.js não encontrado no PATH."
command -v pnpm >/dev/null 2>&1 || fail "pnpm não encontrado no PATH. Rode: corepack enable && corepack prepare pnpm@10 --activate"

read -r -p "Tag de imagem a implantar (Enter para 'dev'; use a tag de um commit se souber qual): " IMAGE_TAG_INPUT
IMAGE_TAG="${IMAGE_TAG_INPUT:-dev}"

log "1/6 — Validando conta e região"
CALLER_ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
CURRENT_REGION="${AWS_REGION:-$(aws configure get region || true)}"
[[ "$CALLER_ACCOUNT" == "$EXPECTED_ACCOUNT" ]] || fail "Conta atual ($CALLER_ACCOUNT) difere da esperada ($EXPECTED_ACCOUNT). Abortando por segurança."
[[ "$CURRENT_REGION" == "$EXPECTED_REGION" ]] || fail "Região atual ($CURRENT_REGION) difere da esperada ($EXPECTED_REGION). Exporte AWS_REGION=$EXPECTED_REGION."
echo "Conta: $CALLER_ACCOUNT | Região: $CURRENT_REGION — OK"

log "2/6 — Confirmando recursos existentes (nunca assumidos, sempre verificados)"
aws ec2 describe-vpcs --vpc-ids "$VPC_ID" --query 'Vpcs[0].VpcId' --output text \
  || fail "VPC '$VPC_ID' não encontrada."
aws ecs describe-clusters --clusters "$CLUSTER_NAME" --query 'clusters[0].status' --output text \
  || fail "Cluster ECS '$CLUSTER_NAME' não encontrado."
ALB_ARN="$(aws elbv2 describe-load-balancers --names "$ALB_NAME" --query 'LoadBalancers[0].LoadBalancerArn' --output text)"
[[ -n "$ALB_ARN" && "$ALB_ARN" != "None" ]] || fail "ALB '$ALB_NAME' não encontrado."
LISTENER_ARN="$(aws elbv2 describe-listeners --load-balancer-arn "$ALB_ARN" --query 'Listeners[?Port==`80`].ListenerArn | [0]' --output text)"
[[ -n "$LISTENER_ARN" && "$LISTENER_ARN" != "None" ]] || fail "Listener HTTP:80 do ALB não encontrado."
echo "Recursos existentes confirmados. ALB ARN: $ALB_ARN | Listener ARN: $LISTENER_ARN"

for REPO in selecon-portal/web-dev selecon-portal/api-dev selecon-portal/worker-dev; do
  aws ecr describe-images --repository-name "$REPO" --image-ids "imageTag=$IMAGE_TAG" \
    --query 'imageDetails[0].imageTags' --output text >/dev/null \
    || fail "Imagem com tag '$IMAGE_TAG' não encontrada em $REPO — implante via a pipeline (que builda e publica antes de fazer cdk deploy) ou publique manualmente antes de rodar este script."
done
echo "Imagens com a tag '$IMAGE_TAG' confirmadas nos três repositórios ECR."

log "3/6 — Instalando dependências do CDK"
(cd "$CDK_DIR" && pnpm install --ignore-workspace --frozen-lockfile)

log "4/6 — cdk synth"
read -r -p "E-mail para receber alarmes do CloudWatch (Enter para pular): " ALARM_EMAIL
CDK_CONTEXT_ARGS=(-c "albListenerArn=$LISTENER_ARN" -c "imageTag=$IMAGE_TAG")
[[ -n "$ALARM_EMAIL" ]] && CDK_CONTEXT_ARGS+=(-c "alarmEmail=$ALARM_EMAIL")

(cd "$CDK_DIR" && npx cdk synth "$STACK_NAME" "${CDK_CONTEXT_ARGS[@]}")

log "5/6 — cdk diff (revise antes de prosseguir)"
(cd "$CDK_DIR" && npx cdk diff "$STACK_NAME" "${CDK_CONTEXT_ARGS[@]}") \
  || fail "cdk diff falhou (erro real, não apenas diferenças) — corrija a causa raiz antes de continuar."

echo
echo "Revise o diff acima com atenção. Nenhum recurso existente (VPC, ALB, cluster, serviço"
echo "web) deve aparecer como destruído ou substituído — este stack só os referencia."
confirm_sim "Prosseguir com 'cdk deploy $STACK_NAME'?"

log "6/6 — cdk deploy $STACK_NAME"
(cd "$CDK_DIR" && npx cdk deploy "$STACK_NAME" "${CDK_CONTEXT_ARGS[@]}" --require-approval never)

DB_SECRET_ARN="$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='DatabaseSecretArn'].OutputValue | [0]" --output text)"
DB_HOST="$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='DatabaseEndpoint'].OutputValue | [0]" --output text)"
API_TG_ARN="$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='ApiTargetGroupArn'].OutputValue | [0]" --output text)"
ALB_DNS="$(aws elbv2 describe-load-balancers --names "$ALB_NAME" --query 'LoadBalancers[0].DNSName' --output text)"

log "Concluído"
echo "DatabaseSecretArn: $DB_SECRET_ARN"
echo "DatabaseEndpoint:  $DB_HOST"
echo "ApiTargetGroupArn: $API_TG_ARN"
echo "URL do portal:     http://$ALB_DNS"
echo
echo "Nota: este script NÃO atualiza o serviço web existente (selecon-portal-dev-web) —"
echo "isso é feito por buildspec-deploy.yml (dentro da pipeline) ou, manualmente, por"
echo "scripts/build-push-deploy-dev.sh. Não repete migrações automaticamente — ver"
echo "docs/OPERATIONS_RUNBOOK.md para o procedimento manual se precisar."
echo
echo "Para o fluxo normal (pipeline automatizada): scripts/bootstrap-codepipeline-dev.sh"
echo "Para validação somente-leitura a qualquer momento: scripts/check-aws-dev.sh"
