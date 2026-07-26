# Relatório de Testes

Este relatório é atualizado ao final de cada fase com resultados reais de execução — nunca
com afirmações genéricas sem evidência (regra 20 do prompt mestre).

## Fase 0 — Fundação (executado em 2026-07-26)

Ambiente: Node.js 22.22.2, pnpm 10.33.0, PostgreSQL 16, Redis 7 (instâncias locais nativas —
Docker não estava disponível no sandbox de execução desta sessão; ver nota abaixo).

### Comandos executados e resultado real

| Comando                                                         | Resultado                                                                                                                                       |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install`                                                  | ✅ Sucesso — 11 workspaces, 682 pacotes resolvidos                                                                                              |
| `pnpm --filter @selecon/db exec prisma validate`                | ✅ Schema válido                                                                                                                                |
| `pnpm --filter @selecon/db exec prisma migrate dev --name init` | ✅ Migração aplicada — 7 schemas Postgres criados (`identity`, `content`, `contests`, `service`, `whistleblowing`, `advertising`, `governance`) |
| `pnpm --filter @selecon/db exec tsx prisma/seed.ts`             | ✅ Seed fictício aplicado sem erros                                                                                                             |
| `pnpm format` (prettier --check)                                | ✅ Todos os arquivos formatados                                                                                                                 |
| `pnpm lint`                                                     | ✅ 17/17 pacotes/apps sem erros                                                                                                                 |
| `pnpm typecheck`                                                | ✅ 17/17 pacotes/apps sem erros                                                                                                                 |
| `pnpm test`                                                     | ✅ 17/17 pacotes com testes executados, **17 testes passando**, 0 falhas                                                                        |
| `pnpm build`                                                    | ✅ 10/10 pacotes/apps com build gerado com sucesso                                                                                              |

### Testes por pacote (Vitest)

| Pacote                                       | Arquivo de teste                    | Testes                                                                            |
| -------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------- |
| `@selecon/config`                            | `src/env.test.ts`                   | 3 passando                                                                        |
| `@selecon/contracts`                         | `src/contest/contest.test.ts`       | 2 passando                                                                        |
| `@selecon/auth`                              | `src/policy.test.ts`                | 4 passando                                                                        |
| `@selecon/integrations`                      | `src/health-check.test.ts`          | 4 passando                                                                        |
| `@selecon/observability`                     | `src/correlation.test.ts`           | 2 passando                                                                        |
| `@selecon/api`                               | `src/health/health.service.test.ts` | 1 passando                                                                        |
| `@selecon/worker`                            | `src/jobs/example-job.test.ts`      | 1 passando                                                                        |
| `@selecon/db`, `@selecon/ui`, `@selecon/web` | —                                   | sem testes ainda (nenhuma regra de negócio de UI/domínio implementada nesta fase) |

**Total: 17 testes, 17 passando, 0 falhando.**

### Smoke tests manuais de runtime (com Postgres/Redis reais)

- `apps/web` (`next start`): `GET /` → `200`, `GET /concursos` → `200`, conteúdo renderizado
  confirmado via `curl`.
- `apps/api` (`node dist/main.js`): `GET /health/live` → `200 {"status":"ok"}`;
  `GET /health/ready` → `200 {"status":"ok"}` (checagem real de conexão Postgres + Redis);
  `GET /docs` (OpenAPI/Swagger UI) → `200`.
- `apps/worker` (`node dist/main.js`): conectou ao Redis real, log `"apps/worker pronto e
conectado ao Redis"`, encerramento gracioso (`SIGTERM`) confirmado.

### Nota sobre o ambiente de validação

O `docker-compose.yml` (Postgres + Redis) não pôde ser executado neste sandbox porque o
daemon Docker não estava disponível (`dockerd` sem permissão para configurar cgroups/ulimits
no container de execução desta sessão). A validação foi feita com instâncias nativas de
PostgreSQL 16 e Redis 7 já presentes no ambiente, usando a mesma `DATABASE_URL`/`REDIS_URL` de
desenvolvimento. O `docker-compose.yml` em si foi revisado mas não testado ponta a ponta nesta
sessão — recomenda-se validar `docker compose up -d db redis` em um ambiente com Docker
funcional antes de considerar a Fase 0 encerrada em definitivo.

## Fase 8 — Validação completa e E2E (executado em 2026-07-26)

Ambiente: mesmo sandbox da Fase 0 (PostgreSQL 16 e Redis 7 nativos, Docker segue indisponível
— bloqueio já registrado e aceito, não repetido aqui). `apps/api` compilado (`node dist/main.js`)
e `apps/web` em build de produção (`next start`), ambos rodando de fato durante toda a validação.

### Validação estática e unitária (monorepo inteiro)

| Comando         | Resultado                                                                 |
| --------------- | -------------------------------------------------------------------------- |
| `pnpm lint`      | ✅ 17/17 pacotes/apps sem erros                                            |
| `pnpm typecheck` | ✅ 17/17 pacotes/apps sem erros                                            |
| `pnpm test`      | ✅ 7 pacotes com testes, **57 testes passando**, 0 falhas (ver tabela abaixo) |
| `pnpm build`     | ✅ 10/10 pacotes/apps com build gerado com sucesso                         |

