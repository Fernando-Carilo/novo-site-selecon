---
inclusion: auto
---

# Projeto: Novo Portal Instituto Selecon

## Visão Geral

O Instituto Nacional de Seleções e Concursos (Instituto Selecon) está construindo uma plataforma SaaS enterprise moderna para substituir completamente o WordPress atual (selecon.org.br) e unificar todos os sistemas:

- **Portal Institucional** (selecon.org.br)
- **Atendimento** (atendimento.selecon.org.br)
- **Canal de Denúncias** (denuncias.selecon.org.br)
- **Área Administrativa** (novo)
- **Chat IA** (novo)
- **CRM** (novo)
- **Financeiro** (novo)
- **Logística** (novo)
- **Gestão de Concursos** (novo)
- **Analytics** (novo)

## Stack Técnica

- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Next.js 15, React 19, Tailwind CSS, Design System próprio (@selecon/ui)
- **Backend**: NestJS 11, Fastify 5, Prisma ORM
- **Banco**: PostgreSQL 16 (7 schemas segregados)
- **Cache/Filas**: Redis 7 + BullMQ
- **Cloud**: AWS (Elastic Beanstalk, RDS, S3, CodePipeline, CloudFront)
- **Linguagem**: TypeScript 5.9 (strict mode)
- **Testes**: Vitest
- **CI/CD**: GitHub → CodePipeline → CodeBuild → Elastic Beanstalk

## Arquitetura do Monorepo

```
apps/
  web/          → Next.js (portal público + admin)
  api/          → NestJS (REST API)
  worker/       → BullMQ (jobs assíncronos)
packages/
  ui/           → Design System (tokens + componentes)
  db/           → Prisma schema + client
  contracts/    → Schemas Zod compartilhados (API contracts)
  auth/         → RBAC, policies, roles
  config/       → Configuração centralizada (env vars)
  integrations/ → Adapters externos (email, WhatsApp, etc.)
  observability/→ Logger, métricas, tracing
```

## Públicos-Alvo

1. **Candidatos** — inscrição, editais, resultados, recursos, atendimento
2. **Órgãos Públicos** — contratação, portfólio, capacidade técnica
3. **Empresas** — parcerias, licitações, fornecedores
4. **Imprensa** — notícias, comunicados, editais
5. **Colaboradores** — ferramentas administrativas internas
6. **Administração** — gestão completa do conteúdo e operação

## Princípios de Design

- Interface **premium** inspirada em Stripe, Vercel, Linear, Apple
- Muito espaço em branco, micro-animações, glassmorphism leve
- Dark mode preparado
- Acessibilidade WCAG 2.1 AA
- SEO avançado para indexação de editais e concursos
- Mobile-first, responsividade total
- Design System próprio com tokens centralizados

## Branch de Deploy

- Branch ativa: `feat/fase-1-design-system`
- Pipeline: push → CodePipeline → CodeBuild (Docker) → Elastic Beanstalk
- Ambiente DEV: `selecon-portal-dev` (t3.micro, us-east-1)
