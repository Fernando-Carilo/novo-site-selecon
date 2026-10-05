# Plano de Implementação — Portal Integrado Selecon

> Referência: `docs/PROMPT-MESTRE-CLAUDE-NOVO-SITE-SELECON.md` (seções 17 e 21).
> Este documento é vivo: deve ser atualizado ao final de cada fase com o que foi
> efetivamente entregue, testado e o que ficou pendente.

## Estado do repositório no início do trabalho

- Repositório `novo-site-selecon` estava **vazio** (zero commits) no branch
  `claude/new-session-e7n8z6`.
- Nenhum código, `package.json`, README ou histórico prévio existia.
- O protótipo visual `selecon-portal-v2.html` **não foi enviado** junto com os demais
  anexos desta sessão (ver `docs/ASSUMPTIONS.md`, item 1). Isso bloqueia fidelidade visual
  total na Fase 1, mas não bloqueia a Fase 0.

## Estrutura de monorepo adotada

```text
novo-site-selecon/
├─ apps/
│  ├─ web/                 # Next.js (App Router) — portal público, candidato, admin
│  ├─ api/                 # NestJS + Fastify — API modular, OpenAPI
│  └─ worker/               # Jobs assíncronos (BullMQ), adapters de integração
├─ packages/
│  ├─ ui/                   # Design system (tokens + componentes) compartilhado
│  ├─ db/                   # Prisma schema, migrations, seeds, repositories
│  ├─ contracts/             # Zod schemas / DTOs / tipos de evento compartilhados
│  ├─ auth/                  # RBAC/ABAC: roles, permissions, policies
│  ├─ integrations/           # Interfaces + mocks: CandidateProvider, EmailProvider, MessagingProvider, Storage
│  ├─ observability/           # Logger estruturado + bootstrap OpenTelemetry
│  └─ config/                 # tsconfig base, eslint config, validação de env (Zod)
├─ infra/                    # IaC (Terraform) — apenas código de referência, sem apply
├─ docs/
├─ .github/workflows/
├─ docker-compose.yml
└─ pnpm-workspace.yaml
```

Justificativas técnicas detalhadas estão registradas em `docs/DECISIONS/` (ADRs).

## Fases (visão geral)

| Fase | Escopo                                                              | Status                                                                                   |
| ---- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 0    | Descoberta e fundação (monorepo, tooling, CI, docker-compose, docs) | ✅ Concluída (2026-07-26)                                                                 |
| 1    | Design system e shell público                                       | ✅ Shell público, tokens e componentes acessíveis entregues (2026-10-05); shell admin, RBAC de UI e Storybook pendentes |
| 2    | Portal institucional                                                | ✅ Páginas públicas com conteúdo real entregues (2026-10-05); CMS editorial fica na **Central de Serviços** (ver `docs/CENTRAL_DE_SERVICOS.md`) |
| 3    | Concursos e página do edital                                        | ✅ Catálogo com filtros na URL e página do edital entregues (2026-10-05) sobre dataset migrado; editor, workflow de aprovação e versionamento de documentos ficam na Central |
| 4    | Área do candidato e adapters                                        | ◐ Experiência unificada com deep links para os sistemas de inscrição (RJ/geral e MT); SSO/API do provedor pendente |
| 5    | Atendimento omnichannel                                             | ◐ Fale Conosco com protocolo, FAQ e consulta de protocolo via gateway da Central; painel do atendente, Graph/WhatsApp e chatbot pendentes |
| 6    | Canal de denúncias                                                  | Não iniciada                                                                             |
| 7    | Anúncios e governança comercial                                     | Não iniciada                                                                             |
| 8    | Segurança, performance e operação                                   | Não iniciada                                                                             |
| 9    | Migração e go-live                                                  | Não iniciada                                                                             |

