#!/usr/bin/env bash
# Validação somente-leitura do ambiente AWS DEV do Portal Selecon (seção 24 do prompt
# mestre). Roda no AWS CloudShell (ou qualquer shell com aws-cli configurado) — nunca
# executado neste sandbox de desenvolvimento (sem credenciais AWS reais aqui). Não
# modifica nenhum recurso; só consulta e imprime status.

set -uo pipefail

REGION="${AWS_REGION:-us-east-1}"
CLUSTER_NAME="selecon-portal-dev"
ALB_NAME="selecon-portal-dev-alb"

pass() { printf '  \033[1;32m✔\033[0m %s\n' "$1"; }
fail() { printf '  \033[1;31m✘\033[0m %s\n' "$1"; FAILED=1; }
section() { printf '\n\033[1;34m%s\033[0m\n' "$1"; }

FAILED=0

section "Conta e região"
ACCOUNT="$(aws sts get-caller-identity --query Account --output text 2>/dev/null)"
if [[ -n "$ACCOUNT" ]]; then pass "Conta: $ACCOUNT | Região: $REGION"; else fail "Não foi possível autenticar com a AWS"; fi

section "Cluster ECS e serviços"
CLUSTER_STATUS="$(aws ecs describe-clusters --clusters "$CLUSTER_NAME" --query 'clusters[0].status' --output text 2>/dev/null)"
[[ "$CLUSTER_STATUS" == "ACTIVE" ]] && pass "Cluster $CLUSTER_NAME: ACTIVE" || fail "Cluster $CLUSTER_NAME: $CLUSTER_STATUS"

for SERVICE in selecon-portal-dev-web selecon-portal-dev-api selecon-portal-dev-worker; do
  INFO="$(aws ecs describe-services --cluster "$CLUSTER_NAME" --services "$SERVICE" \
    --query 'services[0].{status:status,desired:desiredCount,running:runningCount}' --output json 2>/dev/null)"
  if [[ -z "$INFO" || "$INFO" == "null" ]]; then
    fail "Serviço $SERVICE: não encontrado"
  else
    DESIRED=$(echo "$INFO" | node -pe "JSON.parse(require('fs').readFileSync(0)).desired" 2>/dev/null)
    RUNNING=$(echo "$INFO" | node -pe "JSON.parse(require('fs').readFileSync(0)).running" 2>/dev/null)
    if [[ "$DESIRED" == "$RUNNING" && "$RUNNING" != "0" ]]; then
      pass "Serviço $SERVICE: desired=$DESIRED running=$RUNNING (steady state)"
    else
      fail "Serviço $SERVICE: desired=$DESIRED running=$RUNNING (fora do steady state)"
    fi
  fi
done

section "Application Load Balancer e target groups"
ALB_ARN="$(aws elbv2 describe-load-balancers --names "$ALB_NAME" --query 'LoadBalancers[0].LoadBalancerArn' --output text 2>/dev/null)"
if [[ -n "$ALB_ARN" && "$ALB_ARN" != "None" ]]; then
  pass "ALB $ALB_NAME encontrado"
  aws elbv2 describe-target-groups --load-balancer-arn "$ALB_ARN" --query 'TargetGroups[].TargetGroupName' --output text 2>/dev/null \
    | tr '\t' '\n' | while read -r TG; do
      [[ -z "$TG" ]] && continue
      TG_ARN="$(aws elbv2 describe-target-groups --names "$TG" --query 'TargetGroups[0].TargetGroupArn' --output text)"
      HEALTHY="$(aws elbv2 describe-target-health --target-group-arn "$TG_ARN" \
        --query "length(TargetHealthDescriptions[?TargetHealth.State=='healthy'])" --output text)"
      TOTAL="$(aws elbv2 describe-target-health --target-group-arn "$TG_ARN" \
        --query "length(TargetHealthDescriptions)" --output text)"
      if [[ "$HEALTHY" == "$TOTAL" && "$TOTAL" != "0" ]]; then
        pass "Target group $TG: $HEALTHY/$TOTAL saudáveis"
      else
        fail "Target group $TG: $HEALTHY/$TOTAL saudáveis"
      fi
    done
else
  fail "ALB $ALB_NAME não encontrado"
fi

section "ECR"
for REPO in selecon-portal/web-dev selecon-portal/api-dev selecon-portal/worker-dev; do
  LATEST="$(aws ecr describe-images --repository-name "$REPO" --query 'sort_by(imageDetails,&imagePushedAt)[-1].imageTags' --output text 2>/dev/null)"
  if [[ -n "$LATEST" && "$LATEST" != "None" ]]; then
    pass "$REPO — última tag: $LATEST"
  else
    fail "$REPO — sem imagens ou repositório não encontrado"
  fi
done

section "RDS"
DB_STATUS="$(aws rds describe-db-instances --db-instance-identifier selecon-portal-dev --query 'DBInstances[0].DBInstanceStatus' --output text 2>/dev/null)"
[[ "$DB_STATUS" == "available" ]] && pass "RDS selecon-portal-dev: available" || fail "RDS selecon-portal-dev: $DB_STATUS"

section "ElastiCache (Redis/Valkey)"
CACHE_STATUS="$(aws elasticache describe-cache-clusters --cache-cluster-id selecon-portal-dev --query 'CacheClusters[0].CacheClusterStatus' --output text 2>/dev/null)"
[[ "$CACHE_STATUS" == "available" ]] && pass "ElastiCache selecon-portal-dev: available" || fail "ElastiCache selecon-portal-dev: $CACHE_STATUS"

section "CodePipeline / CodeBuild / CodeConnection"
PIPELINE_STATE="$(aws codepipeline get-pipeline-state --name selecon-portal-dev --query 'stageStates[].{stage:stageName,status:latestExecution.status}' --output json 2>/dev/null)"
if [[ -n "$PIPELINE_STATE" && "$PIPELINE_STATE" != "null" ]]; then
  pass "Pipeline selecon-portal-dev encontrada"
  echo "$PIPELINE_STATE" | node -pe "
    JSON.parse(require('fs').readFileSync(0)).map(s => '    ' + s.stage + ': ' + (s.status || 'sem execução ainda')).join('\n')
  " 2>/dev/null
else
  fail "Pipeline selecon-portal-dev não encontrada"
fi

CONNECTION_STATUS="$(aws codeconnections list-connections --query "Connections[?ConnectionName=='selecon-portal-github'].ConnectionStatus | [0]" --output text 2>/dev/null)"
if [[ "$CONNECTION_STATUS" == "AVAILABLE" ]]; then
  pass "CodeConnection: AVAILABLE"
elif [[ -n "$CONNECTION_STATUS" && "$CONNECTION_STATUS" != "None" ]]; then
  fail "CodeConnection: $CONNECTION_STATUS (autorização manual pendente)"
else
  fail "CodeConnection não encontrada"
fi

section "URL pública"
ALB_URL="http://selecon-portal-dev-alb-1790035663.us-east-1.elb.amazonaws.com"
HTTP_CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$ALB_URL/" 2>/dev/null || echo "000")"
[[ "$HTTP_CODE" == "200" ]] && pass "$ALB_URL — HTTP $HTTP_CODE" || fail "$ALB_URL — HTTP $HTTP_CODE"

section "Resumo"
if [[ "$FAILED" == "0" ]]; then
  echo "Todos os checks passaram."
  exit 0
else
  echo "Um ou mais checks falharam — ver ✘ acima."
  exit 1
fi