| Pacote                | Arquivos de teste | Testes         |
| --------------------- | ------------------ | -------------- |
| `@selecon/config`      | 1                   | 3 passando      |
| `@selecon/contracts`   | 1                   | 2 passando      |
| `@selecon/observability` | 1                 | 2 passando      |
| `@selecon/auth`        | 3                   | 10 passando     |
| `@selecon/integrations`| 1                   | 4 passando      |
| `@selecon/worker`      | 1                   | 1 passando      |
| `@selecon/api`         | 8                   | 35 passando (inclui testes de integração reais com Postgres: contests, advertising, content, whistleblowing, admin/users, auth) |
| `@selecon/db`, `@selecon/ui`, `@selecon/web` | — | sem testes automatizados de unidade ainda (cobertos indiretamente pela suíte E2E abaixo) |

**Total: 57 testes, 57 passando, 0 falhando.**

### E2E (Playwright) — `e2e/`, 22 fluxos exigidos

Suíte nova nesta fase, executada de ponta a ponta contra `apps/api` (build compilado) e
`apps/web` (build de produção) reais, com Postgres/Redis reais — nenhum mock de rede. Chromium
pré-instalado do sandbox (`/opt/pw-browsers/chromium`), dois projetos:

| Projeto            | Viewport                | Resultado         |
| ------------------- | ------------------------ | ------------------ |
| `desktop-chromium`   | Desktop Chrome (padrão)  | ✅ 14/14 testes passando |
| `mobile-chromium`    | Pixel 7 (412×915, touch) | ✅ 14/14 testes passando |

7 arquivos de spec cobrindo os 22 fluxos numerados: portal público (1–3, 21, 22),
autenticação/RBAC (4, 5, 15), concursos com separação de funções (6–8, 20), atendimento
(9–11), denúncias (12–14), anúncios com revisão em duas etapas (16–18), CMS (19), mais um
teste de responsividade do menu mobile do admin. Dados sempre gerados com timestamp
(`Date.now()`) — sem dependência de estado pré-existente além dos usuários de demonstração
(senha normalizada via `pnpm --filter @selecon/api seed:e2e`).

### Bugs reais encontrados e corrigidos pela suíte E2E

A suíte não passou de primeira — cada falha foi investigada até a causa raiz (nunca
contornada só no teste) e corrigida no código de produção quando o bug era real:

1. **`POST /auth/logout` retornava 400.** `apiFetch` sempre enviava `Content-Type:
   application/json`, e o Fastify rejeita esse header com corpo vazio. Corrigido em
   `apps/web/lib/api-client.ts` — o header só é enviado quando há corpo.
2. **Corrida de hidratação no formulário de login.** Clique em "Entrar" antes do React
   anexar o `onSubmit` disparava submit nativo (GET com credenciais na query string).
   Corrigido com `HydrationMarker` (`<html data-hydrated="true">` via `useEffect`) +
   `gotoAndReady()` no helper de teste, que espera esse atributo além de `networkidle`.
3. **`event.currentTarget` nulo após `await`.** React limpa `currentTarget` do evento
   sintético assim que o handler assíncrono atravessa um `await`. Todo formulário de
   criação/atualização que chamava `event.currentTarget.reset()` depois de um `await
   apiFetch(...)` bem-sucedido lançava um `TypeError` nesse ponto e exibia um alerta de
   falha genérico mesmo com a operação já persistida no banco. Corrigido em 6 formulários
   (usuários, anúncios, denúncias ×3, atendimento, conteúdo, notícias) capturando o
   elemento do formulário antes do primeiro `await`.
4. **Rate limit de login mascarado como credenciais inválidas.** `POST /auth/login` está
   limitado a 10 requisições/60s por IP (proteção contra força bruta). A suíte E2E
   autentica ~13 vezes em menos de 90s a partir do mesmo host, e o front-end mostrava
   "E-mail ou senha incorretos" para *qualquer* erro, mascarando o 429 real. Corrigido
   tornando o limite configurável via `AUTH_LOGIN_RATE_LIMIT` (produção mantém o padrão
   seguro; só é elevado no `.env` local deste sandbox) e dando ao 429 sua própria mensagem.
5. **Header/rodapé público duplicado sobre toda a área `/admin`.** O layout raiz
   envolvia inclusive o dashboard administrativo autenticado com o `SiteHeader`/`SiteFooter`
   institucionais — em viewport mobile isso chegava a interceptar cliques em botões da
   própria página. Corrigido com `SiteChrome`, que decide por pathname se renderiza o
   chrome público (nunca para rotas `/admin`).
6. **Overflow horizontal da página inteira no admin em mobile.** O item flex que envolve
   header+main do dashboard não tinha `min-w-0` — por padrão um item flex não encolhe
   abaixo da largura intrínseca do conteúdo, e uma tabela com `overflow-x-auto`
   (`min-w-[820px]`) forçava a página inteira a crescer em vez de rolar só internamente,
   empurrando botões da página para fora da viewport. Confirmado via script de diagnóstico
   (`document.elementFromPoint` + `getBoundingClientRect`) mostrando `scrollWidth` 910px
   vs. `clientWidth` 412px — iguais (412/412) após adicionar `min-w-0`.

Além dos bugs de aplicação, 4 bugs de *locator* da própria suíte (não do produto) foram
corrigidos: `getByLabel("Ação")` colidindo com "Navegação administrativa" (resolvido com
`exact: true`), e três casos de `getByText(<status>)` casando tanto com uma célula de tabela
quanto com o badge do painel de detalhe (resolvido escopando a `p.rounded-full`).

## Metas de cobertura (lembrete para fases futuras)

- Mínimo 80% em regras de domínio e serviços críticos;
- Mínimo 90% em autenticação, autorização, geração/verificação de códigos de denúncia e
  versionamento de documentos;
- Cobertura não substitui qualidade — casos negativos e de abuso são obrigatórios a partir da
  Fase 3 (concursos) e essenciais nas Fases 5 e 6.
