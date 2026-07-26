#!/usr/bin/env bash
# Ativação completa do Portal Selecon DEV — build, push, cdk deploy, atualização do
# serviço web existente, validação de ECS/ALB/logs e migração do banco. Feito para
# rodar no AWS CloudShell (conta 518825425828, região us-east-1), NUNCA neste sandbox
# de desenvolvimento (sem credenciais AWS reais nem acesso ao Docker Hub aqui — ver
# docs/OPERATIONS_RUNBOOK.md e docs/ASSUMPTIONS.md).
#
# O que este script NUNCA faz:
#   - recriar ou substituir VPC, ALB, cluster ECS ou o serviço selecon-portal-dev-web;
#   - tocar em qualquer recurso de PRD (não existe nem uma referência a PRD aqui);
#   - apagar recursos;
#   - prosseguir com o deploy se o diff indicar substituição/remoção de algo existente;
#   - executar `cdk deploy` sem confirmação explícita do operador (digitando SIM);
#   - esconder uma falha (roda com `set -euo pipefail`; qualquer comando que falhe para
#     o script, exceto onde explicitamente tratado).
#
# Pré-requisitos no ambiente onde este script roda: aws-cli, docker (com daemon
# acessível), node, pnpm (corepack), jq.

set -euo pipefail

EXPECTED_ACCOUNT="518825425828"
EXPECTED_REGION="us-east-1"
EXPECTED_BRANCH="feat/fase-1-design-system"
EXPECTED_COMMIT="4ad1cd8"

