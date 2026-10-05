# Integração com a Central de Serviços Selecon

> Status: **contrato definido e implementado no portal; endpoint da Central ainda não exercitado
> contra ambiente real** (regra 3.10 — nenhuma integração é declarada operacional sem teste real).

A Central de Serviços Selecon (em desenvolvimento, AWS) passa a ser a **fonte de verdade** de
publicações de concursos, notícias e das filas de atendimento/comercial. O portal público é um
consumidor: renderiza o que a Central publica e envia para ela o que o cidadão/órgão preenche.

## 1. Fronteira e responsabilidades

| Responsabilidade | Central de Serviços | Portal (`apps/web`) |
| --- | --- | --- |
| Cadastro, workflow editorial (autor ≠ aprovador), agendamento e versionamento de editais/publicações | ✅ | — |
| Notícias e comunicados (rascunho → revisão → publicação) | ✅ | — |
| Fotos oficiais dos concursos (alta resolução, com `alt`) | ✅ | exibe via `next/image` (`cover.imageUrl`) |
| Renderização pública, SEO, sitemap, redirects, acessibilidade | — | ✅ |
| Capa vetorial quando não há foto (`ContestCover`) | — | ✅ |
| Fila **Comercial** (leads classificados por tipo de projeto) | ✅ recebe e trata | ✅ coleta e envia |
| Fila **Atendimento** (tickets do Fale Conosco, consulta de protocolo) | ✅ | ✅ coleta e envia |
| Assinaturas de alerta de editais (double opt-in, descadastro) | ✅ | ✅ coleta e envia |

## 2. Configuração no portal

| Variável | Valor | Efeito |
| --- | --- | --- |
| `CONTENT_SOURCE` | `static` (padrão) \| `central` | origem de concursos e notícias |
| `CENTRAL_SERVICOS_API_URL` | `https://.../api` | base URL (obrigatória em `central`) |
| `CENTRAL_SERVICOS_API_TOKEN` | segredo | Bearer token de leitura/escrita do portal (Secrets Manager) |
| `CENTRAL_SERVICOS_REVALIDATE_SECONDS` | `300` | ISR das leituras |
| `SUBMISSIONS_MODE` | `mock` \| `central` | destino dos formulários; em produção `mock` precisa ser explícito |
| `NEXT_IMAGE_EXTRA_HOST` | host da CDN | libera imagens remotas da Central |

Código: `apps/web/lib/content/central-provider.ts` (leitura) e `apps/web/lib/central/submissions.ts`
(escrita). Contratos Zod compartilhados em `packages/contracts/src/central/`.

## 3. Leitura — publicações e notícias

Todas as respostas usam o envelope `{ "data": ..., "meta": { "total", "generatedAt" } }`.

| Método | Caminho | Resposta (`data`) | Observações |
| --- | --- | --- | --- |
| GET | `/v1/portal/contests` | `PortalContest[]` | somente itens com status público; ordenados pela Central ou pelo portal |
| GET | `/v1/portal/contests/{slug}` | `PortalContest` | 404 quando não publicado |
| GET | `/v1/portal/news` | `PortalNewsPost[]` | publicadas, mais recentes primeiro |
| GET | `/v1/portal/news/{slug}` | `PortalNewsPost` | 404 quando não publicada |

Schemas: `portalContestSchema` e `portalNewsPostSchema` (`packages/contracts/src/central/publications.ts`).
Regras que a Central deve garantir (seção 9.4 do prompt mestre):

- `publications[]` nunca remove versões: uma retificação adiciona item com `version` maior e marca
  `current: true` apenas no vigente; `url` é pública (edital) ou assinada curta (restrito).
- `status` é um estado de domínio (`PREVISTO`, `INSCRICOES_ABERTAS`, `EM_ANDAMENTO`, `HOMOLOGADO`,
  `ENCERRADO`, `SUSPENSO`) — o portal deriva rótulos, cores e ordenação a partir dele.