Cada fase subsequente exige uma sessão de trabalho dedicada (o escopo total descrito no
prompt mestre — omnichannel completo, canal de denúncias segregado, anúncios com governança,
infraestrutura AWS produtiva e migração de três portais — corresponde a um programa de meses
de um time multidisciplinar, não a uma única sessão). Este plano será atualizado a cada fase
concluída com entregas reais, não aspiracionais.

## Fase 0 — Escopo detalhado e critério de saída

**Objetivo:** projeto executando localmente, lint/typecheck/test/build verdes, documentação
base criada, sem qualquer integração externa real ou provisionamento de infraestrutura.

Entregas desta fase:

1. Estrutura de monorepo (`pnpm` + Turborepo) com `apps/web`, `apps/api`, `apps/worker` e os
   pacotes compartilhados listados acima.
2. Tooling compartilhado: TypeScript `strict`, ESLint (flat config), Prettier, Vitest.
3. `apps/web`: Next.js App Router mínimo, com tokens de design (seção 5.2) aplicados via
   Tailwind CSS, layout público básico (header/footer) e página inicial placeholder.
4. `apps/api`: NestJS + Fastify com módulo de health check (liveness/readiness) e OpenAPI
   básico exposto em `/docs`.
5. `apps/worker`: processo mínimo com fila BullMQ configurável (Redis) e um job de exemplo.
6. `packages/db`: schema Prisma cobrindo o modelo de dados mínimo da seção 8 do prompt
   mestre (identidade, conteúdo, concursos, atendimento, denúncias em schema segregado,
   anúncios, governança/auditoria), com migração inicial e seed fictício.
7. `packages/contracts`, `packages/auth`, `packages/integrations`, `packages/observability`:
   esqueleto funcional com interfaces documentadas (`CandidateProvider`, `EmailProvider`,
   `MessagingProvider`) e mocks locais, sem nenhuma credencial ou chamada de rede real.
8. `docker-compose.yml`: Postgres + Redis para desenvolvimento local.
9. `.github/workflows/ci.yml`: pipeline de PR com install (lockfile imutável), lint,
   typecheck, testes e build.
10. Documentação base listada na regra 3.5 do prompt mestre (este conjunto de arquivos).

**Critério de saída (definition of done da Fase 0):**

