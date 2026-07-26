# ADR-0002 — Seleção de stack técnica

- **Status:** Aceito
- **Data:** 2026-07-26

## Contexto

A seção 6.1 do prompt mestre sugere uma stack TypeScript completa. Nenhuma restrição de
ambiente, preferência de time ou stack legada foi informada (o repositório estava vazio),
portanto a stack sugerida foi adotada integralmente, com pequenos ajustes de versão para o
que está disponível/suportado no momento da implementação.

## Decisão

| Camada                      | Escolha                                      | Observação                                                                  |
| --------------------------- | -------------------------------------------- | --------------------------------------------------------------------------- |
| Linguagem                   | TypeScript `strict: true`                    | Em todos os pacotes/apps                                                    |
| Runtime                     | Node.js LTS (22.x)                           | Versão disponível no ambiente de build                                      |
| Package manager             | pnpm 10.x                                    | Lockfile imutável em CI (`--frozen-lockfile`)                               |
| Orquestração                | Turborepo                                    | Ver ADR-0001                                                                |
| Frontend                    | Next.js (App Router)                         | `apps/web`                                                                  |
| Estilo                      | Tailwind CSS                                 | Tokens centralizados, ver seção 5.2 do prompt mestre                        |
| Backend                     | NestJS + adapter Fastify                     | `apps/api`, módulos por domínio                                             |
| Contrato de API             | OpenAPI gerado a partir de decorators NestJS | Publicado em `/docs`                                                        |
| Banco de dados              | PostgreSQL                                   | Local via Docker Compose; RDS Multi-AZ sugerido em produção                 |
| ORM                         | Prisma                                       | Migrations revisáveis, schema único com múltiplos `@@schema` (multi-schema) |
| Cache/filas                 | Redis + BullMQ                               | `apps/worker`                                                               |
| Validação                   | Zod                                          | `packages/contracts`, validação de borda e de env                           |
| Testes unitários/integração | Vitest                                       | Mais rápido que Jest em ESM/TS nativo, boa integração com Turborepo         |
| Testes E2E                  | Playwright (a introduzir na Fase 1+)         | Não instalado ainda na Fase 0                                               |
| Observabilidade             | OpenTelemetry + logger estruturado (pino)    | `packages/observability`                                                    |

## Alternativas consideradas

- **Jest em vez de Vitest:** Jest é mais maduro, porém Vitest tem melhor suporte nativo a
  ESM/TypeScript sem transpilação adicional e é mais rápido em monorepos com Turborepo cache.
  Decisão pode ser revisitada em ADR futuro se surgir necessidade de compatibilidade
  específica com alguma lib que só suporte Jest.
- **Express em vez de Fastify (NestJS):** Fastify tem melhor desempenho e é a opção
  explicitamente sugerida no prompt mestre.
- **tRPC em vez de REST/OpenAPI:** o prompt mestre exige contrato REST/OpenAPI explícito
  (para consumo por integrações externas e documentação formal); tRPC foi descartado.

## Consequências

- Divergências futuras da stack aqui definida exigem um novo ADR justificando a mudança
  (regra 6.1 do prompt mestre).
- Playwright, axe-core, k6 e ferramentas de teste de carga/acessibilidade serão introduzidos
  quando houver fluxos de UI reais a testar (a partir da Fase 1).