- `cover.imageUrl` deve ter ≥ 1600 px de largura e `imageAlt` obrigatório; sem foto, o portal usa a
  capa vetorial da área (`cover.area`).
- Datas em `YYYY-MM-DD` no fuso de Brasília; valores monetários em centavos.
- `legacyUrl` preenchido para tudo que veio do WordPress (alimenta os redirects 301).

Cache: ISR de 5 minutos. Para publicações críticas (edital, convocação, resultado), a Central deve
chamar o endpoint de revalidação do portal (`POST /api/revalidate` — a implementar na Fase 3 com
token próprio) para purgar `/`, `/concursos` e `/concursos/{slug}` imediatamente.

## 4. Escrita — formulários do portal

Todas as chamadas são `POST` JSON com `Authorization: Bearer` e `Idempotency-Key` (UUID por envio).
Resposta `201` com `SubmissionReceipt`:

```json
{ "protocol": "COM-2026-7F3A1C", "receivedAt": "2026-10-05T14:03:00Z", "queue": "COMERCIAL" }
```

| Caminho | Corpo (Zod) | Fila | Origem no portal |
| --- | --- | --- | --- |
| `/v1/portal/commercial-leads` | `commercialLeadSchema` | `COMERCIAL` | `/comercial` |
| `/v1/portal/tickets` | `createTicketRequestSchema` (inclui `contestSlug` opcional — slug público do concurso; `subject` traz o rótulo legível do assunto) | `ATENDIMENTO` | `/fale-conosco` |
| `/v1/portal/alert-subscriptions` | `alertSubscriptionSchema` | `ALERTAS` | home, catálogo e página do edital |
| `GET /v1/portal/tickets/{protocol}` | resposta `ticketLookupResultSchema` | — | consulta de protocolo em `/atendimento#protocolo` |

Consulta de protocolo — resposta `200`:

```json
{
  "found": true,
  "status": "IN_PROGRESS",
  "subject": "Isenção de taxa",
  "updatedAt": "2026-10-05T14:10:00Z",
  "messages": [{ "at": "2026-10-05T14:03:00Z", "direction": "IN", "body": "..." }]
}
```

`404` ou `{ "found": false, "reason": "NOT_FOUND" | "UNAVAILABLE" }` quando não localizado. As
mensagens devem conter apenas o conteúdo do próprio chamado (nunca dados de terceiros) e a
Central deve aplicar rate limit por IP/protocolo para evitar enumeração.

Erros: `400` com `{ "errors": [{ "path": "email", "message": "..." }] }` (o portal já valida com o
mesmo schema antes de enviar), `409` para `Idempotency-Key` repetida com corpo diferente, `429`
para rate limit (o portal mostra mensagem neutra e pede nova tentativa).

Dados pessoais: o portal **não registra** corpo de formulário em logs; apenas fila e protocolo.
A Central é a controladora operacional dos dados após o recebimento (ver `docs/SECURITY_AND_PRIVACY.md`).

## 5. Modo mock (desenvolvimento e demonstração)

`MockSubmissionGateway` gera protocolos locais (`COM-`, `ATD-`, `ALT-`) e registra no log apenas a
fila e o protocolo. A consulta de protocolo no mock sempre responde "não localizado" e orienta o
cidadão ao sistema de atendimento atual — nunca finge encontrar um protocolo.

## 6. Checklist de homologação (antes de ligar `CONTENT_SOURCE=central`)

- [ ] `GET /v1/portal/contests` valida 100% contra `portalContestSchema` (teste automatizado a criar em `apps/web/lib/content/central-provider.test.ts`).
- [ ] Paridade de contagem entre Central e dataset estático no dia do corte (`docs/migration/content-inventory.csv`).
- [ ] Revalidação sob demanda funcionando para publicações críticas.
- [ ] Token com escopo mínimo (`publications:read`, `submissions:write`) rotacionado via Secrets Manager.
- [ ] Teste real de cada formulário com protocolo visível na fila correspondente da Central.
- [ ] Alertas: confirmação por e-mail (double opt-in) e link de descadastro funcionando.