- `pnpm install` conclui sem erros;
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` executam e passam (resultados
  reais documentados em `docs/TEST_REPORT.md`, não afirmações genéricas);
- `docker compose up -d db redis` sobe as dependências locais;
- `pnpm --filter @selecon/db prisma migrate dev` aplica a migração inicial com sucesso;
- CI configurado (não necessariamente executado em um runner real nesta sessão, mas
  validado localmente com os mesmos comandos).

## Entrega de 2026-10-05 — Portal público completo (Fases 1–3 + partes das 4 e 5)

Objetivo da sessão: nenhuma página vazia ou sem nexo; todo o conteúdo do site atual migrado;
home com hero grande de concursos em destaque; área comercial refeita e integrada à Central
de Serviços; imagens de alta qualidade; links validados.

### O que foi entregue

| Área | Entrega |
| --- | --- |
| Design system (`packages/ui`) | Tokens completos (cores, washes, elevação, raio, foco, movimento) e componentes acessíveis: Container, Card, Badge, SectionHeading, Breadcrumbs, Alert, Accordion nativo, campos de formulário com erro associado, Stat, ícones SVG, Button ampliado |
| Conteúdo (`apps/web/lib/content`) | Modelo público de concurso/notícia/serviço; dataset migrado (22 concursos 2022–2026, 10 notícias, 6 linhas de serviço, dados institucionais, equipe, números oficiais, clientes, reconhecimentos); provider estático com busca tolerante a acentos e sinônimos, filtros, facetas e paginação; provider HTTP da Central |
| Contratos (`packages/contracts/central`) | Schemas Zod de publicações (`portalContestSchema`, `portalNewsPostSchema`) e de envios (lead comercial, ticket com `contestSlug`, alertas, recibo, consulta de protocolo) |
| Shell | Cabeçalho com barra de utilidades, submenu nativo, menu mobile com foco preso e `Esc`, logotipo oficial, rodapé completo |
| Home | Hero grande com concursos em destaque (tabs WAI-ARIA, rotação pausável, respeita `prefers-reduced-motion`), busca com autocompletar, atalhos, inscrições abertas, publicações recentes, alertas por e-mail, jornada do candidato, bloco institucional, comercial, notícias, clientes e reconhecimentos |
| Concursos | `/concursos` com filtros persistidos na URL (busca, situação, UF, área, escolaridade, tipo, ordenação, página), facetas com contagens, chips removíveis, estado vazio útil; `/concursos/[slug]` com cabeçalho, CTAs, dados-chave, cronograma, cargos, publicações versionadas, FAQ, serviços do candidato, alertas, contato contextualizado, relacionados, JSON-LD |
| Institucional | `/instituto` (quem somos, trajetória, missão/visão/valores, governança e equipe, estrutura e segurança, compromisso social, base legal, reconhecimentos), `/servicos` e `/servicos/[slug]`, `/transparencia`, `/integridade` (canal de denúncias explicado, encaminhando ao sistema atual), `/imprensa`, `/trabalhe-conosco`, `/privacidade` (LGPD), `/acessibilidade`, `/mapa-do-site`, 404 útil |
| Notícias | `/noticias` com filtro por categoria e `/noticias/[slug]` com JSON-LD `NewsArticle` e compartilhamento |
| Comercial (refeito) | `/comercial`: proposta de valor B2G, serviços, etapas de contratação, capacidades, certames de referência e formulário de solicitação de proposta classificado por tipo de projeto → fila Comercial da Central |
| Atendimento | `/atendimento` (canais, 17 FAQs em 10 grupos, consulta de protocolo honesta, compromissos), `/fale-conosco` (ticket com protocolo, assunto, concurso, canal preferido, sugestão de FAQs) |
| Candidato | `/candidato`: serviços da seção 9.5 com deep links por sistema (RJ/geral e MT), concursos abertos, FAQ e orientações de segurança |
| Imagens | Capas vetoriais de alta definição por área (`ContestCover`) + suporte a fotos oficiais via `next/image`; ícones, apple-icon e Open Graph gerados da marca |
| SEO/segurança | `metadata` por página com canonical, `robots.ts`, `sitemap.ts` dinâmico, 24 redirects 301 do WordPress, cabeçalhos de segurança, `remotePatterns` |
| Qualidade | Validador de links internos/âncoras (`links:check`), exportador do inventário de migração, 10 testes unitários, capturas em 390/768/1280 sem overflow horizontal |

### O que ficou explicitamente fora (e onde está planejado)

- CMS/editor de concursos, versionamento de documentos com checksum/antivírus, aprovação em duas
  etapas e agendamento: **Central de Serviços** (contrato em `docs/CENTRAL_DE_SERVICOS.md`).
- Canal de denúncias próprio e segregado (Fase 6): `/integridade` encaminha ao sistema atual.
- Painel do atendente, e-mail (Graph), WhatsApp e chatbot (Fase 5).
- Publicidade e campanhas (Fase 7): sem espaço reservado vazio na home.
- Área administrativa, autenticação e RBAC de interface (Fases 1/8).
- Fotos oficiais dos concursos: dependem de carga pela Central (`cover.imageUrl`).

## Próximos passos

1. Solicitar `selecon-portal-v2.html` para destravar fidelidade visual da Fase 1.
2. Iniciar Fase 1: tokens completos, componentes acessíveis (Radix/shadcn), shells
   público e administrativo, autenticação de desenvolvimento, RBAC inicial, catálogo de
   componentes.
3. Antes de qualquer integração real (Microsoft Graph, WhatsApp Cloud API, sistema do
   candidato) ou provisionamento AWS: apresentar lista de credenciais/permissões
   necessárias e aguardar autorização explícita, conforme regra 3.12 e seção 21.8.