VPC_ID="vpc-0b5fb2dcfb604f371"
CLUSTER_NAME="selecon-portal-dev"
ALB_NAME="selecon-portal-dev-alb"
WEB_SERVICE_NAME="selecon-portal-dev-web"
API_SERVICE_NAME="selecon-portal-dev-api"
WORKER_SERVICE_NAME="selecon-portal-dev-worker"
ECR_REPOS=(selecon-portal/web-dev selecon-portal/api-dev selecon-portal/worker-dev)
STACK_NAME="SeleconPortalDevStack"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CDK_DIR="$REPO_ROOT/infrastructure/cdk"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33m[aviso]\033[0m %s\n' "$1"; }
fail() { printf '\033[1;31m[erro]\033[0m %s\n' "$1"; exit 1; }
ok() { printf '  \033[1;32m✔\033[0m %s\n' "$1"; }

confirm_sim() {
  local prompt="$1"
  read -r -p "$prompt (digite SIM em maiúsculas para continuar): " answer
  if [[ "$answer" != "SIM" ]]; then
    echo "Cancelado pelo operador (resposta: '${answer:-<vazio>}')."
    exit 1
  fi
}

for cmd in aws docker node pnpm jq git; do
  command -v "$cmd" >/dev/null 2>&1 || fail "'$cmd' não encontrado no PATH. Instale-o antes de continuar (o AWS CloudShell já traz aws-cli, docker, node e git; rode 'corepack enable' para pnpm)."
done

# ============================================================================
# ETAPA 1 — repositório
# ============================================================================
log "1/13 — Repositório e commit"
cd "$REPO_ROOT"

git remote get-url origin 2>/dev/null | grep -qi "novo-site-selecon" \
  || fail "Este diretório não parece ser o clone de novo-site-selecon (remote origin: $(git remote get-url origin 2>/dev/null || echo '<nenhum>'))."

CURRENT_BRANCH="$(git branch --show-current)"
[[ "$CURRENT_BRANCH" == "$EXPECTED_BRANCH" ]] \
  || fail "Branch atual ('$CURRENT_BRANCH') difere da esperada ('$EXPECTED_BRANCH'). git checkout $EXPECTED_BRANCH"

if [[ -n "$(git status --porcelain)" ]]; then
  fail "Working tree não está limpa. git status para ver o que falta commitar/descartar."
fi

git fetch origin "$EXPECTED_BRANCH"
git pull origin "$EXPECTED_BRANCH"

CURRENT_COMMIT="$(git rev-parse --short HEAD)"
git merge-base --is-ancestor "$EXPECTED_COMMIT" HEAD \
  || fail "HEAD ($CURRENT_COMMIT) não é o commit esperado ($EXPECTED_COMMIT) nem um descendente dele."
ok "Branch: $CURRENT_BRANCH | Commit: $CURRENT_COMMIT | working tree limpa"

# ============================================================================
# Conta, região e recursos existentes (nunca assumidos — sempre confirmados)
# ============================================================================
log "2/13 — Conta AWS, região e recursos existentes"
CALLER_ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
CURRENT_REGION="${AWS_REGION:-$(aws configure get region || true)}"
[[ "$CALLER_ACCOUNT" == "$EXPECTED_ACCOUNT" ]] || fail "Conta atual ($CALLER_ACCOUNT) difere da esperada ($EXPECTED_ACCOUNT). Este script só roda na conta DEV."
[[ "$CURRENT_REGION" == "$EXPECTED_REGION" ]] || fail "Região atual ($CURRENT_REGION) difere da esperada ($EXPECTED_REGION). export AWS_REGION=$EXPECTED_REGION"
ok "Conta: $CALLER_ACCOUNT | Região: $CURRENT_REGION"

aws ec2 describe-vpcs --vpc-ids "$VPC_ID" --query 'Vpcs[0].VpcId' --output text >/dev/null \
  || fail "VPC $VPC_ID não encontrada."
ok "VPC $VPC_ID confirmada"

CLUSTER_STATUS="$(aws ecs describe-clusters --clusters "$CLUSTER_NAME" --query 'clusters[0].status' --output text)"
[[ "$CLUSTER_STATUS" == "ACTIVE" ]] || fail "Cluster ECS $CLUSTER_NAME não está ACTIVE (status: $CLUSTER_STATUS)."
ok "Cluster ECS $CLUSTER_NAME: ACTIVE"

ALB_ARN="$(aws elbv2 describe-load-balancers --names "$ALB_NAME" --query 'LoadBalancers[0].LoadBalancerArn' --output text)"
[[ -n "$ALB_ARN" && "$ALB_ARN" != "None" ]] || fail "ALB $ALB_NAME não encontrado."
ok "ALB $ALB_NAME confirmado"

WEB_SERVICE_STATUS="$(aws ecs describe-services --cluster "$CLUSTER_NAME" --services "$WEB_SERVICE_NAME" --query 'services[0].status' --output text)"
[[ "$WEB_SERVICE_STATUS" == "ACTIVE" ]] || fail "Serviço $WEB_SERVICE_NAME não está ACTIVE (status: $WEB_SERVICE_STATUS)."
ok "Serviço $WEB_SERVICE_NAME: ACTIVE (será atualizado, nunca recriado)"

for REPO in "${ECR_REPOS[@]}"; do
  aws ecr describe-repositories --repository-names "$REPO" --query 'repositories[0].repositoryName' --output text >/dev/null \
    || fail "Repositório ECR $REPO não encontrado."
done
ok "Três repositórios ECR confirmados"

# ============================================================================
# Espaço em disco
# ============================================================================
log "3/13 — Espaço em disco"
AVAILABLE_KB="$(df --output=avail "$REPO_ROOT" | tail -1 | tr -d ' ')"
AVAILABLE_GB=$((AVAILABLE_KB / 1024 / 1024))
echo "Disponível em $REPO_ROOT: ${AVAILABLE_GB}GiB"
[[ "$AVAILABLE_GB" -ge 5 ]] || fail "Menos de 5GiB livres — builds Docker provavelmente falharão por falta de espaço. Rode 'docker system prune -af' e libere espaço antes de continuar."
ok "Espaço suficiente"

# ============================================================================
# ETAPA 2 — Docker builds
# ============================================================================
log "4/13 — Docker builds (web, api, worker)"
docker info >/dev/null 2>&1 || fail "Docker daemon não está acessível neste ambiente."

declare -A LOCAL_TAGS=(
  [web]="selecon-portal-web-dev:dev"
  [api]="selecon-portal-api-dev:dev"
  [worker]="selecon-portal-worker-dev:dev"
)

for NAME in web api worker; do
  DOCKERFILE="apps/$NAME/Dockerfile"
  log "  Build: $DOCKERFILE -> ${LOCAL_TAGS[$NAME]}"
  if ! docker build -f "$DOCKERFILE" -t "${LOCAL_TAGS[$NAME]}" "$REPO_ROOT"; then
    fail "Build de $DOCKERFILE falhou (ver mensagem acima). Não prossiga sem corrigir a causa raiz — não é um problema para contornar, é para corrigir no Dockerfile ou no código."
  fi
  ok "${LOCAL_TAGS[$NAME]} construída"
done

# ============================================================================
# ETAPA 3 — Login e publicação no ECR
# ============================================================================
log "5/13 — Login e publicação no ECR"
export AWS_ACCOUNT_ID="$EXPECTED_ACCOUNT"
export ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$EXPECTED_REGION.amazonaws.com"

aws ecr get-login-password --region "$EXPECTED_REGION" \
  | docker login --username AWS --password-stdin "$ECR_URI"

declare -A REMOTE_URIS=(
  [web]="$ECR_URI/selecon-portal/web-dev:dev"
  [api]="$ECR_URI/selecon-portal/api-dev:dev"
  [worker]="$ECR_URI/selecon-portal/worker-dev:dev"
)

for NAME in web api worker; do
  docker tag "${LOCAL_TAGS[$NAME]}" "${REMOTE_URIS[$NAME]}"
  docker push "${REMOTE_URIS[$NAME]}"
done

log "  Confirmando imagens publicadas (tag, digest, data do push)"
for REPO in "${ECR_REPOS[@]}"; do
  aws ecr describe-images --repository-name "$REPO" --image-ids imageTag=dev \
    --query 'imageDetails[0].{repo:`'"$REPO"'`,tag:imageTags[0],digest:imageDigest,pushedAt:imagePushedAt}' \
    --output table \
    || fail "Imagem :dev não encontrada em $REPO logo após o push."
done

# ============================================================================
# ETAPA 4 — Validações antes do deploy
# ============================================================================
log "6/13 — Validações antes do deploy"

LISTENER_ARN="$(aws elbv2 describe-listeners --load-balancer-arn "$ALB_ARN" --query 'Listeners[?Port==`80`].ListenerArn | [0]' --output text)"
[[ -n "$LISTENER_ARN" && "$LISTENER_ARN" != "None" ]] || fail "Listener HTTP:80 não encontrado no ALB."

EXISTING_RULE_AT_10="$(aws elbv2 describe-rules --listener-arn "$LISTENER_ARN" --query "Rules[?Priority=='10'].RuleArn | [0]" --output text)"
if [[ -n "$EXISTING_RULE_AT_10" && "$EXISTING_RULE_AT_10" != "None" ]]; then
  RULE_TG="$(aws elbv2 describe-rules --listener-arn "$LISTENER_ARN" --rule-arns "$EXISTING_RULE_AT_10" --query 'Rules[0].Actions[0].TargetGroupArn' --output text)"
  warn "Já existe uma regra na prioridade 10 (target group: $RULE_TG) — presumivelmente de um deploy anterior desta stack. O 'cdk diff' abaixo mostrará se ela será atualizada; revise com atenção."
else
  ok "Prioridade 10 livre no listener"
fi

STACK_STATUS="$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_FOUND")"
echo "Status atual de $STACK_NAME: $STACK_STATUS"
if [[ "$STACK_STATUS" == "NOT_FOUND" ]]; then
  log "  Primeiro deploy — checando ausência de recursos conflitantes fora desta stack"
  if aws rds describe-db-instances --db-instance-identifier selecon-portal-dev >/dev/null 2>&1; then
    fail "Já existe uma instância RDS 'selecon-portal-dev' fora desta stack. Investigue antes de prosseguir."
  fi
  if aws elasticache describe-cache-clusters --cache-cluster-id selecon-portal-dev >/dev/null 2>&1; then
    fail "Já existe um cluster ElastiCache 'selecon-portal-dev' fora desta stack. Investigue antes de prosseguir."
  fi
  if aws ecs describe-services --cluster "$CLUSTER_NAME" --services "$API_SERVICE_NAME" --query 'services[0].status' --output text 2>/dev/null | grep -q ACTIVE; then
    fail "Já existe um serviço ECS '$API_SERVICE_NAME' ACTIVE fora desta stack. Investigue antes de prosseguir."
  fi
  if aws ecs describe-services --cluster "$CLUSTER_NAME" --services "$WORKER_SERVICE_NAME" --query 'services[0].status' --output text 2>/dev/null | grep -q ACTIVE; then
    fail "Já existe um serviço ECS '$WORKER_SERVICE_NAME' ACTIVE fora desta stack. Investigue antes de prosseguir."
  fi
  ok "Nenhum recurso conflitante encontrado"
