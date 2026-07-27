#!/usr/bin/env bash
# Implanta (cria ou atualiza) o RDS PostgreSQL externo do Portal Selecon (DEV) via
# CloudFormation (infrastructure/cloudformation/rds.yml). Roda no AWS CloudShell —
# nunca executado neste sandbox (sem credenciais AWS reais aqui).
#
# O que este script NUNCA faz:
#   - excluir o RDS ou qualquer recurso existente (a stack tem DeletionPolicy: Snapshot
#     no DBInstance — mesmo um `delete-stack` manual tira snapshot antes);
#   - tocar em VPC, ALB, ECS ou qualquer recurso da arquitetura antiga (ver
#     docs/ASSUMPTIONS.md — essa arquitetura foi abandonada, mas seus recursos AWS não
#     são removidos automaticamente por nada neste repositório);
#   - aplicar mudanças sem mostrar o plano (change set) e pedir confirmação explícita.
#
# Uso: aws-cli e credenciais da conta 518825425828/us-east-1 configuradas.

set -euo pipefail

EXPECTED_ACCOUNT="518825425828"
EXPECTED_REGION="us-east-1"
STACK_NAME="selecon-portal-dev-rds"
TEMPLATE_FILE="infrastructure/cloudformation/rds.yml"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
fail() { printf '\033[1;31m[erro]\033[0m %s\n' "$1"; exit 1; }

command -v aws >/dev/null 2>&1 || fail "aws-cli não encontrado no PATH."

log "1/4 — Validando conta e região"
CALLER_ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
CURRENT_REGION="${AWS_REGION:-$(aws configure get region || true)}"
[[ "$CALLER_ACCOUNT" == "$EXPECTED_ACCOUNT" ]] || fail "Conta atual ($CALLER_ACCOUNT) difere da esperada ($EXPECTED_ACCOUNT)."
[[ "$CURRENT_REGION" == "$EXPECTED_REGION" ]] || fail "Região atual ($CURRENT_REGION) difere da esperada ($EXPECTED_REGION). Exporte AWS_REGION=$EXPECTED_REGION."
echo "Conta: $CALLER_ACCOUNT | Região: $CURRENT_REGION — OK"

log "2/4 — Determinando se é criação ou atualização"
if aws cloudformation describe-stacks --stack-name "$STACK_NAME" >/dev/null 2>&1; then
  CHANGE_SET_TYPE="UPDATE"
  echo "Stack '$STACK_NAME' já existe — esta execução vai gerar um change set de ATUALIZAÇÃO."
  echo "Recursos REUTILIZADOS (não recriados): tudo que já está na stack e não mudar no diff abaixo."
else
  CHANGE_SET_TYPE="CREATE"
  echo "Stack '$STACK_NAME' não existe — esta execução vai CRIAR os recursos a seguir:"
  echo "  - AppSecurityGroup (novo security group para as instâncias EC2 do Elastic Beanstalk)"
  echo "  - DataSecurityGroup + regra de ingresso (novo security group para o RDS)"
  echo "  - DBSubnetGroup (novo)"
  echo "  - DatabaseSecret (novo segredo no Secrets Manager — senha gerada, nunca no Git)"
  echo "  - DatabaseInstance (novo RDS PostgreSQL db.t4g.micro — leva ~10-15 min para ficar disponível)"
fi
echo "Nenhum recurso é removido por este script em nenhum dos dois casos."

CHANGE_SET_NAME="rds-$(date +%Y%m%d%H%M%S)"

log "3/4 — Gerando change set (plano de mudanças) — '$CHANGE_SET_NAME'"
aws cloudformation create-change-set \
  --stack-name "$STACK_NAME" \
  --change-set-name "$CHANGE_SET_NAME" \
  --change-set-type "$CHANGE_SET_TYPE" \
  --template-body "file://$REPO_ROOT/$TEMPLATE_FILE" \
  --capabilities CAPABILITY_IAM >/dev/null

echo "Aguardando o change set ficar pronto para revisão..."
aws cloudformation wait change-set-create-complete --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME" \
  || true # pode retornar "failed" com "no changes" — tratado abaixo

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
echo "Plano de mudanças (Action=Add é criação, Modify é atualização, Remove é remoção):"
aws cloudformation describe-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME" \
  --query 'Changes[].ResourceChange.{Action:Action,Resource:LogicalResourceId,Type:ResourceType,Replacement:Replacement}' \
  --output table

if aws cloudformation describe-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME" \
  --query 'Changes[?ResourceChange.Action==`Remove`]' --output text | grep -q .; then
  echo
  echo "AVISO: o plano acima inclui REMOÇÃO de recursos. Revise com atenção antes de prosseguir."
fi

echo
echo "Rollback: em caso de falha durante a aplicação, o CloudFormation reverte"
echo "automaticamente (UPDATE_ROLLBACK_COMPLETE / ROLLBACK_COMPLETE). Para reverter"
echo "manualmente depois de aplicado: 'aws cloudformation delete-change-set' antes de"
echo "executar, ou um novo deploy com o template anterior. O RDS nunca é excluído sem"
echo "snapshot (DeletionPolicy: Snapshot)."
read -r -p "Executar este change set ('$CHANGE_SET_NAME')? (digite SIM em maiúsculas para continuar): " CONFIRM
if [[ "$CONFIRM" != "SIM" ]]; then
  echo "Cancelado pelo operador. Removendo o change set não aplicado..."
  aws cloudformation delete-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME" >/dev/null
  exit 1
fi

log "4/4 — Executando o change set"
aws cloudformation execute-change-set --stack-name "$STACK_NAME" --change-set-name "$CHANGE_SET_NAME"
aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME" 2>/dev/null \
  || aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME"

log "Concluído"
aws cloudformation describe-stacks --stack-name "$STACK_NAME" \
  --query 'Stacks[0].Outputs' --output table

echo
echo "Próximo passo: scripts/bootstrap-elasticbeanstalk-dev.sh (usa os outputs acima —"
echo "AppSecurityGroupId, DatabaseSecretArn, DatabaseEndpointAddress/Port — para"
echo "configurar o ambiente do Elastic Beanstalk)."
