#!/usr/bin/env bash
# Smoke test dos três containers de produção (web, api, worker).
#
# Requer Docker daemon disponível e docker-compose up -d db redis (ou
# equivalente) já rodando, com um .env válido na raiz do repositório.
#
# Uso: pnpm docker:test
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env ]; then
  echo "Arquivo .env não encontrado. Copie .env.example para .env antes de continuar." >&2
  exit 1
fi

cleanup() {
  echo "Limpando containers de teste..."
  docker rm -f selecon-smoke-web selecon-smoke-api selecon-smoke-worker >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "==> Buildando imagens..."
docker build -f apps/web/Dockerfile -t selecon-portal-web:smoke .
docker build -f apps/api/Dockerfile -t selecon-portal-api:smoke .
docker build -f apps/worker/Dockerfile -t selecon-portal-worker:smoke .

echo "==> Subindo apps/api (rede host, usa Postgres/Redis locais do .env)..."
docker run -d --rm --network host --env-file .env --name selecon-smoke-api selecon-portal-api:smoke
sleep 6
API_HEALTH=$(curl -sS -o /dev/null -w "%{http_code}" http://localhost:"${API_PORT:-3001}"/health/ready || echo "000")
echo "apps/api /health/ready => $API_HEALTH"
if [ "$API_HEALTH" != "200" ]; then
  echo "FALHA: apps/api não respondeu 200 em /health/ready" >&2
  docker logs selecon-smoke-api || true
  exit 1
fi

echo "==> Subindo apps/web..."
docker run -d --rm -p "${WEB_PORT:-3000}:3000" --name selecon-smoke-web selecon-portal-web:smoke
sleep 4
WEB_HEALTH=$(curl -sS -o /dev/null -w "%{http_code}" http://localhost:"${WEB_PORT:-3000}"/ || echo "000")
echo "apps/web / => $WEB_HEALTH"
if [ "$WEB_HEALTH" != "200" ]; then
  echo "FALHA: apps/web não respondeu 200 em /" >&2
  docker logs selecon-smoke-web || true
  exit 1
fi

echo "==> Subindo apps/worker (verifica boot + conexão Redis, sem porta HTTP)..."
docker run -d --rm --network host --env-file .env --name selecon-smoke-worker selecon-portal-worker:smoke
sleep 4
if ! docker ps --filter "name=selecon-smoke-worker" --filter "status=running" | grep -q selecon-smoke-worker; then
  echo "FALHA: apps/worker não permaneceu em execução" >&2
  docker logs selecon-smoke-worker || true
  exit 1
fi
docker logs selecon-smoke-worker 2>&1 | grep -q "pronto e conectado ao Redis" || {
  echo "FALHA: apps/worker não confirmou conexão com Redis nos logs" >&2
  docker logs selecon-smoke-worker || true
  exit 1
}

echo "==> Todos os smoke tests de container passaram."