elif [[ "$STACK_STATUS" == *ROLLBACK* || "$STACK_STATUS" == *FAILED* ]]; then
  fail "$STACK_NAME está em estado problemático ($STACK_STATUS). Resolva manualmente no console do CloudFormation antes de repetir o deploy."
else
  ok "Stack já existe em estado $STACK_STATUS — este é um deploy de atualização"
fi

ok "DATABASE_URL: composta em runtime a partir de DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME (packages/db/src/client.ts) — nunca o JSON bruto do Secrets Manager"
ok "REDIS_URL: presente no ambiente das tasks api/worker (infrastructure/cdk/lib/selecon-portal-stack.ts)"

# ============================================================================
# ETAPA 5 — cdk synth + diff
# ============================================================================
log "7/13 — cdk synth e cdk diff"
(cd "$CDK_DIR" && pnpm install --ignore-workspace --frozen-lockfile)

read -r -p "E-mail para alarmes do CloudWatch (Enter para pular): " ALARM_EMAIL
CDK_CONTEXT_ARGS=(-c "albListenerArn=$LISTENER_ARN")
[[ -n "$ALARM_EMAIL" ]] && CDK_CONTEXT_ARGS+=(-c "alarmEmail=$ALARM_EMAIL")

(cd "$CDK_DIR" && npx cdk synth "$STACK_NAME" "${CDK_CONTEXT_ARGS[@]}") \
  || fail "cdk synth falhou — corrija o erro acima antes de continuar."
