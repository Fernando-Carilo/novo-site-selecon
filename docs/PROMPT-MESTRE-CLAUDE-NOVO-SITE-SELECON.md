# PROMPT MESTRE PARA O CLAUDE CODE

## Novo Portal Integrado do Instituto Selecon

> **Repositório:** `novo-site-selecon`  
> **Referência visual obrigatória:** `selecon-portal-v2.html`  
> **Objetivo:** desenvolver um portal institucional e transacional moderno, robusto, responsivo, seguro e administrável, substituindo gradualmente a experiência fragmentada atual.

---

## 1. PAPEL QUE VOCÊ DEVE ASSUMIR

Atue como **arquiteto de software sênior, tech lead full stack, especialista em UX para serviços públicos, segurança de aplicações, LGPD, DevOps e integrações omnichannel**.

Você trabalhará diretamente no repositório GitHub `novo-site-selecon`. Não entregue somente uma landing page ou um conjunto de telas estáticas. O resultado deve ser um **produto completo**, com frontend, backend, banco de dados, administração, autenticação, integrações desacopladas, auditoria, testes, documentação, infraestrutura como código e estratégia de migração.

O portal unificará, em uma identidade e navegação coerentes, as funções hoje distribuídas entre:

- `https://selecon.org.br` — portal institucional e concursos;
- `https://atendimento.selecon.org.br` — atendimento e Fale Conosco;
- `https://denuncias.selecon.org.br` — canal de denúncias.

A unificação é de experiência, marca, governança e operação. **Não misture dados que devem permanecer segregados**, especialmente informações do canal de denúncias.

---

## 2. RESULTADO ESPERADO

Construir um ecossistema digital único com os seguintes pilares:

1. **Portal público institucional** moderno, rápido, acessível, confiável e preparado para SEO.
2. **Gestão completa de concursos e processos seletivos**, incluindo página própria por edital, documentos versionados, cronograma, cargos, comunicados, FAQ, alertas e integração com o sistema do candidato.
3. **Área do candidato**, inicialmente por adaptador para o sistema existente, preparada para SSO e futura internalização de serviços.
4. **Central de atendimento omnichannel**, integrando web, e-mail, WhatsApp e chatbot, com protocolo, fila, SLA, responsável, histórico, classificação e base de conhecimento.
5. **Canal de denúncias seguro e segregado**, anônimo ou identificado, com protocolo, código de acesso, anexos, comunicação protegida, fluxo interno e auditoria reforçada.
6. **Fale Conosco integrado** à operação de atendimento, evitando formulários sem rastreabilidade.
7. **Gestão de publicidade e campanhas pagas**, com inventário, aprovação, agendamento, métricas e regras para não confundir publicidade com conteúdo oficial.
8. **Área administrativa robusta**, com RBAC/ABAC, dashboards, concursos, documentos, conteúdo, atendimento, denúncias, anúncios, usuários, auditoria, integrações e configurações.
9. **Arquitetura cloud pronta para produção**, observável, escalável, recuperável e automatizada.
10. **Migração controlada** dos portais atuais, preservando dados, URLs, SEO, histórico e possibilidade de rollback.

---

## 3. REGRAS DE EXECUÇÃO NO REPOSITÓRIO

Antes de alterar qualquer código:

1. Leia todo o repositório, `README`, arquivos de configuração, histórico recente, branches, package manager e estrutura existente.
2. Execute `git status`, registre o branch atual e preserve alterações legítimas já existentes.
3. Não apague nem reescreva histórico. Não force push. Não remova código funcional sem justificar e sem criar caminho de migração.
4. Crie uma branch de trabalho com nome claro, por exemplo `feat/portal-selecon-v2-foundation`, caso o fluxo do repositório permita.
5. Crie e mantenha atualizados:
   - `docs/IMPLEMENTATION_PLAN.md`;
   - `docs/ARCHITECTURE.md`;
   - `docs/DECISIONS/` com ADRs;
   - `docs/INTEGRATIONS.md`;
   - `docs/SECURITY_AND_PRIVACY.md`;
   - `docs/MIGRATION_PLAN.md`;
   - `docs/OPERATIONS_RUNBOOK.md`;
   - `docs/TEST_REPORT.md`.
6. Antes de cada fase, descreva o objetivo e os arquivos que serão afetados.
7. Ao terminar cada fase, execute lint, typecheck, testes e build. Corrija erros antes de avançar.
8. Faça commits pequenos e coerentes, com mensagens profissionais e sem credenciais.
9. Nunca grave chaves, senhas, tokens, IDs secretos, URLs privadas ou dados pessoais no Git.
10. Integrações que dependem de credenciais externas devem ser implementadas por **interfaces/adapters**, com mock local, health check e documentação. Não declare uma integração como operacional se não houve teste real.
11. Não deixe `TODO`, telas vazias, botões sem ação ou dados mockados ocultos nos fluxos principais de produção. Mocks devem ser explícitos e limitados ao ambiente de desenvolvimento/demo.
12. Não interrompa o trabalho por dúvidas menores. Registre a premissa adotada em `docs/ASSUMPTIONS.md` e avance. Pare apenas diante de uma ação destrutiva, conflito de segurança ou dependência realmente incontornável.

---

## 4. PROTÓTIPO VISUAL COMO FONTE DE VERDADE

Use `selecon-portal-v2.html` como referência de arquitetura da informação, hierarquia, componentes, identidade e comportamento. Ele contém 16 telas navegáveis:

### Portal público

1. Home institucional;
2. Catálogo de concursos;
3. Página do edital;
4. Área do candidato;
5. Central de atendimento;
6. Canal de denúncias;
7. Formulário de nova denúncia;
8. Institucional e comercial.

### Administração

9. Command Center;
10. Gestão de concursos;
11. Editor de concurso;
12. Atendimento omnichannel;
13. Gestão de denúncias;
14. Anúncios e campanhas;
15. Usuários e permissões;
16. Auditoria e segurança.

O protótipo não substitui regras de negócio, testes, segurança ou arquitetura. Use-o como **baseline visual e funcional**, aprimorando detalhes sem descaracterizar o conceito aprovado.

---

## 5. DIREÇÃO DE DESIGN E EXPERIÊNCIA

### 5.1 Personalidade visual

A interface deve transmitir:

- instituição pública e confiável;
- seriedade sem parecer antiga;
- clareza para candidatos de diferentes níveis de familiaridade digital;
- robustez operacional;
- segurança e privacidade;
- identidade Selecon, com uso equilibrado de azul, azul-marinho, branco, ciano e vermelho institucional.

