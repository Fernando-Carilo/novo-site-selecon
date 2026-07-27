#!/usr/bin/env bash
# BOOTSTRAP DA PIPELINE — script único de configuração inicial do caminho de
# implantação principal (CodePipeline + CodeBuild + ECR + CDK).
#
# O que este script faz, em ordem:
#   1. Cria (ou reaproveita) a AWS CodeConnection para o GitHub.
#   2. Imprime o ARN da conexão e explica exatamente onde autorizá-la no Console AWS.
#   3. Espera (com polling) até o status da conexão virar AVAILABLE.
#   4. Instala as dependências do CDK e roda `cdk synth`/`cdk diff`/`cdk deploy`
#      SOMENTE em SeleconPortalPipelineStack (nunca em SeleconPortalDevStack —
#      essa é criada/atualizada pelo próprio pipeline, no estágio Deploy).
#
# O que este script NUNCA faz:
#   - docker build, docker push, ou qualquer manipulação de imagem de container;
#   - tocar em SeleconPortalDevStack (VPC, ALB, cluster, RDS, serviços ECS etc.);
#   - guardar um token do GitHub em variável de ambiente ou no Secrets Manager —
#     a autenticação é inteiramente resolvida pela CodeConnection;
#   - excluir ou substituir qualquer recurso existente;
#   - iniciar a pipeline manualmente (ela dispara sozinha a partir do primeiro push
#     em feat/fase-1-design-system depois que a conexão estiver AVAILABLE e a stack
#     estiver implantada — CodeStarConnectionsSourceAction já registra o webhook
#     necessário automaticamente).
#
# Depois que este script terminar com sucesso, o caminho normal de implantação passa
# a ser: `git push origin feat/fase-1-design-system` — nada mais precisa ser rodado
# manualmente. Ver docs/OPERATIONS_RUNBOOK.md.
#
# Nunca executado neste sandbox de desenvolvimento (sem credenciais AWS reais aqui).

set -euo pipefail

EXPECTED_ACCOUNT="518825425828"
EXPECTED_REGION="us-east-1"
CONNECTION_NAME="selecon-portal-github-dev"
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

log "1/6 — Validando conta e região"
CALLER_ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
CURRENT_REGION="${AWS_REGION:-$(aws configure get region || true)}"
[[ "$CALLER_ACCOUNT" == "$EXPECTED_ACCOUNT" ]] || fail "Conta atual ($CALLER_ACCOUNT) difere da esperada ($EXPECTED_ACCOUNT). Abortando por segurança."
[[ "$CURRENT_REGION" == "$EXPECTED_REGION" ]] || fail "Região atual ($CURRENT_REGION) difere da esperada ($EXPECTED_REGION). Exporte AWS_REGION=$EXPECTED_REGION."
echo "Conta: $CALLER_ACCOUNT | Região: $CURRENT_REGION — OK"

log "2/6 — Criando (ou reaproveitando) a AWS CodeConnection para o GitHub"
CONNECTION_ARN="$(aws codestar-connections list-connections \
  --provider-type GitHub \
  --query "Connections[?ConnectionName=='$CONNECTION_NAME'].ConnectionArn | [0]" \
  --output text 2>/dev/null || true)"

if [[ -z "$CONNECTION_ARN" || "$CONNECTION_ARN" == "None" ]]; then
  CONNECTION_ARN="$(aws codestar-connections create-connection \
    --provider-type GitHub \
    --connection-name "$CONNECTION_NAME" \
    --query 'ConnectionArn' --output text)"
  echo "Conexão criada: $CONNECTION_ARN"
else
  echo "Conexão existente reaproveitada: $CONNECTION_ARN"
fi

log "3/6 — Autorização manual necessária (única etapa manual real de todo o pipeline)"
CONNECTION_STATUS="$(aws codestar-connections get-connection --connection-arn "$CONNECTION_ARN" --query 'Connection.ConnectionStatus' --output text)"

if [[ "$CONNECTION_STATUS" != "AVAILABLE" ]]; then
  echo
  echo "A CodeConnection precisa ser autorizada manualmente no Console AWS antes de"
  echo "prosseguir — isto NÃO pode ser automatizado (é uma instalação de app do GitHub)."
  echo
  echo "  1. Abra: https://console.aws.amazon.com/codesuite/settings/connections?region=$EXPECTED_REGION"
  echo "  2. Encontre a conexão '$CONNECTION_NAME' (status atual: $CONNECTION_STATUS)."
  echo "  3. Clique em 'Update pending connection'."
  echo "  4. Escolha (ou instale) o GitHub App autorizando o repositório"
  echo "     Fernando-Carilo/novo-site-selecon."
  echo "  5. Confirme — o status deve virar 'Available'."
  echo
  echo "Aguardando o status virar AVAILABLE (Ctrl+C para interromper e rodar de novo depois)..."
  until [[ "$CONNECTION_STATUS" == "AVAILABLE" ]]; do
    sleep 10
    CONNECTION_STATUS="$(aws codestar-connections get-connection --connection-arn "$CONNECTION_ARN" --query 'Connection.ConnectionStatus' --output text)"
    echo "  status atual: $CONNECTION_STATUS"
  done
fi
echo "CodeConnection AVAILABLE: $CONNECTION_ARN"

log "4/6 — Instalando dependências do CDK"
(cd "$CDK_DIR" && pnpm install --ignore-workspace --frozen-lockfile)

log "5/6 — cdk synth / cdk diff — SOMENTE $PIPELINE_STACK_NAME"
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

log "6/6 — cdk deploy $PIPELINE_STACK_NAME"
(cd "$CDK_DIR" && npx cdk deploy "$PIPELINE_STACK_NAME" "${CDK_CONTEXT_ARGS[@]}" --require-approval never)

PIPELINE_NAME="$(aws cloudformation describe-stacks --stack-name "$PIPELINE_STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='PipelineName'].OutputValue | [0]" --output text 2>/dev/null || echo "selecon-portal-dev")"

log "Concluído"
echo "Pipeline implantada: $PIPELINE_NAME"
echo "Console: https://$EXPECTED_REGION.console.aws.amazon.com/codesuite/codepipeline/pipelines/$PIPELINE_NAME/view?region=$EXPECTED_REGION"
echo
echo "A partir de agora, todo 'git push origin feat/fase-1-design-system' dispara a"
echo "pipeline automaticamente: Source -> Validate -> BuildImages -> Migrations -> Deploy"
echo "-> SmokeTest. Nenhum passo manual adicional é necessário."
echo
echo "Nota sobre o primeiro run: $DEV_STACK_NAME ainda não existe até a pipeline rodar"
echo "'cdk deploy' pela primeira vez (estágio Deploy). O estágio Migrations detecta essa"
echo "ausência automaticamente e passa adiante sem erro nesse primeiro run — migrações"
echo "reais começam a rodar a partir do segundo run em diante. Ver buildspec-migrations.yml"
echo "e docs/ASSUMPTIONS.md."
echo
echo "Para acompanhar o primeiro run:"
echo "  aws codepipeline get-pipeline-state --name $PIPELINE_NAME"
echo
echo "Para validação somente-leitura do ambiente a qualquer momento: scripts/check-aws-dev.sh"
echo "Para rollback manual de ECS (não desfaz migrações de banco): scripts/rollback-ecs-dev.sh"
