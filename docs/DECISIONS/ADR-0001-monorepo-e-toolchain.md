# ADR-0001 — Monorepo com pnpm + Turborepo

- **Status:** Aceito
- **Data:** 2026-07-26

## Contexto

O prompt mestre exige múltiplos aplicativos (`web`, `api`, `worker`) e pacotes compartilhados
(design system, contratos, auth, integrações, observabilidade, config) com fronteiras de
domínio claras, versionamento conjunto e pipelines de CI compartilhados.

## Decisão

Adotar monorepo gerenciado por `pnpm` workspaces + Turborepo para orquestração de
build/lint/test/typecheck com cache incremental.

## Alternativas consideradas

- **npm/yarn workspaces sem Turborepo:** funcional, porém sem cache de tarefas e paralelismo
  eficiente entre pacotes — pipelines de CI ficariam mais lentos à medida que o repositório
  cresce.
- **Múltiplos repositórios (polyrepo):** dificultaria versionamento conjunto de contratos
  (Zod/OpenAPI) entre `web`, `api` e `worker`, e o objetivo do produto é um único ecossistema
  coeso.
- **Nx:** alternativa válida e mais rica em geradores, mas com curva de aprendizado maior;
  Turborepo é suficiente para o escopo atual e mais simples de manter.

## Consequências

- Todos os pacotes/apps compartilham `tsconfig` base e configuração de lint em
  `packages/config`.
- `pnpm-workspace.yaml` define `apps/*` e `packages/*` como workspaces.
- `turbo.json` define pipeline (`build`, `lint`, `typecheck`, `test`) com dependências entre
  tarefas (`^build` antes de `build`, etc.).
