# Segurança, Privacidade e LGPD

Baseline: OWASP ASVS nível 2 (seção 12 do prompt mestre). Este documento evolui a cada fase;
nesta versão (Fase 0) cobre os controles já implementados na fundação e os que ficam
planejados para fases seguintes.

## 1. Controles já aplicados na Fase 0

- **TypeScript strict** em todos os pacotes — reduz classe inteira de bugs de tipo que podem
  virar vulnerabilidades (null/undefined não tratado, coerção implícita).
- **Validação de ambiente** (`packages/config/src/env.ts`): todas as variáveis de ambiente
  são validadas via Zod no boot da aplicação; a aplicação falha rápido (fail-fast) se uma
  variável obrigatória estiver ausente ou malformada, em vez de operar em estado inconsistente.
- **`.env.example`** documenta apenas nomes de variáveis, sem nenhum valor real, chave,
  segredo ou URL privada — conforme regra 3.9.
- **Nenhuma credencial, token ou segredo é commitado.** Segredos reais serão geridos por
  AWS Secrets Manager/Parameter Store quando houver ambiente de nuvem provisionado (Fase 8).
- **Prisma schema com `whistleblowing` em schema de banco segregado** (ver ADR-0003) —
  primeira camada de isolamento do domínio mais sensível.
- **Logs estruturados (JSON)** via `packages/observability`, com utilitário de mascaramento
  de PII disponível desde já (a ser aplicado extensivamente a partir da Fase 2+, quando
  houver dados reais de PII trafegando).

## 2. Controles planejados (por fase)

| Controle                                                                             | Fase prevista                                                    |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| OIDC/OAuth2 + MFA para equipe interna                                                | Fase 1 (RBAC inicial) / Fase 8 (hardening)                       |
| Cookies `HttpOnly`/`Secure`/`SameSite`, CSRF                                         | Fase 1 (auth de desenvolvimento) → Fase 8 (produção)             |
| CSP estrita, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` | Fase 8                                                           |
| Rate limit por rota/identidade/risco                                                 | Fase 5 (atendimento) e Fase 6 (denúncias), consolidado na Fase 8 |
| Proteção contra enumeração (protocolo, CPF, e-mail, usuário)                         | Fase 5 e 6                                                       |
| CAPTCHA por análise de risco                                                         | Fase 6 (formulário de denúncia)                                  |
| Hash Argon2id + comparação em tempo constante para código de denúncia                | Fase 6                                                           |
| SAST, SCA, secret scanning no CI                                                     | Fase 0 (scanners básicos) → Fase 8 (gate obrigatório)            |
| Backups criptografados + teste de restauração                                        | Fase 8                                                           |
| WAF + proteção contra bots/abuso                                                     | Fase 8 (infraestrutura AWS)                                      |
| Threat model formal por fluxo crítico                                                | Fase 6 (denúncias), Fase 8 (demais fluxos)                       |

## 3. LGPD — inventário inicial de dados (a expandir por fase)

| Dado                                       | Módulo                                       | Finalidade                                                                    | Base legal preliminar                                                   | Retenção prevista                                                       |
| ------------------------------------------ | -------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Nome, e-mail, telefone                     | Atendimento/Fale Conosco                     | Prestar atendimento e responder solicitações                                  | Execução de serviço público / legítimo interesse                        | Definir com jurídico (padrão sugerido: 5 anos)                          |
| CPF                                        | Atendimento (quando estritamente necessário) | Identificação de candidato/solicitante                                        | Cumprimento de obrigação legal/execução de serviço                      | Definir com jurídico                                                    |
| Identificação do denunciante (opcional)    | Denúncias                                    | Permitir acompanhamento e contato quando o denunciante não opta por anonimato | Consentimento explícito / legítimo interesse em apuração de integridade | Retenção curta e segregada — definir com jurídico/integridade           |
| Conteúdo da denúncia e anexos              | Denúncias                                    | Apuração de fato relatado                                                     | Legítimo interesse / cumprimento de política de integridade             | Definir com jurídico; cadeia de custódia preservada enquanto caso ativo |
| Dados de navegação (analytics first-party) | Portal público                               | Métricas agregadas de uso, sem perfilamento sensível                          | Legítimo interesse, com aviso de cookies                                | Curto prazo, agregado                                                   |

Este inventário será formalizado com a área jurídica/DPO do Instituto antes da Fase 6
(denúncias) e Fase 8 (produção). Nenhuma retenção definitiva foi decidida unilateralmente
nesta sessão.

## 4. Proteção específica do canal de denúncias (planejamento)

Conforme seção 12.3 do prompt mestre — a implementar integralmente na Fase 6:

- protocolo e código gerados com CSPRNG, entropia adequada;
- armazenamento apenas do hash (Argon2id) do código, nunca texto puro;
- comparação em tempo constante;
- limite de tentativas + cooldown progressivo;
- sem recuperação de código anônimo;
- mensagens de erro neutras (não revelam se um protocolo existe ou não);
- justificativa obrigatória para acesso interno + registro `CASE_ACCESSED`;
- nenhum pixel, script de marketing ou analytics de terceiros no canal;
- exportações com marca d'água, expiração de link e auditoria.

## 5. Registro de incidentes e resposta

Processo formal de resposta a incidentes de segurança/privacidade será documentado em
`docs/OPERATIONS_RUNBOOK.md` a partir da Fase 8, quando houver ambiente de produção real.