ok "cdk synth OK"

DIFF_FILE="$(mktemp)"
(cd "$CDK_DIR" && npx cdk diff "$STACK_NAME" "${CDK_CONTEXT_ARGS[@]}" 2>&1 | tee "$DIFF_FILE") || true

log "  Resumo objetivo do diff"
ADDED="$(grep -c '^\[+\]' "$DIFF_FILE" || true)"
UPDATED="$(grep -c '^\[~\]' "$DIFF_FILE" || true)"
REMOVED="$(grep -c '^\[-\]' "$DIFF_FILE" || true)"
echo "  Recursos adicionados:  $ADDED"
echo "  Recursos atualizados:  $UPDATED"
echo "  Recursos removidos:    $REMOVED"

DESTRUCTIVE=0
if grep -qE '\[-\].*(AWS::EC2::VPC[^L[:alnum:]]|AWS::ElasticLoadBalancingV2::LoadBalancer|AWS::ECS::Cluster[^C])' "$DIFF_FILE"; then
  warn "O diff mostra REMOÇÃO de VPC, ALB ou cluster — isso NUNCA deveria acontecer (este stack só referencia esses recursos)."
  DESTRUCTIVE=1
fi
if grep -qiE '(replace|destroy)' "$DIFF_FILE" && grep -qi "selecon-portal-dev-web" "$DIFF_FILE" 2>/dev/null; then
  warn "O diff menciona o serviço web existente junto de uma possível substituição/destruição."
  DESTRUCTIVE=1
fi
if grep -qi "Replacement" "$DIFF_FILE"; then
  warn "O diff contém ao menos uma substituição de recurso (\"Replacement\") — revise a saída completa acima."
  DESTRUCTIVE=1
fi

if [[ "$DESTRUCTIVE" == "1" ]]; then
  fail "PARANDO por segurança — o diff acima indica risco de substituição/remoção destrutiva. Revise manualmente linha por linha antes de decidir como prosseguir. Este script não continua automaticamente nesse caso."
fi
rm -f "$DIFF_FILE"

echo
echo "Risco de perda de dados: nenhum identificado automaticamente (RDS/ElastiCache não aparecem como destruídos/substituídos no diff acima — confirme visualmente)."
echo "Impacto nos recursos existentes: nenhum (VPC/ALB/cluster/serviço web são apenas referenciados, não geridos por este stack)."
confirm_sim "Revisou o diff completo impresso acima? Prosseguir com 'cdk deploy $STACK_NAME'?"

