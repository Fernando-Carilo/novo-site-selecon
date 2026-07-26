# ADR-0004 — Integrações externas via interfaces/adapters com mock local

- **Status:** Aceito
- **Data:** 2026-07-26

## Contexto

O prompt mestre (regra 3.10 e seção 11) exige que toda integração dependente de credenciais
externas (Microsoft Graph, WhatsApp Cloud API, sistema do candidato, antivírus/storage) seja
implementada por interface com mock local, health check e documentação — nunca declarada como
operacional sem teste real. Nenhuma credencial foi fornecida nesta sessão.

## Decisão

Cada integração externa é modelada como uma interface em `packages/integrations`:

- `EmailProvider` (Microsoft Graph);
- `MessagingProvider` (WhatsApp Cloud API);
- `CandidateProvider` (sistema do candidato existente, conforme contrato da seção 11.4);
- `StorageProvider` (upload assinado + antivírus, seção 11.5).

Cada interface tem:

1. um contrato TypeScript documentado com JSDoc mínimo (comportamento esperado, exceções);
2. uma implementação `*MockProvider` usada em desenvolvimento/testes/demo, com dados fictícios
   e comportamento determinístico;
3. um método `healthCheck()` que retorna status estruturado (`ok | degraded | down` + detalhe);
4. um ponto de injeção único (factory/config) que seleciona a implementação real vs. mock por
   variável de ambiente, validada via `packages/config` (Zod).

Nenhuma implementação real (Graph, WhatsApp, candidato) é escrita nesta fase, pois não há
credenciais para testar — apenas a interface e o mock. Uma implementação real só é declarada
"operacional" em documentação após teste de ponta a ponta com credenciais do Instituto.

## Consequências

- `docs/INTEGRATIONS.md` lista, para cada integração, o que está implementado (mock),
  o que falta (credenciais, consentimento administrativo, endpoints) e como habilitar a
  implementação real quando as credenciais existirem.
- Nenhuma variável de ambiente de produção/credencial é commitada; `.env.example` documenta
  apenas nomes de variáveis, nunca valores reais.
