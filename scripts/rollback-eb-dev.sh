#!/usr/bin/env bash
# Rollback operacional do Elastic Beanstalk — volta o environment DEV do Portal
# Selecon para a versão da aplicação implantada anteriormente. Não é acionado
# automaticamente pela pipeline; ferramenta manual para o operador usar quando uma
# implantação recente se mostrar problemática.
#
# O que este script faz:
#   1. Lista as versões da aplicação (mais recentes primeiro), identificando a versão
#      ATUALMENTE em execução no environment e a ANTERIOR a ela (a mesma ordem em que
#      o CodePipeline as criou — nunca presumida por nome, sempre por
#      describe-environments + describe-application-versions).
#   2. Mostra as duas versões (label, data de criação, descrição) para conferência.
#   3. Com confirmação explícita, executa `update-environment` apontando para a
#      versão anterior.
#
# O que este script NUNCA faz:
#   - reverter migrações de banco (schema) automaticamente — se a versão anterior
#     depende de um schema anterior, avalie manualmente antes de prosseguir (ver
#     docs/OPERATIONS_RUNBOOK.md);
#   - excluir qualquer versão de aplicação;
#   - tocar no RDS, na pipeline ou em qualquer outro recurso.
#
# Nunca executado neste sandbox (sem credenciais AWS reais aqui).

set -euo pipefail

EXPECTED_ACCOUNT="518825425828"
EXPECTED_REGION="us-east-1"
EB_APPLICATION_NAME="selecon-portal"
EB_ENVIRONMENT_NAME="selecon-portal-dev"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
fail() { printf '\033[1;31m[erro]\033[0m %s\n' "$1"; exit 1; }

command -v aws >/dev/null 2>&1 || fail "aws-cli não encontrado no PATH."
command -v jq >/dev/null 2>&1 || fail "jq não encontrado no PATH."

log "1/4 — Validando conta e região"
CALLER_ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
CURRENT_REGION="${AWS_REGION:-$(aws configure get region || true)}"
[[ "$CALLER_ACCOUNT" == "$EXPECTED_ACCOUNT" ]] || fail "Conta atual ($CALLER_ACCOUNT) difere da esperada ($EXPECTED_ACCOUNT)."
[[ "$CURRENT_REGION" == "$EXPECTED_REGION" ]] || fail "Região atual ($CURRENT_REGION) difere da esperada ($EXPECTED_REGION). Exporte AWS_REGION=$EXPECTED_REGION."
echo "Conta: $CALLER_ACCOUNT | Região: $CURRENT_REGION — OK"

log "2/4 — Descobrindo a versão atual do environment '$EB_ENVIRONMENT_NAME'"
CURRENT_VERSION_LABEL="$(aws elasticbeanstalk describe-environments \
  --application-name "$EB_APPLICATION_NAME" --environment-names "$EB_ENVIRONMENT_NAME" \
  --query 'Environments[0].VersionLabel' --output text)"
[[ -n "$CURRENT_VERSION_LABEL" && "$CURRENT_VERSION_LABEL" != "None" ]] \
  || fail "Não foi possível descobrir a versão atual do environment '$EB_ENVIRONMENT_NAME'."
echo "Versão atual: $CURRENT_VERSION_LABEL"

log "3/4 — Listando versões da aplicação (mais recentes primeiro)"
VERSIONS_JSON="$(aws elasticbeanstalk describe-application-versions \
  --application-name "$EB_APPLICATION_NAME" \
  --query 'sort_by(ApplicationVersions, &DateCreated)[::-1]')"

echo "$VERSIONS_JSON" | jq -r '.[] | "\(.VersionLabel)\t\(.DateCreated)\t\(.Description // "")"' | head -10 \
  | awk -F'\t' 'BEGIN{print "VERSAO\tCRIADA_EM\tDESCRICAO"} {print}'

PREVIOUS_VERSION_LABEL="$(echo "$VERSIONS_JSON" | jq -r --arg current "$CURRENT_VERSION_LABEL" '
  [.[] | .VersionLabel] as $labels
  | ($labels | index($current)) as $idx
  | if $idx == null then empty else $labels[$idx + 1] end
')"
[[ -n "$PREVIOUS_VERSION_LABEL" && "$PREVIOUS_VERSION_LABEL" != "null" ]] \
  || fail "Não há versão anterior a '$CURRENT_VERSION_LABEL' na lista de versões da aplicação."

echo
echo "Versão atual:    $CURRENT_VERSION_LABEL"
echo "Versão anterior: $PREVIOUS_VERSION_LABEL (candidata a rollback)"
echo
echo "AVISO: este rollback NÃO reverte migrações de banco. Se a versão anterior espera"
echo "um schema mais antigo (ex.: uma migração desta implantação removeu uma coluna que"
echo "o código anterior ainda lê), avalie manualmente antes de prosseguir — ver"
echo "docs/OPERATIONS_RUNBOOK.md."
read -r -p "Reverter '$EB_ENVIRONMENT_NAME' para a versão '$PREVIOUS_VERSION_LABEL'? (digite SIM em maiúsculas para continuar): " CONFIRM
[[ "$CONFIRM" == "SIM" ]] || { echo "Cancelado pelo operador."; exit 1; }

log "4/4 — Aplicando rollback e aguardando estabilização"
aws elasticbeanstalk update-environment \
  --application-name "$EB_APPLICATION_NAME" \
  --environment-name "$EB_ENVIRONMENT_NAME" \
  --version-label "$PREVIOUS_VERSION_LABEL" >/dev/null

echo "Rollback enviado. Acompanhe com:"
echo "  aws elasticbeanstalk describe-environments --application-name $EB_APPLICATION_NAME --environment-names $EB_ENVIRONMENT_NAME --query 'Environments[0].{status:Status,health:Health,version:VersionLabel}'"
echo
echo "Confirme a saúde do ambiente com: scripts/check-aws-dev.sh"
