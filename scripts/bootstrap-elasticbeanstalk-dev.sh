#!/usr/bin/env bash
# Cria (ou reutiliza/atualiza) a Application e o Environment DEV do Elastic Beanstalk
# do Portal Selecon — plataforma "Docker running on 64bit Amazon Linux 2023",
# instância única (sem load balancer, para simplicidade e custo mínimo em DEV). Roda
# no AWS CloudShell — nunca executado neste sandbox (sem credenciais AWS reais aqui).
#
# Pré-requisito: scripts/bootstrap-rds-dev.sh já executado com sucesso (este script lê
# os outputs da stack "selecon-portal-dev-rds" — AppSecurityGroupId, DatabaseSecretArn,
# DatabaseEndpointAddress/Port, DatabaseName).
#
# O que este script NUNCA faz:
#   - excluir a Application/Environment existentes;
#   - alterar um Environment existente sem mostrar antes as variáveis que serão
#     definidas/alteradas e pedir confirmação explícita;
#   - colocar a senha do banco em texto plano no Git ou em log persistente do
#     CloudShell além da tela do operador (a senha é lida do Secrets Manager e
#     definida diretamente como propriedade de ambiente do Elastic Beanstalk — uma das
#     opções explicitamente aceitas para segredos nesta arquitetura, já que o EB não
#     expõe essa configuração publicamente, só a quem tiver permissão IAM de leitura).

set -euo pipefail

EXPECTED_ACCOUNT="518825425828"
EXPECTED_REGION="us-east-1"
RDS_STACK_NAME="selecon-portal-dev-rds"
EB_APPLICATION_NAME="selecon-portal"
EB_ENVIRONMENT_NAME="selecon-portal-dev"
EB_INSTANCE_PROFILE="aws-elasticbeanstalk-ec2-role"
EB_SERVICE_ROLE="aws-elasticbeanstalk-service-role"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
fail() { printf '\033[1;31m[erro]\033[0m %s\n' "$1"; exit 1; }

command -v aws >/dev/null 2>&1 || fail "aws-cli não encontrado no PATH."
command -v jq >/dev/null 2>&1 || fail "jq não encontrado no PATH."

log "1/7 — Validando conta e região"
CALLER_ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
CURRENT_REGION="${AWS_REGION:-$(aws configure get region || true)}"
[[ "$CALLER_ACCOUNT" == "$EXPECTED_ACCOUNT" ]] || fail "Conta atual ($CALLER_ACCOUNT) difere da esperada ($EXPECTED_ACCOUNT)."
[[ "$CURRENT_REGION" == "$EXPECTED_REGION" ]] || fail "Região atual ($CURRENT_REGION) difere da esperada ($EXPECTED_REGION). Exporte AWS_REGION=$EXPECTED_REGION."
echo "Conta: $CALLER_ACCOUNT | Região: $CURRENT_REGION — OK"

log "2/7 — Lendo outputs de $RDS_STACK_NAME"
RDS_OUTPUTS="$(aws cloudformation describe-stacks --stack-name "$RDS_STACK_NAME" --query 'Stacks[0].Outputs' 2>/dev/null)" \
  || fail "Stack '$RDS_STACK_NAME' não encontrada. Rode scripts/bootstrap-rds-dev.sh primeiro."
get_output() { echo "$RDS_OUTPUTS" | jq -r --arg k "$1" '.[] | select(.OutputKey==$k) | .OutputValue'; }
APP_SG_ID="$(get_output AppSecurityGroupId)"
DB_SECRET_ARN="$(get_output DatabaseSecretArn)"
DB_HOST="$(get_output DatabaseEndpointAddress)"
DB_PORT="$(get_output DatabaseEndpointPort)"
DB_NAME="$(get_output DatabaseName)"
[[ -n "$APP_SG_ID" && -n "$DB_SECRET_ARN" && -n "$DB_HOST" ]] || fail "Outputs incompletos em $RDS_STACK_NAME."
echo "AppSecurityGroupId: $APP_SG_ID | Endpoint: $DB_HOST:$DB_PORT/$DB_NAME"

log "3/7 — Compondo DATABASE_URL a partir do Secrets Manager (nunca exibida por completo abaixo)"
SECRET_JSON="$(aws secretsmanager get-secret-value --secret-id "$DB_SECRET_ARN" --query 'SecretString' --output text)"
DB_USER="$(echo "$SECRET_JSON" | jq -r '.username')"
DB_PASSWORD="$(echo "$SECRET_JSON" | jq -r '.password')"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"
echo "DATABASE_URL composta (usuário: $DB_USER, host: $DB_HOST) — senha omitida deste log."

log "4/7 — Confirmando/criando as roles IAM padrão do Elastic Beanstalk (se ainda não existirem)"
if ! aws iam get-role --role-name "$EB_SERVICE_ROLE" >/dev/null 2>&1; then
  echo "Role de serviço '$EB_SERVICE_ROLE' não existe — será criada pelo próprio comando"
  echo "'aws elasticbeanstalk create-environment' abaixo, se você confirmar (o EB cria as"
  echo "roles padrão automaticamente quando ausentes, com as policies gerenciadas"
  echo "AWSElasticBeanstalkService e AWSElasticBeanstalkEnhancedHealth)."
else
  echo "Role de serviço '$EB_SERVICE_ROLE' já existe — reutilizada."
fi
if ! aws iam get-instance-profile --instance-profile-name "$EB_INSTANCE_PROFILE" >/dev/null 2>&1; then
  echo "Instance profile '$EB_INSTANCE_PROFILE' não existe — será criado pelo EB"
  echo "automaticamente (policy gerenciada AWSElasticBeanstalkWebTier), se você confirmar."