Evite:

- excesso de gradientes decorativos;
- páginas públicas escuras;
- visual de startup genérica;
- excesso de animações;
- banners que pareçam comunicados oficiais;
- cards demais sem hierarquia;
- interfaces “bonitas” sem conteúdo e ações reais.

### 5.2 Tokens iniciais

Use design tokens centralizados, sem espalhar cores hardcoded:

- Navy principal: `#071B3D`;
- Navy secundário: `#0B2D60`;
- Azul de ação: `#0B66D4`;
- Ciano de apoio: `#23B5E8`;
- Vermelho institucional/alerta: `#D52B3F`;
- Verde de sucesso: `#12805C`;
- Fundo claro: `#F3F7FB`;
- Superfície: `#FFFFFF`;
- Texto principal: `#14233D`;
- Texto secundário: `#61708A`;
- Borda: `#DCE6F2`.

Implemente tokens para cor, tipografia, espaçamento, raio, elevação, foco, movimento e breakpoints. Use fonte legível como Inter, Public Sans ou equivalente com fallback de sistema.

### 5.3 Responsividade

A aplicação deve funcionar de forma excelente em:

- 360 px e 390 px — celulares;
- 768 px — tablets;
- 1280 px, 1440 px e telas maiores — desktop;
- zoom de 200% sem perda de função;
- orientação retrato e paisagem.

Não apenas “empilhe cards”. Reorganize navegação, filtros, tabelas, painéis e ações para uso real em cada viewport.

### 5.4 Acessibilidade

Atenda **WCAG 2.2 nível AA**:

- HTML semântico;
- navegação integral por teclado;
- foco visível;
- skip links;
- contraste adequado;
- nomes acessíveis;
- mensagens de erro associadas aos campos;
- leitura por leitores de tela;
- suporte a redução de movimento;
- alvos de toque adequados;
- nenhuma informação transmitida apenas por cor;
- tabelas responsivas com alternativa legível;
- formulários com resumo de erros;
- compatibilidade com VLibras sem impedir o uso normal;
- conteúdo alternativo para documentos e imagens relevantes.

---

## 6. ARQUITETURA TÉCNICA RECOMENDADA

Use uma arquitetura TypeScript moderna, modular e sustentável. A sugestão base é:

```text
novo-site-selecon/
├─ apps/
│  ├─ web/                 # Next.js: portal público, candidato e administração
│  ├─ api/                 # NestJS/Fastify: API modular e OpenAPI
│  └─ worker/              # Jobs, filas, e-mail, WhatsApp, webhooks e importações
├─ packages/
│  ├─ ui/                  # Design system compartilhado
│  ├─ db/                  # Prisma, migrations, repositories e seeds
│  ├─ contracts/           # Schemas Zod, DTOs e tipos de eventos
│  ├─ auth/                # Políticas, sessões e autorização
│  ├─ integrations/        # Graph, WhatsApp, candidato, storage, notificações
│  ├─ observability/       # Logs, métricas, traces e correlação
│  └─ config/              # ESLint, TSConfig, env validation
├─ infra/                  # Terraform ou AWS CDK
├─ docs/
├─ .github/workflows/
├─ docker-compose.yml
└─ pnpm-workspace.yaml
```

### 6.1 Stack

- Node.js em versão LTS suportada;
- TypeScript com `strict: true`;
- `pnpm` e Turborepo ou solução equivalente;
- Next.js com App Router, Server Components quando adequados e route groups claros;
- NestJS com Fastify para API ou estrutura modular equivalente;
- REST com OpenAPI como contrato principal;
- PostgreSQL;
- Prisma ORM com migrations revisáveis;
- Redis para cache, rate limit, sessões e filas;
- BullMQ ou SQS para processamento assíncrono;
- armazenamento de objetos compatível com S3;
- Zod para validação na borda e contratos compartilhados;
- Tailwind CSS com componentes acessíveis Radix/shadcn ou design system próprio;
- React Hook Form para formulários complexos;
- OpenTelemetry para traces, métricas e correlação;
- logs estruturados JSON, sem dados sensíveis.

A stack pode ser ajustada apenas com justificativa em ADR. Não use uma tecnologia apenas porque é nova; priorize suporte, segurança, operação e domínio do time.

### 6.2 Separação de domínios

Use módulos com fronteiras claras:

- Identity & Access;
- Public Content/CMS;
- Contests;
- Candidate Gateway;
- Customer Service;
- Knowledge Base;
- Notifications;
- Integrity/Whistleblowing;
- Advertising;
- Analytics;
- Audit;
- Integrations;
- System Administration.

O módulo de denúncias deve ter schema, policies, storage prefix/bucket, chaves e trilha de acesso separados sempre que possível. Não exponha entidades desse domínio em APIs, buscas ou logs gerais.

### 6.3 Padrões obrigatórios

- arquitetura hexagonal ou clean architecture pragmática;
- controllers finos, services de aplicação e repositories;
- eventos de domínio e transactional outbox para integrações críticas;
- idempotência para webhooks e comandos externos;
- circuit breaker, retry com backoff e dead-letter queue;
- feature flags para migração e liberação gradual;
- health checks de liveness, readiness e dependências;
- correlation ID de ponta a ponta;
- paginação cursor-based em grandes conjuntos;
- soft delete apenas quando necessário e sempre com auditoria;
- datas em UTC no banco e apresentação no fuso configurado;
- estados de domínio modelados, não strings soltas.

---

## 7. INFRAESTRUTURA AWS DE REFERÊNCIA

Prepare infraestrutura como código para uma implantação robusta na AWS, preferencialmente na região definida pelo Instituto. Arquitetura sugerida:

- Route 53 e/ou DNS atual;
- CloudFront;
- AWS WAF;
- S3 para assets públicos e arquivos privados segregados;
- ECS Fargate para `web`, `api` e `worker`, ou solução equivalente justificada;
- Application Load Balancer;
- RDS PostgreSQL Multi-AZ em produção;
- ElastiCache Redis;
- SQS e DLQs para integrações e jobs;
- SES ou Microsoft Graph para saída de e-mail, conforme decisão;
- Secrets Manager e Parameter Store;
- KMS com chaves separadas para dados sensíveis;
- CloudWatch Logs, Metrics, Alarms e dashboards;
- OpenTelemetry Collector;
- AWS Backup, snapshots e point-in-time recovery;
- ECR com scan de imagens;
- IAM de menor privilégio;
- ambientes `dev`, `hml` e `prd` isolados por conta ou, no mínimo, por stacks e políticas.

