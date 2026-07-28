---
inclusion: auto
---

# Arquitetura — Portal Selecon

## Princípios Arquiteturais

1. **Modularidade**: cada módulo SaaS é independente, pode evoluir sem impacto na plataforma
2. **Multi-tenant ready**: estrutura preparada para atender múltiplas instituições
3. **Event-driven**: comunicação entre módulos via eventos (BullMQ jobs)
4. **CQRS-light**: separação de leitura/escrita onde faz sentido (listas vs mutations)
5. **12-factor app**: config por env vars, stateless processes, backing services

## Schemas PostgreSQL (Domínios)

| Schema | Domínio | Responsabilidade |
|--------|---------|-----------------|
| identity | IAM | Usuários, roles, permissões, sessões, audit |
| content | CMS | Páginas, notícias, mídia, menus, SEO |
| contests | Concursos | Processos seletivos, editais, documentos |
| service | Atendimento | Tickets, filas, SLA, base de conhecimento |
| whistleblowing | Denúncias | Relatos, workflow, anonimato, LGPD |
| advertising | Publicidade | Espaços de anúncio, campanhas |
| governance | Governança | Auditoria, compliance, LGPD |

## Módulos SaaS (Roadmap)

### Fase 1 — Fundação (atual)
- Portal Institucional (homepage, páginas estáticas)
- Design System consolidado
- CMS básico
- Gestão de Concursos (listagem pública)

### Fase 2 — Serviços
- Atendimento completo (tickets, SLA)
- Canal de Denúncias
- Chat IA (RAG)

### Fase 3 — Operação
- Logística de concursos
- Financeiro
- CRM

### Fase 4 — Inteligência
- Analytics avançado
- Dashboards em tempo real
- Relatórios gerenciais

## Segurança

- RBAC com herança de roles
- Scope-based access (por concurso, fila, unidade)
- Audit trail completo
- Dados sensíveis com hash (CPF, IP)
- LGPD compliance (consentimento, anonimização, portabilidade)
- Rate limiting e throttling
- WAF (CloudFront + AWS Shield)

## Observabilidade

- Logs estruturados (JSON) via @selecon/observability
- Correlation IDs em requests
- Health checks com dependências
- Métricas de negócio (inscrições, tickets, SLA)

## Deploy

```
GitHub (push) → CodePipeline → CodeBuild (Docker multi-stage) → Elastic Beanstalk
                                    │
                                    ├── Build apps/web (Next.js standalone)
                                    ├── Build apps/api (NestJS compiled)
                                    └── Single container (web + api + redis local)
```

## Referências de Interface

O design visual segue padrões enterprise premium:
- staging.degraucultural.com.br (referência de estrutura)
- Stripe, Vercel, Linear (referências de qualidade visual)
- Muito espaço branco, tipografia forte, micro-animações
- Glassmorphism leve, sombras suaves, gradientes institucionais