# ============================================================================
# ETAPA 6 — cdk deploy
# ============================================================================
log "8/13 — cdk deploy $STACK_NAME"
(cd "$CDK_DIR" && npx cdk deploy "$STACK_NAME" "${CDK_CONTEXT_ARGS[@]}" --require-approval never) || {
  echo
  echo "cdk deploy falhou ou sofreu rollback. Eventos recentes do CloudFormation:"
  aws cloudformation describe-stack-events --stack-name "$STACK_NAME" \
    --query 'StackEvents[?contains(ResourceStatus, `FAILED`)].{time:Timestamp,resource:LogicalResourceId,status:ResourceStatus,reason:ResourceStatusReason}' \
    --output table || true
  fail "Identifique a causa raiz acima, corrija e rode este script novamente (idempotente — as etapas já concluídas não causam problema em repetir)."
}
ok "cdk deploy concluído"

DB_SECRET_ARN="$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='DatabaseSecretArn'].OutputValue | [0]" --output text)"
DB_HOST="$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='DatabaseEndpoint'].OutputValue | [0]" --output text)"
API_TARGET_GROUP_ARN="$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='ApiTargetGroupArn'].OutputValue | [0]" --output text)"
API_INTERNAL_URL="$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='ApiInternalUrl'].OutputValue | [0]" --output text)"
echo "DatabaseSecretArn: $DB_SECRET_ARN"
echo "DatabaseEndpoint:  $DB_HOST"
echo "ApiInternalUrl:    $API_INTERNAL_URL"

# ============================================================================
# ETAPA 7 — atualizar o serviço web existente (imagem + API_INTERNAL_URL)
# ============================================================================
log "9/13 — Atualizando o serviço web existente"