A infraestrutura deve permitir:

- zero-downtime deployment quando possível;
- rollback rápido;
- migrations controladas;
- autoscaling;
- backups e restauração testados;
- alarmes de disponibilidade, erro, latência, fila, banco, armazenamento e integrações;
- custo rastreável por tags `Projeto`, `Ambiente`, `Sistema`, `Responsavel` e `CentroCusto`.

Crie `infra/README.md`, variáveis por ambiente e diagramas Mermaid/C4. Não provisione recursos reais sem autorização explícita.

---

## 8. MODELO DE DADOS MÍNIMO

Modele entidades com IDs imutáveis, timestamps, usuário responsável e metadados de auditoria. O modelo pode evoluir, mas deve cobrir:

### 8.1 Identidade e acesso

- `User`;
- `IdentityProviderAccount`;
- `Role`;
- `Permission`;
- `RolePermission`;
- `UserRole`;
- `ScopeAssignment`;
- `AccessReview`;
- `PrivilegedAccessGrant`;
- `Session`;
- `LoginEvent`.

### 8.2 Conteúdo institucional

- `ContentPage`;
- `ContentRevision`;
- `NewsPost`;
- `Category`;
- `MediaAsset`;
- `Menu` e `MenuItem`;
- `Redirect`;
- `SeoMetadata`;
- `Partner`;
- `Testimonial`;
- `InstitutionalContact`.

### 8.3 Concursos

- `Contest`;
- `ContestOrganization`;
- `ContestStatus`;
- `ContestStage`;
- `ContestMilestone`;
- `ContestPosition`;
- `ContestLocation`;
- `ContestDocument`;
- `DocumentVersion`;
- `ContestAnnouncement`;
- `ContestFaq`;
- `ContestServiceLink`;
- `CandidateProviderConfig`;
- `ContestSubscription`;
- `ContestPublicationApproval`.

Documentos devem ter checksum, MIME real, tamanho, status de antivírus, versão, autor, aprovador, data de publicação, substituição e URL protegida ou pública conforme classificação.

### 8.4 Atendimento omnichannel

- `Contact`;
- `Ticket`;
- `Conversation`;
- `Message`;
- `Channel`;
- `Queue`;
- `Assignment`;
- `TicketStatus`;
- `Priority`;
- `SlaPolicy`;
- `SlaEvent`;
- `InternalNote`;
- `Attachment`;
- `Tag`;
- `ContactReason`;
- `KnowledgeArticle`;
- `KnowledgeRevision`;
- `ResponseTemplate`;
- `AutomationRule`;
- `SatisfactionSurvey`;
- `IntegrationDelivery`.

### 8.5 Canal de denúncias

Use um schema/domínio separado:

- `WhistleblowingCase`;
- `WhistleblowingCredential`;
- `WhistleblowingCategory`;
- `WhistleblowingParty`;
- `WhistleblowingMessage`;
- `WhistleblowingEvidence`;
- `WhistleblowingAssignment`;
- `WhistleblowingStatusHistory`;
- `WhistleblowingDecision`;
- `WhistleblowingAccessEvent`;
- `WhistleblowingRetentionPolicy`.

Nunca armazene código de acesso em texto puro. Use hash forte e comparação segura. Protocolo e código devem ter entropia adequada, limitação de tentativas e proteção contra enumeração.

### 8.6 Anúncios

- `Advertiser`;
- `AdvertisingContract`;
- `Campaign`;
- `Creative`;
- `Placement`;
- `CampaignPlacement`;
- `CampaignSchedule`;
- `CampaignApproval`;
- `ImpressionAggregate`;
- `ClickAggregate`;
- `FrequencyCap`;
- `BillingRecord`;
- `BrandSafetyRule`.

### 8.7 Governança e operação

- `AuditEvent`;
- `IntegrationEvent`;
- `OutboxEvent`;
- `BackgroundJob`;
- `FeatureFlag`;
- `SystemSetting`;
- `DataRetentionExecution`;
- `DataSubjectRequest`;
- `Incident`.

---

## 9. PORTAL PÚBLICO — ESPECIFICAÇÃO FUNCIONAL

### 9.1 Cabeçalho e navegação

O cabeçalho deve ter:

- logotipo oficial;
- Concursos;
- O Instituto;
- Atendimento;
- Integridade;
- Notícias;
- Área do candidato;
- Fale Conosco;
- atalhos de acessibilidade, privacidade e transparência;
- menu mobile acessível, com foco preso corretamente e fechamento por `Esc`.

O menu deve ser orientado por tarefa. Evite menus enormes com terminologia interna.

### 9.2 Home

A home deve conter, nessa ordem lógica:

1. Hero institucional com mensagem clara e busca de concursos;
2. Atalhos principais:
   - encontrar concurso;
   - área do candidato;
   - canal de denúncias;
   - atendimento;
3. concursos em destaque;
4. publicações recentes;
5. explicação simples da jornada do candidato;
6. bloco institucional e capacidade operacional;
7. campanhas patrocinadas identificadas;
8. notícias e comunicados;
9. parceiros/depoimentos aprovados;
10. rodapé completo.

A busca deve aceitar órgão, cargo, cidade, estado, número do edital e palavras-chave. Implemente autocomplete acessível, tolerância a acentos e sinônimos básicos.

### 9.3 Catálogo de concursos

Filtros mínimos:

- situação;
- estado e município;
- órgão;
- escolaridade;
- área de atuação;
- período;
- modalidade;
- inscrições abertas;
- encerrados;
- ordenação por relevância, abertura e atualização.

Cada card deve exibir:

- órgão;
- título;
- situação;
- descrição curta;
- vagas;
- escolaridade;
- prazo principal;
- CTA claro.

Os filtros devem persistir na URL, permitir compartilhamento e não quebrar o botão voltar do navegador. Implemente paginação ou carregamento progressivo acessível.

### 9.4 Página do edital — elemento central do produto

Cada concurso deve ter uma página própria, estável e indexável, com:

- título, órgão, número do edital e situação;
- período de inscrições;
- vagas, taxa e data de prova;
- CTA para inscrição;
- CTA para 2ª via, local de prova, recurso e resultado quando disponíveis;
- cronograma visual e tabular;
- cargos e requisitos;
- editais, anexos, retificações e comunicados;
- histórico de versões;
- perguntas frequentes vinculadas;
- alertas por e-mail/WhatsApp mediante consentimento;
- contato já contextualizado ao concurso;
- metadados SEO, Open Graph e dados estruturados;
- versão HTML acessível ou resumo dos documentos essenciais;
- indicação explícita do documento vigente.

