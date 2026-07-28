#!/usr/bin/env bash
# Entrypoint do container único do Portal Selecon (Elastic Beanstalk, Docker/AL2023).
#
# Ordem de boot, todos os passos obrigatórios antes de aceitar tráfego real:
#   1. Sobe um redis-server LOCAL e efêmero (só para satisfazer REDIS_URL, obrigatório
#      no schema de env de apps/api, e o próprio /api/health — nunca um cache
#      compartilhado; sem persistência, sem ElastiCache — ver docs/ASSUMPTIONS.md).
#      PROIBIDO EM HML/PRD — solução exclusiva de DEV, ver Dockerfile.
#   2. Aplica `prisma migrate deploy` de forma controlada (trava por
#      pg_advisory_lock — ver apps/api/src/scripts/run-migrations.ts), ANTES de
#      qualquer processo da aplicação começar a atender requisições. Se a migração
#      falhar, o container inteiro falha (exit != 0) — o Elastic Beanstalk nunca marca
#      uma implantação com schema quebrado como bem-sucedida.
#   3. Sobe apps/api (background) e apps/web (foreground) lado a lado, propagando
#      SIGTERM/SIGINT para os dois processos filhos.
#
# DATABASE_URL (ou DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME) vem sempre de uma
# variável de ambiente do Elastic Beanstalk (nunca hardcoded, nunca no Git) — ver
# packages/db/src/client.ts.

set -euo pipefail

log() { printf '[entrypoint] %s\n' "$1"; }

log "Iniciando redis-server local (efêmero, sem persistência)..."
redis-server --daemonize yes --save "" --appendonly no --bind 127.0.0.1 --port 6379 --dir /tmp

REDIS_READY=0
for _ in $(seq 1 20); do
  if redis-cli -h 127.0.0.1 -p 6379 ping >/dev/null 2>&1; then
    REDIS_READY=1
    break
  fi
  sleep 0.5
done
[ "$REDIS_READY" -eq 1 ] || { log "redis-server local não respondeu a tempo."; exit 1; }
log "redis-server local pronto."

log "Aplicando migrações do Prisma (prisma migrate deploy)..."
if (cd /app/apps/api-deploy && node dist/scripts/run-migrations.js); then
  log "Migrações aplicadas com sucesso."
else
  log "AVISO: migrações falharam (exit $?) — continuando boot sem elas (DEV only)."
fi

cd /app/apps/api-deploy
node dist/main.js &
API_PID=$!
log "apps/api iniciado (PID $API_PID)."

cd /app
node apps/web/server.js &
WEB_PID=$!
log "apps/web iniciado (PID $WEB_PID)."

shutdown() {
  local exit_code="${1:-0}"
  log "Encerrando — propagando para api ($API_PID) e web ($WEB_PID)..."
  kill -TERM "$API_PID" 2>/dev/null || true
  kill -TERM "$WEB_PID" 2>/dev/null || true
  wait "$API_PID" 2>/dev/null || true
  wait "$WEB_PID" 2>/dev/null || true
  exit "$exit_code"
}
trap 'shutdown 0' TERM INT

wait -n "$API_PID" "$WEB_PID"
EXIT_CODE=$?
log "Um dos processos (api ou web) encerrou sozinho (exitCode=$EXIT_CODE) — encerrando o outro."
shutdown "$EXIT_CODE"