CURRENT_WEB_TASK_DEF="$(aws ecs describe-task-definition --task-definition "$WEB_SERVICE_NAME" --query 'taskDefinition')"
NEW_WEB_CONTAINER_DEFS="$(echo "$CURRENT_WEB_TASK_DEF" | jq --arg IMAGE "${REMOTE_URIS[web]}" --arg API_URL "$API_INTERNAL_URL" '
  .containerDefinitions | map(
    .image = $IMAGE
    | .environment = ((.environment // []) | map(select(.name != "API_INTERNAL_URL")) + [{name: "API_INTERNAL_URL", value: $API_URL}])
  )
')
NEW_WEB_TASK_DEF="$(echo "$CURRENT_WEB_TASK_DEF" | jq --argjson CONTAINERS "$NEW_WEB_CONTAINER_DEFS" '
  {family, taskRoleArn, executionRoleArn, networkMode, containerDefinitions: $CONTAINERS, requiresCompatibilities, cpu, memory, runtimePlatform}
')
WEB_TASK_DEF_FILE="$(mktemp)"
echo "$NEW_WEB_TASK_DEF" > "$WEB_TASK_DEF_FILE"
aws ecs register-task-definition --cli-input-json "file://$WEB_TASK_DEF_FILE" >/dev/null
rm -f "$WEB_TASK_DEF_FILE"

aws ecs update-service --cluster "$CLUSTER_NAME" --service "$WEB_SERVICE_NAME" \
  --task-definition "$WEB_SERVICE_NAME" --force-new-deployment >/dev/null
ok "Serviço $WEB_SERVICE_NAME atualizado para a nova task definition/imagem"

# api/worker usam a tag mutável ":dev" — cdk deploy só percebe mudança se a PROPRIEDADE
# da task definition mudar; como a tag é a mesma, force-new-deployment garante que a
# imagem recém-publicada seja repuxada mesmo assim.
log "  Forçando nova implantação de api e worker (repuxa a tag :dev recém-publicada)"
aws ecs update-service --cluster "$CLUSTER_NAME" --service "$API_SERVICE_NAME" --force-new-deployment >/dev/null
aws ecs update-service --cluster "$CLUSTER_NAME" --service "$WORKER_SERVICE_NAME" --force-new-deployment >/dev/null

log "  Aguardando steady state (pode levar alguns minutos)"
aws ecs wait services-stable --cluster "$CLUSTER_NAME" \
  --services "$WEB_SERVICE_NAME" "$API_SERVICE_NAME" "$WORKER_SERVICE_NAME" \
  || warn "Serviços não atingiram steady state dentro do tempo padrão do 'wait' — a validação da ETAPA 8 abaixo vai mostrar o estado real."

# ============================================================================
# ETAPA 8 — validar ECS
# ============================================================================
log "10/13 — Validando ECS"
for SERVICE in "$WEB_SERVICE_NAME" "$API_SERVICE_NAME" "$WORKER_SERVICE_NAME"; do
  echo "--- $SERVICE ---"
  aws ecs describe-services --cluster "$CLUSTER_NAME" --services "$SERVICE" \
    --query 'services[0].{serviceName:serviceName,desiredCount:desiredCount,runningCount:runningCount,pendingCount:pendingCount,rolloutState:deployments[0].rolloutState,taskDefinition:taskDefinition}' \
    --output table
  echo "Eventos recentes:"
  aws ecs describe-services --cluster "$CLUSTER_NAME" --services "$SERVICE" \
    --query 'services[0].events[0:5].{time:createdAt,message:message}' --output table
done

log "  Checando tasks paradas por falha (janela recente)"
FOUND_FAILURE=0
for SERVICE in "$WEB_SERVICE_NAME" "$API_SERVICE_NAME" "$WORKER_SERVICE_NAME"; do
  STOPPED_TASKS="$(aws ecs list-tasks --cluster "$CLUSTER_NAME" --service-name "$SERVICE" --desired-status STOPPED --query 'taskArns' --output text)"
  for TASK in $STOPPED_TASKS; do
    [[ -z "$TASK" ]] && continue
    REASON="$(aws ecs describe-tasks --cluster "$CLUSTER_NAME" --tasks "$TASK" --query 'tasks[0].stoppedReason' --output text)"
    if echo "$REASON" | grep -qiE "CannotPullContainer|ResourceInitializationError|EssentialContainerExited|OutOfMemory|secret"; then
      warn "$SERVICE — task parada: $REASON"
      FOUND_FAILURE=1
    fi
  done
done
[[ "$FOUND_FAILURE" == "0" ]] && ok "Nenhum padrão de falha conhecido encontrado em tasks paradas recentes"

# ============================================================================
# ETAPA 9 — validar ALB
# ============================================================================
log "11/13 — Validando o ALB"
ALB_DNS="$(aws elbv2 describe-load-balancers --names "$ALB_NAME" --query 'LoadBalancers[0].DNSName' --output text)"
echo "DNS do ALB: $ALB_DNS"
aws elbv2 describe-listeners --load-balancer-arn "$ALB_ARN" --output table
aws elbv2 describe-rules --listener-arn "$LISTENER_ARN" --output table
echo "Target health (api):"
aws elbv2 describe-target-health --target-group-arn "$API_TARGET_GROUP_ARN" --output table

echo
echo "Testando a URL pública real..."
HOME_CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "http://$ALB_DNS/" || echo "000")"
API_CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "http://$ALB_DNS/api/health/ready" || echo "000")"
echo "GET /                    -> $HOME_CODE"
echo "GET /api/health/ready    -> $API_CODE"
[[ "$HOME_CODE" == "200" ]] || warn "Home não retornou 200 (retornou $HOME_CODE) — investigue via logs (próxima etapa) antes de considerar concluído."
[[ "$API_CODE" == "200" ]] || warn "/api/health/ready não retornou 200 (retornou $API_CODE) — investigue via logs antes de considerar concluído."

# ============================================================================
# ETAPA 10 — logs
# ============================================================================
log "  Checando logs recentes por padrões de falha"
for LOG_GROUP in /selecon-portal/dev/web /selecon-portal/dev/api /selecon-portal/dev/worker; do
  echo "--- $LOG_GROUP ---"
  RECENT="$(aws logs tail "$LOG_GROUP" --since 15m 2>/dev/null || echo "")"
  MATCHES="$(echo "$RECENT" | grep -iE "error|exception|ECONNREFUSED|prisma|invalid.*secret|500" || true)"
  if [[ -n "$MATCHES" ]]; then
    echo "$MATCHES" | tail -20
  else
    echo "  (nenhum padrão de erro encontrado nas últimas linhas)"
  fi
done

# ============================================================================
# ETAPA 11 — migrações (execução única, controlada, via task Fargate avulsa)
# ============================================================================
log "12/13 — Migrações do banco"
echo "Rodando via 'aws ecs run-task' com a task definition da api (mesma rede/segredos do"
echo "serviço) — nem CloudShell nem o host deste script conseguem alcançar o RDS"
echo "diretamente (é privado à VPC, sem acesso público)."