Regras críticas:

- o documento oficial não pode ser substituído silenciosamente;
- uma retificação cria nova versão e preserva a anterior;
- autor e aprovador devem ser pessoas diferentes para publicações críticas;
- publicações podem ser agendadas;
- links externos precisam de validação e health check;
- anúncios nunca podem interromper cronograma ou lista de documentos.

### 9.5 Área do candidato

Implemente uma camada de experiência e um `CandidateProviderAdapter`.

No primeiro ciclo, a área pode encaminhar ou integrar o sistema existente, mas deve oferecer uma experiência consistente para:

- login/cadastro;
- inscrições;
- situação do pagamento;
- 2ª via de boleto ou meio de pagamento;
- comprovante;
- cartão e local de prova;
- envio e consulta de recursos;
- resultados individuais;
- documentos e notificações.

Não invente APIs inexistentes. Quando o provedor atual não oferecer integração, use deep links assinados ou redirecionamento explícito, registre a limitação e deixe a interface pronta para uma futura API/SSO.

### 9.6 Central de atendimento e Fale Conosco

O formulário público deve gerar ticket e protocolo. Campos mínimos:

- nome;
- e-mail;
- telefone opcional;
- CPF somente quando realmente necessário e com base legal;
- concurso relacionado;
- assunto/motivo;
- canal preferido;
- descrição;
- anexos;
- aceite/ciência de privacidade.

Antes de enviar, sugira artigos oficiais da base de conhecimento sem impedir o usuário de abrir o atendimento.

A consulta de protocolo deve permitir acompanhar status e mensagens sem expor dados de terceiros.

### 9.7 Canal de denúncias público

A página inicial deve explicar:

- finalidade do canal;
- exemplos do que pode ser relatado;
- o que deve ir para atendimento comum;
- possibilidade de anonimato;
- funcionamento do protocolo e código;
- política de sigilo;
- prazo e forma de acompanhamento;
- limites do canal;
- orientação para emergências.

O formulário deve ser em etapas:

1. identificação opcional;
2. categoria e relação com o Instituto;
3. descrição estruturada;
4. pessoas, local, data e contexto;
5. anexos;
6. revisão;
7. confirmação e geração de credenciais.

Após o envio:

- mostrar protocolo e código de acesso;
- permitir copiar separadamente;
- permitir baixar comprovante em PDF;
- avisar que o código não pode ser recuperado;
- não enviar o código por e-mail em texto aberto;
- permitir consulta, mensagens e complementos protegidos.

### 9.8 Institucional e comercial

Páginas mínimas:

- Quem somos;
- História;
- Governança;
- Estrutura;
- Serviços;
- Concursos públicos;
- Processos seletivos;
- Capacitações;
- Tecnologia e segurança;
- Transparência;
- Integridade;
- Notícias;
- Imprensa;
- Trabalhe conosco;
- Contato comercial.

O formulário comercial deve entrar em uma fila separada de atendimento e permitir classificação por tipo de projeto.

### 9.9 Notícias e conteúdo

Implemente CMS com:

- rascunho, revisão, aprovação e agendamento;
- editor estruturado, não HTML livre inseguro;
- blocos de conteúdo validados;
- imagens com alt text obrigatório;
- categorias e tags;
- autor e revisor;
- histórico de versões;
- preview;
- SEO;
- redirects;
- expiração de conteúdo temporal;
- publicação e despublicação auditadas.

---

## 10. ÁREA ADMINISTRATIVA — ESPECIFICAÇÃO

### 10.1 Command Center

Dashboard com cards e alertas acionáveis:

- concursos ativos, inscrições abertas, rascunhos e publicações pendentes;
- acessos e buscas do portal;
- atendimento por status, SLA, canal, concurso e responsável;
- denúncias por etapa, sem expor conteúdo sensível no dashboard geral;
- campanhas ativas e entrega;
- integrações e health checks;
- filas, erros, latência e disponibilidade;
- pendências de aprovação;
- acessos temporários e revisões;
- backups e segurança.

Todo card deve abrir a fila filtrada correspondente.

### 10.2 Gestão de concursos

Permitir:

- criar, duplicar, editar, arquivar e consultar;
- fluxo de rascunho/revisão/aprovação/publicação;
- cronograma;
- cargos e vagas;
- documentos e versionamento;
- comunicados;
- FAQ;
- links do candidato;
- SEO;
- assinatura de alertas;
- preview público;
- publicação programada;
- diff entre versões;
- exportação de histórico;
- auditoria completa.

### 10.3 Atendimento omnichannel

Interface operacional com:

- cards de Novo, Em atendimento, Respondido, Encerrado, Atrasado;
- filas e filtros;
- busca por contato, protocolo, assunto e concurso;
- origem e status de canal;
- SLA visual: dentro do prazo, atenção e atrasado;
- atribuição e bloqueio por atendente;
- supervisor pode liberar ou assumir com justificativa;
- painel de conversa;
- histórico do contato;
- contexto do candidato via adapter;
- notas internas;
- anexos;
- classificação obrigatória;
- respostas sugeridas pela base;
- templates aprovados;
- assinatura automática;
- transferência de fila;
- escalonamento;
- fechamento e reabertura auditados;
- pesquisa de satisfação;
- relatórios e fechamento diário.

Regra: uma sugestão de IA ou base de conhecimento **nunca deve ser enviada automaticamente** sem política explícita e revisão humana nos casos que exigem decisão.

### 10.4 Gestão da base de conhecimento

Campos e funções:

- título;
- conteúdo estruturado;
- palavras-chave e sinônimos;
- concurso e motivo relacionados;
- fonte oficial;
- validade;
- autor e aprovador;
- status;
- revisão periódica;
- métricas de uso e eficácia;
- transformação de boa resposta em modelo, com remoção de dados pessoais;
- alerta de conteúdo vencido após alteração de edital.

### 10.5 Gestão de denúncias

Somente perfis autorizados devem visualizar este módulo. Implementar:

- fila por status;
- triagem;
- prioridade e risco;
- atribuição;
- restrição por caso, quando necessário;
- mensagens protegidas;
- anexos e cadeia de custódia;
- notas internas;
- pedido de complemento;
- plano de análise;
- decisão e revisão;
- conclusão;
- relatórios agregados;
- acesso com justificativa;
- marca d’água e log em exportações;
- políticas de retenção;
- trilha de acesso específica.

Não exiba títulos ou detalhes de denúncias em notificações abertas, e-mails comuns, logs gerais, widgets ou pesquisas globais.

