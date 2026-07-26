# ADR-0003 — Isolamento de dados do canal de denúncias

- **Status:** Aceito
- **Data:** 2026-07-26

## Contexto

A seção 6.2 e 12.3 do prompt mestre exigem que o domínio de denúncias (Integrity/
Whistleblowing) tenha schema, storage, chaves e trilha de acesso segregados dos demais
módulos, sem exposição em buscas, logs ou dashboards agregados gerais.

## Decisão

- No Prisma schema (`packages/db`), todas as entidades `Whistleblowing*` usam o atributo
  `@@schema("whistleblowing")` (Prisma `multiSchema` preview feature com PostgreSQL), enquanto
  as demais entidades usam `@@schema("public")` (ou schemas dedicados por domínio quando
  fizer sentido, ex.: `content`, `contests`, `service`).
- Nenhum repository ou service de outros módulos pode importar diretamente os tipos/queries
  do módulo de denúncias; a comunicação, quando estritamente necessária (ex.: um caso de
  denúncia vira um chamado de atendimento por decisão humana), deve ocorrer por evento de
  domínio explícito e auditado, nunca por leitura direta de tabela.
- Logs de aplicação (`packages/observability`) devem mascarar/omitir qualquer campo vindo do
  domínio de denúncias por padrão; um logger dedicado (`whistleblowingLogger`) com política
  de retenção curta e destino de armazenamento restrito será usado no módulo.
- Índices de busca full-text/global (ex.: busca do portal, busca administrativa geral) nunca
  indexam entidades do domínio de denúncias.

## Consequências

- Migrations do schema `whistleblowing` são geridas separadamente e podem ter política de
  backup/retenção diferente das demais (ver `docs/SECURITY_AND_PRIVACY.md`).
- Código de acesso (`WhistleblowingCredential`) nunca é armazenado em texto puro — apenas hash
  forte (Argon2id) com comparação em tempo constante, entropia adequada e limitação de
  tentativas (detalhado em `docs/SECURITY_AND_PRIVACY.md`).
- Esta decisão será revisitada e reforçada na Fase 6 (Canal de denúncias), quando threat model
  específico e testes de abuso forem executados.