API_TASK_DEF_ARN="$(aws ecs describe-task-definition --task-definition "$API_SERVICE_NAME" --query 'taskDefinition.taskDefinitionArn' --output text)"
API_SERVICE_NETWORK_CONFIG="$(aws ecs describe-services --cluster "$CLUSTER_NAME" --services "$API_SERVICE_NAME" --query 'services[0].networkConfiguration' --output json)"

RUN_TASK_OUTPUT="$(aws ecs run-task \
  --cluster "$CLUSTER_NAME" \
  --task-definition "$API_TASK_DEF_ARN" \
  --launch-type FARGATE \
  --network-configuration "$API_SERVICE_NETWORK_CONFIG" \
  --overrides '{"containerOverrides":[{"name":"api","command":["node","dist/scripts/run-migrations.js"]}]}' \
  --query 'tasks[0].taskArn' --output text)"

[[ -n "$RUN_TASK_OUTPUT" && "$RUN_TASK_OUTPUT" != "None" ]] || fail "Falha ao iniciar a task de migração."
echo "Task de migração: $RUN_TASK_OUTPUT"
echo "Aguardando conclusão..."
aws ecs wait tasks-stopped --cluster "$CLUSTER_NAME" --tasks "$RUN_TASK_OUTPUT"

EXIT_CODE="$(aws ecs describe-tasks --cluster "$CLUSTER_NAME" --tasks "$RUN_TASK_OUTPUT" \
  --query 'tasks[0].containers[0].exitCode' --output text)"
STOP_REASON="$(aws ecs describe-tasks --cluster "$CLUSTER_NAME" --tasks "$RUN_TASK_OUTPUT" \
  --query 'tasks[0].stoppedReason' --output text)"

if [[ "$EXIT_CODE" != "0" ]]; then
  fail "Migração falhou (exitCode=$EXIT_CODE, motivo: $STOP_REASON). Veja os logs em /selecon-portal/dev/api (stream com prefixo 'api/') antes de repetir."
fi
ok "Migração aplicada com sucesso (exitCode=0)"

log "  Confirmando: nenhuma migração pendente"
STATUS_TASK_OUTPUT="$(aws ecs run-task \
  --cluster "$CLUSTER_NAME" \
  --task-definition "$API_TASK_DEF_ARN" \
  --launch-type FARGATE \
  --network-configuration "$API_SERVICE_NETWORK_CONFIG" \
  --overrides '{"containerOverrides":[{"name":"api","command":["node_modules/.bin/prisma","migrate","status","--schema","packages/db/prisma/schema.prisma"]}]}' \
  --query 'tasks[0].taskArn' --output text)"
aws ecs wait tasks-stopped --cluster "$CLUSTER_NAME" --tasks "$STATUS_TASK_OUTPUT"
echo "(ver /selecon-portal/dev/api para a saída de 'prisma migrate status' — deve indicar 'Database schema is up to date!')"

echo
echo "Usuários/credenciais iniciais: aplicados pelo seed já documentado em"
echo "packages/db/prisma/seed.ts — rode-o manualmente (via a mesma técnica de run-task,"
echo "com o comando de container substituído) se ainda não houver dados de demonstração"
echo "neste ambiente; não é repetido automaticamente aqui para não recriar dados a cada deploy."

# ============================================================================
# ETAPA 13 — relatório final
# ============================================================================
log "13/13 — Relatório final"
echo "URL do portal:        http://$ALB_DNS"
echo "API health:           http://$ALB_DNS/api/health/ready"
echo "Commit implantado:    $CURRENT_COMMIT"
echo "Status CloudFormation: $(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query 'Stacks[0].StackStatus' --output text)"
echo
echo "Próximos passos sugeridos:"
echo "  - scripts/check-aws-dev.sh a qualquer momento, para validação somente-leitura."
echo "  - Testar login administrativo em http://$ALB_DNS/admin/login."
echo "  - Rodar a suíte Playwright: E2E_BASE_URL=http://$ALB_DNS npx playwright test (a partir de e2e/)."
echo "  - Se algum HTTP code acima não foi 200 ou algum aviso apareceu, NÃO considere a"
echo "    ativação concluída — investigue pela causa raiz antes de prosseguir."