### 10.6 Anúncios e campanhas

Implementar governança, não apenas upload de banner:

- cadastro de anunciante;
- contrato e período;
- inventário de posições;
- formatos desktop/mobile;
- criativos;
- URL de destino validada;
- revisão comercial;
- aprovação de compliance;
- agendamento;
- pausa de emergência;
- frequência máxima;
- metas de impressão;
- métricas agregadas;
- relatório;
- faturamento/controle contratual;
- lista de bloqueio de categorias e URLs;
- auditoria.

Regras:

- identificar sempre como “Publicidade” ou “Conteúdo patrocinado”;
- não imitar botão de inscrição, resultado, edital ou comunicado;
- não usar pop-up intrusivo;
- não impedir acesso aos serviços;
- não inserir anúncio dentro do canal de denúncias;
- não segmentar com dados sensíveis, denúncias ou conteúdo de atendimento;
- usar preferencialmente segmentação contextual e métricas first-party;
- respeitar consentimento e política de cookies;
- não permitir scripts arbitrários de terceiros sem aprovação técnica e CSP.

### 10.7 Usuários, RBAC e ABAC

Perfis iniciais:

- `PORTAL_ADMIN`;
- `CONTENT_ADMIN`;
- `CONTENT_EDITOR`;
- `CONTENT_REVIEWER`;
- `CONTEST_ADMIN`;
- `CONTEST_EDITOR`;
- `SERVICE_ADMIN`;
- `SERVICE_SUPERVISOR`;
- `SERVICE_AGENT`;
- `INTEGRITY_ADMIN`;
- `INTEGRITY_ANALYST`;
- `INTEGRITY_AUDITOR`;
- `ADVERTISING_ADMIN`;
- `ADVERTISING_REVIEWER`;
- `SECURITY_ADMIN`;
- `AUDITOR`;
- `READ_ONLY`.

Permissões devem considerar também escopo: concurso, fila, unidade, módulo e tempo de validade.

Implementar:

- SSO para equipe interna;
- MFA obrigatório para acesso privilegiado;
- convite e ativação;
- menor privilégio;
- expiração de acesso temporário;
- revisão periódica;
- bloqueio e revogação de sessões;
- preservação do histórico após desativação;
- separação de funções, especialmente autor/aprovador;
- break-glass controlado e auditado.

### 10.8 Auditoria

Registre, no mínimo:

- ator, perfil e escopo;
- ação;
- recurso;
- antes/depois com mascaramento;
- data/hora UTC;
- origem;
- correlation ID;
- resultado;
- risco;
- justificativa quando aplicável;
- IP apenas quando necessário e permitido pela política;
- user agent de forma minimizada;
- exportações;
- acessos a denúncias;
- alterações de permissão;
- publicação de documentos;
- respostas enviadas;
- uso de templates/IA;
- falhas de integração.

A trilha não pode ser editada pela interface comum. Defina retenção, proteção e exportação assinada.

---

## 11. INTEGRAÇÕES

### 11.1 Microsoft Graph — e-mail

Crie `EmailProvider` e implementação Microsoft Graph para:

- caixa compartilhada ou endereço institucional;
- leitura incremental por delta/subscription;
- threading;
- anexos;
- envio e resposta;
- status de entrega quando disponível;
- idempotência;
- retry e DLQ;
- reconciliação periódica;
- health check;
- mapeamento de mensagem para ticket.

Não dependa de polling agressivo. Não salve tokens em banco sem criptografia. Documente permissões mínimas e procedimento de consentimento administrativo.

### 11.2 WhatsApp Cloud API

Crie `MessagingProvider` e implementação WhatsApp Cloud API com:

- validação de webhook;
- verificação de assinatura;
- idempotência por event/message ID;
- mensagens de entrada;
- estados enviado, entregue, lido e falhou;
- templates aprovados;
- janela de atendimento;
- opt-in e opt-out;
- anexos;
- retry e DLQ;
- mapeamento para contato/ticket;
- transferência para humano;
- health check e métricas.

### 11.3 Chat web e chatbot

O chat deve:

- iniciar com triagem simples;
- identificar concurso e assunto;
- consultar somente base aprovada;
- mostrar fontes ou links usados;
- informar quando não tem certeza;
- encaminhar para humano com contexto;
- manter protocolo único;
- respeitar horário, fila e SLA;
- permitir consentimento para continuar por WhatsApp/e-mail.

Para IA/RAG:

- abstraia o provedor;
- indexe apenas conteúdo aprovado e vigente;
- filtre por concurso, idioma, validade e permissão;
- não treine nem envie dados pessoais a provedores sem base contratual;
- remova/mascare dados sensíveis;
- configure limiar de confiança;
- proíba respostas inventadas;
- proíba acesso ao domínio de denúncias;
- registre versão da base, prompt, modelo e decisão de handoff sem registrar conteúdo sensível desnecessário;
- implemente avaliação offline com conjunto de perguntas reais anonimizadas.

### 11.4 Sistema do candidato

Defina interface:

```ts
interface CandidateProvider {
  healthCheck(): Promise<HealthStatus>;
  getSignInUrl(context?: CandidateContext): Promise<string>;
  getRegistrationUrl(contestId: string): Promise<string>;
  getRegistrationSummary(candidateRef: string, contestId: string): Promise<RegistrationSummary>;
  getPaymentStatus(candidateRef: string, contestId: string): Promise<PaymentStatus>;
  getExamCardUrl(candidateRef: string, contestId: string): Promise<string | null>;
  getAppeals(candidateRef: string, contestId: string): Promise<AppealSummary[]>;
  getResults(candidateRef: string, contestId: string): Promise<ResultSummary[]>;
}
```

Ajuste ao contrato real. Implemente mock local e adapter de link externo enquanto a API não existir.

### 11.5 Armazenamento e antivírus

Todo upload deve passar por:

1. URL assinada de upload;
2. bucket/quarentena;
3. validação de tamanho e MIME real;
4. antivírus/malware scan;
5. sanitização quando aplicável;
6. classificação pública/privada/restrita;
7. movimentação para storage final;
8. geração de checksum e metadados;
9. log de cadeia de custódia;
10. download por URL assinada curta para arquivos privados.

Nunca renderize HTML/SVG ou arquivo ativo enviado por usuário diretamente no navegador.

---

## 12. SEGURANÇA, PRIVACIDADE E LGPD

Use OWASP ASVS nível 2 como baseline e produza threat model para os fluxos críticos.

