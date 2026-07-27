#!/usr/bin/env bash
# Validação somente-leitura do ambiente AWS DEV do Portal Selecon — arquitetura
# Elastic Beanstalk (Docker, container único). Roda no AWS CloudShell (ou qualquer
# shell com aws-cli configurado) — nunca executado neste sandbox de desenvolvimento
# (sem credenciais AWS reais aqui). Não modifica nenhum recurso; só consulta e
# imprime status.

set -uo pipefail

REGION="${AWS_REGION:-us-east-1}"
EB_APPLICATION_NAME="selecon-portal"
EB_ENVIRONMENT_NAME="selecon-portal-dev"
RDS_INSTANCE_ID="selecon-portal-dev"
ECR_REPOSITORY_NAME="selecon-portal/app-dev"
PIPELINE_NAME="selecon-portal-dev"
CODECONNECTION_ARN="arn:aws:codeconnections:us-east-1:518825425828:connection/5ff3c8d6-23b7-4459-8023-52cba5c0e33c"

pass() { printf '  \033[1;32m✔\033[0m %s\n' "$1"; }
fail() { printf '  \033[1;31m✘\033[0m %s\n' "$1"; FAILED=1; }
section() { printf '\n\033[1;34m%s\033[0m\n' "$1"; }

FAILED=0

section "Conta e região"
ACCOUNT="$(aws sts get-caller-identity --query Account --output text 2>/dev/null)"
if [[ -n "$ACCOUNT" ]]; then pass "Conta: $ACCOUNT | Região: $REGION"; else fail "Não foi possível autenticar com a AWS"; fi

section "RDS PostgreSQL"
DB_STATUS="$(aws rds describe-db-instances --db-instance-identifier "$RDS_INSTANCE_ID" --query 'DBInstances[0].DBInstanceStatus' --output text 2>/dev/null)"
[[ "$DB_STATUS" == "available" ]] && pass "RDS $RDS_INSTANCE_ID: available" || fail "RDS $RDS_INSTANCE_ID: ${DB_STATUS:-não encontrado}"

section "ECR"
LATEST="$(aws ecr describe-images --repository-name "$ECR_REPOSITORY_NAME" --query 'sort_by(imageDetails,&imagePushedAt)[-1].imageTags' --output text 2>/dev/null)"
if [[ -n "$LATEST" && "$LATEST" != "None" ]]; then
  pass "$ECR_REPOSITORY_NAME — última tag: $LATEST"
else
  fail "$ECR_REPOSITORY_NAME — sem imagens ou repositório não encontrado"
fi

section "Elastic Beanstalk"
EB_INFO="$(aws elasticbeanstalk describe-environments --application-name "$EB_APPLICATION_NAME" \
  --environment-names "$EB_ENVIRONMENT_NAME" \
  --query 'Environments[0].{status:Status,health:Health,version:VersionLabel,url:CNAME}' --output json 2>/dev/null)"
if [[ -n "$EB_INFO" && "$EB_INFO" != "null" ]]; then
  STATUS=$(echo "$EB_INFO" | node -pe "JSON.parse(require('fs').readFileSync(0)).status" 2>/dev/null)
  HEALTH=$(echo "$EB_INFO" | node -pe "JSON.parse(require('fs').readFileSync(0)).health" 2>/dev/null)
  VERSION=$(echo "$EB_INFO" | node -pe "JSON.parse(require('fs').readFileSync(0)).version" 2>/dev/null)
  EB_URL=$(echo "$EB_INFO" | node -pe "JSON.parse(require('fs').readFileSync(0)).url" 2>/dev/null)
  if [[ "$STATUS" == "Ready" && "$HEALTH" == "Green" ]]; then
    pass "Environment $EB_ENVIRONMENT_NAME: status=$STATUS health=$HEALTH versao=$VERSION"
  else
    fail "Environment $EB_ENVIRONMENT_NAME: status=$STATUS health=$HEALTH versao=$VERSION"
  fi
  echo "    URL: http://$EB_URL"
else
  fail "Environment $EB_ENVIRONMENT_NAME não encontrado"
  EB_URL=""
fi

section "CodePipeline"
PIPELINE_STATE="$(aws codepipeline get-pipeline-state --name "$PIPELINE_NAME" --query 'stageStates[].{stage:stageName,status:latestExecution.status}' --output json 2>/dev/null)"
if [[ -n "$PIPELINE_STATE" && "$PIPELINE_STATE" != "null" ]]; then
  pass "Pipeline $PIPELINE_NAME encontrada"
  echo "$PIPELINE_STATE" | node -pe "
    JSON.parse(require('fs').readFileSync(0)).map(s => '    ' + s.stage + ': ' + (s.status || 'sem execução ainda')).join('\n')
  " 2>/dev/null
else
  fail "Pipeline $PIPELINE_NAME não encontrada"
fi

section "CodeConnection"
CONNECTION_STATUS="$(aws codestar-connections get-connection --connection-arn "$CODECONNECTION_ARN" --query 'Connection.ConnectionStatus' --output text 2>/dev/null)"
if [[ "$CONNECTION_STATUS" == "AVAILABLE" ]]; then
  pass "CodeConnection: AVAILABLE"
else
  fail "CodeConnection: ${CONNECTION_STATUS:-não encontrada}"
fi

section "URL pública"
if [[ -n "${EB_URL:-}" && "$EB_URL" != "None" ]]; then
  APP_URL="http://$EB_URL"
  HTTP_CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$APP_URL/" 2>/dev/null || echo "000")"
  API_HTTP_CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$APP_URL/api/health" 2>/dev/null || echo "000")"
  [[ "$HTTP_CODE" == "200" ]] && pass "$APP_URL/ — HTTP $HTTP_CODE" || fail "$APP_URL/ — HTTP $HTTP_CODE"
  [[ "$API_HTTP_CODE" == "200" ]] && pass "$APP_URL/api/health — HTTP $API_HTTP_CODE" || fail "$APP_URL/api/health — HTTP $API_HTTP_CODE"
else
  fail "Não foi possível obter a URL do environment $EB_ENVIRONMENT_NAME"
fi

section "Resumo"
if [[ "$FAILED" == "0" ]]; then
  echo "Todos os checks passaram."
  exit 0
else
  echo "Um ou mais checks falharam — ver ✘ acima."
  exit 1
fi