else
  echo "Instance profile '$EB_INSTANCE_PROFILE' já existe — reutilizado."
fi

log "5/7 — Resolvendo a versão mais recente da plataforma Docker/AL2023"
PLATFORM_ARN="$(aws elasticbeanstalk list-platform-versions \
  --filters "Type=PlatformName,Operator=contains,Values=Docker running on 64bit Amazon Linux 2023" \
  --query 'sort_by(PlatformSummaryList, &to_string(PlatformVersion))[-1].PlatformArn' --output text)"
[[ -n "$PLATFORM_ARN" && "$PLATFORM_ARN" != "None" ]] || fail "Nenhuma plataforma 'Docker running on 64bit Amazon Linux 2023' encontrada."
echo "Plataforma: $PLATFORM_ARN"

log "6/7 — Plano (Application + Environment)"
if aws elasticbeanstalk describe-applications --application-names "$EB_APPLICATION_NAME" \
    --query 'Applications[0]' --output text 2>/dev/null | grep -qv '^None$'; then
  echo "Application '$EB_APPLICATION_NAME' já existe — REUTILIZADA."
  APP_EXISTS=1
else
  echo "Application '$EB_APPLICATION_NAME' NÃO existe — será CRIADA."
  APP_EXISTS=0
fi

ENV_STATUS="$(aws elasticbeanstalk describe-environments --application-name "$EB_APPLICATION_NAME" \
  --environment-names "$EB_ENVIRONMENT_NAME" --query 'Environments[0].Status' --output text 2>/dev/null || echo "None")"

cat > /tmp/eb-option-settings.json <<EOF
[
  { "Namespace": "aws:autoscaling:launchconfiguration", "OptionName": "IamInstanceProfile", "Value": "$EB_INSTANCE_PROFILE" },
  { "Namespace": "aws:autoscaling:launchconfiguration", "OptionName": "SecurityGroups", "Value": "$APP_SG_ID" },
  { "Namespace": "aws:autoscaling:launchconfiguration", "OptionName": "InstanceType", "Value": "t3.micro" },
  { "Namespace": "aws:elasticbeanstalk:environment", "OptionName": "EnvironmentType", "Value": "SingleInstance" },
  { "Namespace": "aws:elasticbeanstalk:environment", "OptionName": "ServiceRole", "Value": "$EB_SERVICE_ROLE" },
  { "Namespace": "aws:elasticbeanstalk:application", "OptionName": "Application Healthcheck URL", "Value": "/api/health" },
  { "Namespace": "aws:elasticbeanstalk:application:environment", "OptionName": "NODE_ENV", "Value": "production" },
  { "Namespace": "aws:elasticbeanstalk:application:environment", "OptionName": "DATABASE_URL", "Value": "$DATABASE_URL" }
]
EOF

if [[ "$ENV_STATUS" == "None" || -z "$ENV_STATUS" ]]; then
  echo "Environment '$EB_ENVIRONMENT_NAME' NÃO existe — será CRIADO (instância única,"
  echo "t3.micro, plataforma Docker/AL2023, sem load balancer)."
  ENV_EXISTS=0
else
  echo "Environment '$EB_ENVIRONMENT_NAME' já existe (status: $ENV_STATUS) — as variáveis"
  echo "de ambiente abaixo serão ATUALIZADAS via 'update-environment' (sem recriar a"
  echo "instância nem perder o histórico de versões implantadas)."
  ENV_EXISTS=1
fi

echo
echo "Variáveis de ambiente que serão definidas (senha/segredos omitidos deste log):"
jq 'map(if .OptionName == "DATABASE_URL" then .Value = "***omitido***" else . end)' /tmp/eb-option-settings.json

echo
echo "Nenhum recurso é removido por este script. Rollback: para reverter variáveis de"
echo "ambiente, rode este script novamente após corrigir a origem (ex.: girar a senha"
echo "no Secrets Manager); para reverter a APLICAÇÃO implantada, use"
echo "scripts/rollback-eb-dev.sh (volta para a versão anterior do Elastic Beanstalk)."
read -r -p "Prosseguir? (digite SIM em maiúsculas para continuar): " CONFIRM
[[ "$CONFIRM" == "SIM" ]] || { echo "Cancelado pelo operador."; exit 1; }

log "7/7 — Aplicando"
if [[ "$APP_EXISTS" -eq 0 ]]; then
  aws elasticbeanstalk create-application --application-name "$EB_APPLICATION_NAME" \
    --description "Portal Selecon (container único web+api, Docker)"
fi

if [[ "$ENV_EXISTS" -eq 0 ]]; then
  aws elasticbeanstalk create-environment \
    --application-name "$EB_APPLICATION_NAME" \
    --environment-name "$EB_ENVIRONMENT_NAME" \
    --platform-arn "$PLATFORM_ARN" \
    --option-settings "file:///tmp/eb-option-settings.json"
  echo "Criação iniciada — pode levar alguns minutos. Acompanhe com:"
  echo "  aws elasticbeanstalk describe-environments --environment-names $EB_ENVIRONMENT_NAME --query 'Environments[0].{status:Status,health:Health,url:CNAME}'"
else
  aws elasticbeanstalk update-environment \
    --application-name "$EB_APPLICATION_NAME" \
    --environment-name "$EB_ENVIRONMENT_NAME" \
    --option-settings "file:///tmp/eb-option-settings.json"
  echo "Atualização iniciada. Acompanhe com scripts/check-aws-dev.sh."
fi

rm -f /tmp/eb-option-settings.json

log "Concluído"
echo "Próximo passo: scripts/bootstrap-codepipeline-eb-dev.sh (cria a pipeline que builda"
echo "a imagem e implanta neste environment a cada push)."