### 12.1 Controles obrigatórios

- autenticação OIDC/OAuth2 para equipe;
- MFA para privilegiados;
- sessões seguras, curtas e revogáveis;
- cookies `HttpOnly`, `Secure`, `SameSite` adequados;
- CSRF onde aplicável;
- proteção contra XSS, SQL injection, SSRF, IDOR e path traversal;
- CSP estrita e sem `unsafe-eval`;
- HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`;
- rate limit por rota, identidade e risco;
- proteção contra enumeração de protocolo, CPF, e-mail e usuário;
- CAPTCHA acessível apenas por análise de risco, não como barreira universal;
- validação de redirect URLs;
- criptografia em trânsito e repouso;
- secrets management;
- dependências e imagens escaneadas;
- SAST, SCA e secret scanning no CI;
- logs sem senha, token, código de denúncia, corpo sensível ou documento;
- mascaramento de PII na interface e exportação;
- backups criptografados;
- teste de restauração;
- WAF e proteção contra bots/abuso;
- resposta padronizada sem vazar existência de conta ou caso.

### 12.2 LGPD e privacy by design

Documente:

- inventário de dados;
- finalidade e base legal por fluxo;
- responsáveis e operadores;
- minimização;
- consentimentos quando necessários;
- política de cookies;
- retenção por entidade;
- descarte seguro;
- atendimento a titulares;
- correção e portabilidade quando aplicável;
- registro de tratamento;
- processo de incidente;
- contratos com operadores;
- transferência internacional, se existir.

### 12.3 Proteção específica do canal de denúncias

- isole schema, storage, chaves e permissões;
- não use analytics de marketing no canal;
- não carregue pixels ou scripts publicitários;
- não registre IP/identificadores além do estritamente necessário à segurança e à política aprovada;
- se houver registro técnico inevitável, minimize, proteja, retenha por prazo curto e informe no documento de privacidade;
- gere protocolo e código com CSPRNG;
- armazene apenas hash do código;
- compare em tempo constante;
- limite tentativas e implemente cooldown;
- não ofereça recuperação do código anônimo;
- use mensagens neutras em erros;
- exija justificativa para acesso interno;
- registre `CASE_ACCESSED`;
- permita restrição por caso;
- proteja exportações com marca d’água, expiração e auditoria;
- remova metadados desnecessários de arquivos, quando juridicamente permitido;
- preserve cadeia de custódia quando evidência exigir integridade.

---

## 13. SEO, DESEMPENHO E CONFIABILIDADE

### 13.1 SEO

Implementar:

- metadata por página;
- canonical;
- Open Graph;
- sitemap segmentado;
- robots;
- breadcrumbs;
- dados estruturados adequados;
- URLs legíveis e estáveis;
- redirects 301;
- página 404 útil;
- prevenção de indexação em rascunhos, admin, candidato, tickets e denúncias;
- monitoramento de links quebrados;
- preservação de URLs relevantes do WordPress.

### 13.2 Metas de desempenho

No percentil 75, em dispositivos móveis reais:

- LCP ≤ 2,5 s;
- INP ≤ 200 ms;
- CLS ≤ 0,1;
- TTFB saudável para páginas cacheáveis;
- JavaScript inicial minimizado;
- imagens responsivas e otimizadas;
- cache de página e CDN sem cachear dados privados;
- paginação e virtualização em listas grandes.

Metas de Lighthouse em páginas públicas representativas:

- Performance ≥ 90;
- Acessibilidade ≥ 95;
- Boas práticas ≥ 95;
- SEO ≥ 95.

### 13.3 Disponibilidade e resiliência

- SLOs definidos;
- dashboards e alertas;
- graceful degradation de integrações;
- fila de reprocessamento;
- página de status interna;
- timeout e circuit breaker;
- idempotência;
- testes de falha;
- runbooks;
- RTO e RPO documentados;
- plano de contingência para inscrições e publicações críticas.

---

## 14. MIGRAÇÃO DOS SISTEMAS ATUAIS

A migração deve seguir abordagem gradual, mensurável e reversível. Não desligue os portais atuais antes de validar paridade funcional, dados, SEO e operação.

### 14.1 Inventário

Crie um crawler/importador controlado para mapear:

- páginas e posts;
- concursos ativos e encerrados;
- categorias;
- mídia;
- documentos;
- menus;
- formulários;
- URLs e slugs;
- títulos e metadados SEO;
- links internos e externos;
- redirects atuais;
- scripts e integrações;
- conteúdos duplicados ou vencidos.

Gere `docs/migration/content-inventory.csv` e relatório de qualidade.

### 14.2 WordPress

Preferir API/export oficial e acesso autorizado. Fluxo:

1. exportar conteúdo e mídia;
2. normalizar encoding, HTML e links;
3. sanitizar conteúdo;
4. mapear para o novo modelo;
5. importar em staging;
6. validar amostra e contagem total;
7. preservar datas e autores quando possível;
8. criar mapa de redirects 301;
9. executar link checker;
10. comparar SEO e sitemap;
11. congelar conteúdo antes do corte;
12. executar delta final;
13. cortar DNS/roteamento;
14. monitorar erros e permitir rollback.

### 14.3 Atendimento existente

Antes de migrar:

- documente schema e regras atuais;
- faça backup verificável;
- mapeie usuários, tickets, mensagens, anexos, status, motivos, base de conhecimento e auditoria;
- preserve IDs legados em campo próprio;
- anonimizar dados em ambiente não produtivo;
- rode importação idempotente;
- valide contagens, checksums e amostras;
- faça parallel run de entrada de e-mail/WhatsApp;
- impeça mensagens duplicadas;
- teste rollback.

Caso o sistema atual continue operando temporariamente, implemente integração por API ou sincronização unidirecional documentada. Evite escrita em dois sistemas sem estratégia de consistência.

### 14.4 Canal de denúncias existente

Este é o fluxo mais sensível. Antes de qualquer migração:

- obter autorização formal;
- realizar backup criptografado;
- restringir acesso ao pacote de migração;
- documentar cadeia de custódia;
- mapear protocolo, hash de código, status, mensagens, anexos, usuários e auditoria;
- validar compatibilidade do método de autenticação;
- não reemitir códigos nem enfraquecer hashes;
- preservar casos existentes;
- executar ensaio em ambiente isolado com dados anonimizados;
- registrar cada etapa;
- validar com a área de integridade/jurídico;
- definir rollback;
- apagar artefatos temporários com segurança após aceite.

### 14.5 Estratégia de cutover

Use feature flags e roteamento por domínio/caminho. Sugestão:

1. novo portal em ambiente de homologação;
2. conteúdo institucional em paralelo;
3. catálogo e páginas de edital;
4. redirecionamento gradual de navegação;
5. atendimento em modo piloto por fila/canal;
6. denúncias somente após homologação de segurança;
7. migração final e redirects;
8. janela de observação;
9. desligamento controlado dos legados;
10. retenção de backup e plano de recuperação.

---

## 15. TESTES E QUALIDADE

### 15.1 Pirâmide de testes

Implemente:

- unitários para regras de domínio;
- integração para repositories, filas e adapters;
- contrato para API e webhooks;
- componentes com Testing Library;
- E2E com Playwright;
- acessibilidade automatizada com axe;
- regressão visual das telas principais;
- carga com k6;
- segurança automatizada;
- migração com testes de contagem e integridade;
- restore drill documentado.

### 15.2 Fluxos E2E obrigatórios

1. Usuário encontra concurso, abre edital e acessa inscrição;
2. Usuário filtra catálogo e compartilha URL;
3. Editor cria concurso, envia para revisão e outro usuário publica;
4. Retificação cria nova versão sem apagar anterior;
5. Candidato abre atendimento e recebe protocolo;
6. E-mail recebido cria ticket idempotente;
7. WhatsApp recebido entra na fila e preserva status;
8. Atendente assume, classifica, responde e encerra;
9. Supervisor libera ou assume com justificativa;
10. Artigo de conhecimento vencido deixa de ser sugerido;
11. Denúncia anônima gera protocolo/código e pode ser consultada;
12. Tentativas inválidas no canal são limitadas sem revelar existência;
13. Analista de integridade acessa caso e gera log específico;
14. Usuário sem permissão recebe 403 e o evento é registrado;
15. Campanha só ativa após aprovação;
16. Anúncio nunca aparece no canal de denúncias;
17. Usuário revoga consentimento de marketing;
18. Backup/restauração de amostra é validado;
19. Falha de Graph/WhatsApp vai para retry/DLQ e é reprocessada;
20. Deploy executa migrations seguras e health checks.

### 15.3 Metas de cobertura

- mínimo de 80% em regras de domínio e serviços críticos;
- mínimo de 90% em autenticação, autorização, geração/verificação de códigos, políticas de denúncia e versionamento de documentos;
- cobertura não substitui qualidade: inclua casos negativos e abuso.

### 15.4 Dados de teste

Crie seeds seguros e claramente fictícios:

- concursos em diferentes fases;
- documentos versionados;
- usuários por perfil;
- tickets por canal/SLA;
- artigos de conhecimento;
- campanhas;
- denúncias totalmente fictícias e sem semelhança com pessoas reais;
- eventos de auditoria.

Nunca copie dados reais para o repositório.

---

## 16. CI/CD E SUPPLY CHAIN

Crie GitHub Actions com OIDC para a AWS, sem chaves estáticas, contendo:

### Pull request

- install com lockfile imutável;
- lint;
- format check;
- typecheck;
- unit/integration tests;
- build;
- OpenAPI compatibility check;
- migrations validation;
- axe e E2E representativos;
- secret scan;
- dependency scan;
- SAST;
- container build e image scan;
- relatório de tamanho do bundle;
- preview quando disponível.

### Main / release

- imagem versionada pelo SHA;
- assinatura/proveniência quando suportado;
- deploy em homologação;
- smoke tests;
- aprovação manual para produção;
- backup/verificação pré-migration;
- migration job separado;
- deploy progressivo;
- health checks;
- rollback automático em falha;
- changelog e release notes.

Defina Dependabot/Renovate com política de atualização e testes.

---

## 17. FASES DE IMPLEMENTAÇÃO

Trabalhe em fases. Cada fase deve produzir código utilizável, documentação e commit(s) coerentes.

### Fase 0 — Descoberta e fundação

- auditar repositório;
- registrar premissas;
- criar ADRs;
- definir monorepo e padrões;
- instalar lint, format, typecheck e testes;
- validar variáveis de ambiente;
- criar Docker Compose local;
- estruturar CI inicial;
- importar o protótipo para `docs/prototype/` ou local equivalente.

**Saída:** projeto executando localmente, documentação base e pipeline verde.

### Fase 1 — Design system e shell

- tokens;
- componentes acessíveis;
- layout público;
- layout administrativo;
- navegação responsiva;
- autenticação de desenvolvimento;
- RBAC inicial;
- Storybook ou catálogo de componentes;
- regressão visual.

**Saída:** shells e componentes equivalentes ao protótipo, sem duplicação de estilos.

### Fase 2 — CMS e portal institucional

- páginas;
- notícias;
- mídia;
- menus;
- SEO;
- redirects;
- workflow editorial;
- home completa;
- institucional/comercial;
- importador inicial do WordPress.

**Saída:** portal público gerenciável e indexável.

### Fase 3 — Concursos e página do edital

- modelo de concurso;
- catálogo/filtros;
- editor;
- cronograma;
- cargos;
- documentos versionados;
- comunicados;
- FAQ;
- aprovação e agendamento;
- alertas;
- página pública;
- audit trail.

**Saída:** ciclo completo de criação a publicação.

### Fase 4 — Área do candidato e adapters

- interface do provedor;
- mock local;
- configuração por concurso;
- deep link/SSO quando disponível;
- login shell;
- serviços e health checks;
- telemetria sem expor dados.

**Saída:** experiência unificada mesmo com provedor externo.

### Fase 5 — Atendimento omnichannel

- tickets, mensagens, filas, SLA e atribuição;
- portal público e consulta de protocolo;
- painel do atendente;
- supervisor;
- base de conhecimento;
- Graph adapter;
- WhatsApp adapter;
- chat web;
- chatbot/RAG seguro;
- relatórios;
- importador do atendimento atual.

**Saída:** operação de atendimento funcional de ponta a ponta.

### Fase 6 — Canal de denúncias

- domínio segregado;
- formulário público;
- protocolo e código;
- consulta protegida;
- mensagens e anexos;
- painel restrito;
- workflow;
- auditoria específica;
- relatórios agregados;
- políticas de retenção;
- importador controlado do sistema atual;
- threat model e testes de abuso.

**Saída:** canal homologável por segurança, integridade e jurídico.

### Fase 7 — Anúncios e governança comercial

- inventário;
- campanhas;
- criativos;
- aprovação;
- agendamento;
- métricas agregadas;
- regras de brand safety;
- relatórios;
- conteúdo patrocinado público.

**Saída:** monetização governada e claramente separada do conteúdo oficial.

### Fase 8 — Segurança, performance e operação

- hardening ASVS;
- WAF/rate limits;
- observabilidade;
- SLOs e alarmes;
- IaC;
- backups;
- restore drill;
- testes de carga;
- Lighthouse;
- acessibilidade manual;
- runbooks;
- planos de incidente e continuidade.

**Saída:** release candidate de produção.

### Fase 9 — Migração e go-live

- inventário final;
- importação delta;
- validação de negócio;
- redirects;
- ensaio de cutover;
- plano de rollback;
- treinamento;
- go-live;
- hypercare;
- relatório de encerramento.

**Saída:** portal em produção com legados desativados de forma controlada.

---

## 18. CRITÉRIOS DE ACEITE

### 18.1 Portal e conteúdo

- [ ] Home responsiva e fiel à direção visual;
- [ ] CMS sem necessidade de alterar código para conteúdo comum;
- [ ] menu, rodapé e páginas institucionais administráveis;
- [ ] SEO, sitemap, canonical e redirects funcionando;
- [ ] sem links quebrados críticos;
- [ ] páginas públicas sem erro de console;
- [ ] acessibilidade AA validada em amostra representativa.

### 18.2 Concursos

- [ ] CRUD com workflow editorial;
- [ ] catálogo com filtros persistidos na URL;
- [ ] página de edital completa;
- [ ] documentos versionados e verificáveis;
- [ ] retificação preserva histórico;
- [ ] cronograma e cargos administráveis;
- [ ] preview, agendamento e aprovação em duas etapas;
- [ ] links do candidato configuráveis por concurso;
- [ ] eventos auditados.

### 18.3 Atendimento

- [ ] formulário gera ticket e protocolo;
- [ ] e-mail, WhatsApp e web convergem na mesma fila;
- [ ] idempotência evita duplicidade;
- [ ] status, prioridade e SLA funcionam;
- [ ] atribuição/bloqueio por atendente;
- [ ] supervisor pode intervir com justificativa;
- [ ] base de conhecimento aprovada e versionada;
- [ ] histórico e notas internas preservados;
- [ ] chatbot encaminha para humano quando necessário;
- [ ] relatórios operacionais exportáveis com controle de acesso.

### 18.4 Denúncias

- [ ] anonimato real e identificação opcional;
- [ ] protocolo e código fortes;
- [ ] código armazenado somente como hash;
- [ ] consulta protegida e rate-limited;
- [ ] anexos seguros;
- [ ] domínio e dados segregados;
- [ ] acesso interno por perfil/escopo;
- [ ] cada acesso é auditado;
- [ ] mensagens e complementos funcionam;
- [ ] exportação restrita e rastreada;
- [ ] nenhum script publicitário/marketing carregado;
- [ ] testes de abuso e threat model aprovados.

### 18.5 Anúncios

- [ ] campanha requer aprovação;
- [ ] período e posição controlados;
- [ ] criativo mobile/desktop;
- [ ] identificação de publicidade sempre visível;
- [ ] frequência e meta de entrega;
- [ ] métricas agregadas e sem dados sensíveis;
- [ ] nenhuma campanha aparece em denúncias ou administração;
- [ ] pausa imediata disponível;
- [ ] auditoria completa.

### 18.6 Segurança e operação

- [ ] SSO e MFA para privilegiados;
- [ ] RBAC/ABAC com testes de autorização;
- [ ] segredos fora do código;
- [ ] CSP e headers seguros;
- [ ] WAF/rate limit;
- [ ] logs estruturados e sem dados sensíveis;
- [ ] backups e PITR;
- [ ] restauração testada;
- [ ] CI/CD com scans;
- [ ] dashboards e alertas;
- [ ] runbooks;
- [ ] deploy e rollback documentados;
- [ ] nenhum erro crítico/alto aberto antes da produção.

---

## 19. ENTREGÁVEIS OBRIGATÓRIOS

Ao final, o repositório deve conter:

1. Código completo das aplicações;
2. Design system reutilizável;
3. Migrations e seeds;
4. OpenAPI atualizado;
5. `.env.example` sem segredos;
6. Docker Compose para desenvolvimento;
7. scripts de setup, test, build e seed;
8. CI/CD;
9. infraestrutura como código;
10. diagramas C4/Mermaid;
11. documentação de arquitetura;
12. ADRs;
13. documentação das integrações;
14. modelo de permissões;
15. threat model;
16. documentação LGPD e retenção;
17. plano e ferramentas de migração;
18. runbook de operação;
19. runbook de incidentes;
20. procedimento de backup e restauração;
21. relatório de testes;
22. relatório de acessibilidade;
23. relatório de performance;
24. relatório de segurança;
25. manual básico de administração;
26. lista clara do que depende de credenciais ou decisões externas.

---

## 20. FORMATO DE ATUALIZAÇÃO DURANTE O TRABALHO

Em cada atualização, responda com:

1. **Classificação:** `READ_ONLY`, `IMPLEMENTING`, `BLOCKED` ou `VALIDATING`;
2. **Objetivo da etapa**;
3. **Arquivos alterados**;
4. **Decisões tomadas**;
5. **Comandos executados**;
6. **Testes e resultados**;
7. **Riscos ou pendências reais**;
8. **Próximo passo**.

Não use frases genéricas como “está tudo pronto” sem evidência. Informe resultados concretos de lint, typecheck, testes, build, migrations e smoke tests.

---

## 21. PRIMEIRA AÇÃO QUE VOCÊ DEVE EXECUTAR AGORA

1. Audite o repositório `novo-site-selecon` sem fazer alterações destrutivas.
2. Localize `selecon-portal-v2.html` e liste as 16 telas e componentes reutilizáveis.
3. Informe o estado atual do projeto, stack detectada, riscos e o que já pode ser preservado.
4. Crie `docs/IMPLEMENTATION_PLAN.md`, `docs/ARCHITECTURE.md`, `docs/ASSUMPTIONS.md` e os primeiros ADRs.
5. Proponha a estrutura final do monorepo e o plano de fases.
6. Inicie a Fase 0 e deixe o projeto executando localmente com pipeline básico verde.
7. Não pare apenas para pedir confirmação visual: o protótipo anexado é a referência aprovada. Registre dúvidas menores como premissas e avance.
8. Antes de qualquer integração real, migração de dados ou provisionamento AWS, apresente as permissões/credenciais necessárias e aguarde autorização específica.

**Comece agora pela auditoria do repositório e pela Fase 0.**
