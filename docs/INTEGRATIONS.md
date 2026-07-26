# Integrações

Todas as integrações abaixo são implementadas como interface + mock local nesta fase
(ver ADR-0004). Nenhuma é operacional até teste real com credenciais do Instituto Selecon.

## 1. Microsoft Graph (e-mail)

- **Interface:** `EmailProvider` (`packages/integrations/src/email`).
- **Status:** interface + `EmailMockProvider` definidos na Fase 0. Implementação real
  **não iniciada** — requer:
  - registro de aplicação no Azure AD (tenant do Instituto);
  - permissões mínimas: `Mail.Read`, `Mail.Send`, `Mail.ReadWrite` (aplicação, com admin
    consent) sobre a caixa compartilhada de atendimento;
  - client ID, client secret (ou certificado) e tenant ID armazenados no Secrets Manager,
    nunca em código ou `.env` commitado;
  - decisão sobre uso de `delta query` (leitura incremental) vs. `subscription`
    (webhook push) — recomendado subscription para reduzir polling, com renovação
    automática da assinatura antes da expiração.
- **Pendências para operação real:** credenciais acima + consentimento administrativo do
  tenant + endpoint público para receber notificações de subscription (validação de token
  de validação do Graph).

## 2. WhatsApp Cloud API

- **Interface:** `MessagingProvider` (`packages/integrations/src/messaging`).
- **Status:** interface + `MessagingMockProvider` definidos na Fase 0. Implementação real
  **não iniciada** — requer:
  - conta Meta Business verificada e número de telefone comercial aprovado;
  - `WABA ID`, `Phone Number ID`, token de acesso permanente (System User) e
    `App Secret` para validar assinatura de webhook (`X-Hub-Signature-256`);
  - templates de mensagem pré-aprovados pela Meta para contato fora da janela de 24h;
  - endpoint público HTTPS para webhook (verificação de `hub.challenge` no `GET` inicial).
- **Pendências para operação real:** credenciais acima + aprovação de templates.

## 3. Sistema do candidato (Candidate Gateway)

- **Interface:** `CandidateProvider` (`packages/integrations/src/candidate`), conforme
  contrato da seção 11.4 do prompt mestre.
- **Status:** interface + `CandidateMockProvider` (dados fictícios determinísticos) definidos
  na Fase 0. Implementação real **não iniciada** — requer:
  - especificação técnica real do sistema atual (API existente ou necessidade de deep
    link assinado);
  - se não houver API: URLs de redirecionamento por concurso, e um mecanismo de assinatura
    de link (ex.: HMAC com `candidateRef` + `contestId` + expiração) a ser definido em ADR
    específico da Fase 4.
- **Pendências:** definição de contrato real junto à área responsável pelo sistema de
  candidatos; até lá, a experiência do usuário usa o adapter mock/redirect explícito, sem
  inventar endpoints inexistentes (regra 9.5).

## 4. Armazenamento de objetos e antivírus

- **Interface:** `StorageProvider` (`packages/integrations/src/storage`).
- **Status:** interface + `StorageMockProvider` (grava em disco local/`tmp` para
  desenvolvimento) definidos na Fase 0. Implementação real (S3 + scan de antivírus, ex.
  ClamAV via Lambda ou serviço gerenciado) **não iniciada** — depende de:
  - bucket(s) S3 (público vs. privado vs. denúncias, segregados);
  - política de KMS por classificação de dado;
  - escolha e provisionamento do serviço de antivírus.

## 5. Chat web / chatbot (RAG)

- **Status:** não iniciado. Nenhum provedor de IA foi selecionado ou contratado. Interface
  de abstração (`KnowledgeAssistantProvider`) será desenhada na Fase 5, respeitando as
  restrições da seção 11.3 (nunca acessar domínio de denúncias, nunca enviar dados pessoais
  sem base contratual, limiar de confiança, registro de decisão de handoff).

## Health checks

Todas as implementações (mock e futuras reais) expõem `healthCheck(): Promise<HealthStatus>`
com o formato:

```ts
type HealthStatus = {
  status: "ok" | "degraded" | "down";
  detail?: string;
  checkedAt: string; // ISO-8601 UTC
};
```

Os health checks das integrações serão agregados no endpoint `/health/ready` da API
(a implementar incrementalmente conforme cada integração real for adicionada).
