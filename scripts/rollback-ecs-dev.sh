#!/usr/bin/env bash
# ROLLBACK OPERACIONAL DE ECS (DEV) — volta um ou mais serviços para a revisão anterior
# da respectiva task definition. Não é acionado automaticamente pela pipeline; é uma
# ferramenta manual para o operador usar quando uma implantação recente se mostrar
# problemática mas não tiver disparado o deployment circuit breaker do próprio ECS
# (que já reverte automaticamente falhas de estabilização — ver deploymentCircuitBreaker
# em infrastructure/cdk/lib/selecon-portal-stack.ts).
#
# O que este script faz, por serviço escolhido:
#   1. Descobre a FAMÍLIA da task definition em uso via describe-services — nunca
#      presume que a família tem o mesmo nome do serviço.
#   2. Lista as últimas revisões dessa família e identifica a revisão atual e a anterior.
#   3. Mostra as duas (imagem, revisão, data de registro) para conferência.
#   4. Com confirmação explícita, faz update-service apontando para a revisão anterior
#      + --force-new-deployment, e espera o serviço estabilizar.
#
# O que este script NUNCA faz:
#   - reverter migrações de banco (schema) automaticamente — se a revisão anterior
#     depende de um schema anterior, avalie manualmente antes de prosseguir (ver
#     docs/OPERATIONS_RUNBOOK.md, seção de rollback);
#   - excluir qualquer revisão de task definition (register-task-definition sempre
#     acumula; revisões antigas continuam disponíveis para rollback futuro);
#   - tocar em VPC, ALB ou cluster.
#
# Nunca executado neste sandbox (sem credenciais AWS reais aqui).

set -euo pipefail

EXPECTED_ACCOUNT="518825425828"
EXPECTED_REGION="us-east-1"
CLUSTER_NAME="selecon-portal-dev"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
fail() { printf '\033[1;31m[erro]\033[0m %s\n' "$1"; exit 1; }

command -v aws >/dev/null 2>&1 || fail "aws-cli não encontrado no PATH. Rode este script no AWS CloudShell."
command -v jq >/dev/null 2>&1 || fail "jq não encontrado no PATH."

log "1/5 — Validando conta e região"
CALLER_ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
CURRENT_REGION="${AWS_REGION:-$(aws configure get region || true)}"
[[ "$CALLER_ACCOUNT" == "$EXPECTED_ACCOUNT" ]] || fail "Conta atual ($CALLER_ACCOUNT) difere da esperada ($EXPECTED_ACCOUNT). Abortando por segurança."
[[ "$CURRENT_REGION" == "$EXPECTED_REGION" ]] || fail "Região atual ($CURRENT_REGION) difere da esperada ($EXPECTED_REGION). Exporte AWS_REGION=$EXPECTED_REGION."
echo "Conta: $CALLER_ACCOUNT | Região: $CURRENT_REGION — OK"

log "2/5 — Escolha o serviço para rollback"
SERVICES=(selecon-portal-dev-web selecon-portal-dev-api selecon-portal-dev-worker)
echo "Serviços disponíveis:"
for i in "${!SERVICES[@]}"; do
  echo "  $((i + 1))) ${SERVICES[$i]}"
done
read -r -p "Número do serviço a reverter: " CHOICE
[[ "$CHOICE" =~ ^[1-3]$ ]] || fail "Escolha inválida."
SERVICE_NAME="${SERVICES[$((CHOICE - 1))]}"

log "3/5 — Descobrindo a família e a revisão atual de $SERVICE_NAME"
CURRENT_TASK_DEF_ARN="$(aws ecs describe-services --cluster "$CLUSTER_NAME" --services "$SERVICE_NAME" \
  --query 'services[0].taskDefinition' --output text)"
[[ -n "$CURRENT_TASK_DEF_ARN" && "$CURRENT_TASK_DEF_ARN" != "None" ]] \
  || fail "Não foi possível descobrir a task definition atual do serviço $SERVICE_NAME."

# A família nunca é presumida a partir do nome do serviço — vem do ARN da task
# definition realmente em uso, ex.: arn:...:task-definition/<familia>:<revisao>.
FAMILY="$(echo "$CURRENT_TASK_DEF_ARN" | sed -E 's#.*task-definition/([^:]+):[0-9]+$#\1#')"
CURRENT_REVISION="$(echo "$CURRENT_TASK_DEF_ARN" | sed -E 's#.*:([0-9]+)$#\1#')"
echo "Família: $FAMILY | Revisão atual em produção (DEV): $CURRENT_REVISION"

log "4/5 — Listando revisões disponíveis"
ALL_REVISIONS_JSON="$(aws ecs list-task-definitions --family-prefix "$FAMILY" --sort DESC \
  --query 'taskDefinitionArns' --output json)"
echo "$ALL_REVISIONS_JSON" | jq -r '.[]' | head -10

PREVIOUS_REVISION=$((CURRENT_REVISION - 1))
[[ "$PREVIOUS_REVISION" -ge 1 ]] || fail "Não há revisão anterior a $CURRENT_REVISION para $FAMILY."
PREVIOUS_TASK_DEF_ARN="$(echo "$ALL_REVISIONS_JSON" | jq -r --arg rev ":$PREVIOUS_REVISION" '.[] | select(endswith($rev))')"
[[ -n "$PREVIOUS_TASK_DEF_ARN" ]] || fail "Revisão $PREVIOUS_REVISION de $FAMILY não encontrada (pode ter sido desregistrada)."

echo
echo "Revisão atual:   $CURRENT_TASK_DEF_ARN"
aws ecs describe-task-definition --task-definition "$CURRENT_TASK_DEF_ARN" \
  --query 'taskDefinition.containerDefinitions[].image' --output text
echo
echo "Revisão anterior: $PREVIOUS_TASK_DEF_ARN"
aws ecs describe-task-definition --task-definition "$PREVIOUS_TASK_DEF_ARN" \
  --query 'taskDefinition.containerDefinitions[].image' --output text

echo
echo "AVISO: este rollback NÃO reverte migrações de banco. Se a revisão anterior espera"
echo "um schema mais antigo (ex.: uma migração desta implantação removeu uma coluna que o"
echo "código anterior ainda lê), avalie manualmente antes de prosseguir — ver"
echo "docs/OPERATIONS_RUNBOOK.md."
read -r -p "Reverter $SERVICE_NAME para a revisão $PREVIOUS_REVISION? (digite SIM em maiúsculas para continuar): " CONFIRM
[[ "$CONFIRM" == "SIM" ]] || { echo "Cancelado pelo operador."; exit 1; }

log "5/5 — Aplicando rollback e aguardando estabilização"
aws ecs update-service --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" \
  --task-definition "$PREVIOUS_TASK_DEF_ARN" --force-new-deployment >/dev/null
echo "update-service enviado. Aguardando o serviço estabilizar (pode levar alguns minutos)..."
aws ecs wait services-stable --cluster "$CLUSTER_NAME" --services "$SERVICE_NAME" \
  || echo "AVISO: 'wait services-stable' expirou — confira manualmente com scripts/check-aws-dev.sh."

echo
echo "Rollback concluído: $SERVICE_NAME agora usa $PREVIOUS_TASK_DEF_ARN."
echo "Confirme a saúde do serviço com: scripts/check-aws-dev.sh"
