---
inclusion: auto
---

# Padrões de Código — Portal Selecon

## TypeScript

- Strict mode sempre habilitado
- Tipos explícitos em exports públicos
- Evitar `any` — usar `unknown` quando necessário
- Preferir interfaces para objetos, types para unions/intersections
- Usar `as const` para literals
- Zod para validação runtime (schemas em @selecon/contracts)

## React/Next.js

- Server Components por padrão (Next.js App Router)
- "use client" apenas quando necessário (interatividade, hooks de browser)
- Componentes pequenos e focados (máx ~100 linhas)
- Props tipadas com interface dedicada
- Exportar como `export default function` para pages
- Exportar como `export function` para componentes
- Usar `className` com Tailwind, nunca inline styles
- Imagens via `next/image`, links via `next/link`

## NestJS/API

- Controllers finos — lógica no service
- Módulos com fronteiras claras entre domínios
- Validators com Zod (pipes)
- DTOs tipados compartilhados via @selecon/contracts
- Swagger decorators em todos os endpoints
- Throttling em endpoints públicos
- Logs estruturados via @selecon/observability

## Prisma/Banco

- Schemas PostgreSQL segregados por domínio
- Referências entre domínios: campos escalares (sem FK cross-schema)
- Migrações incrementais (`prisma migrate dev`)
- Soft delete onde necessário (deactivatedAt, revokedAt)
- Audit trail para operações sensíveis
- UUIDs como primary key

## Arquivos e Nomenclatura

- kebab-case para arquivos e diretórios
- PascalCase para componentes React e classes
- camelCase para funções, variáveis e propriedades
- UPPER_SNAKE_CASE para constantes e env vars
- Sufixos: `.test.ts`, `.module.ts`, `.controller.ts`, `.service.ts`

## Imports

- Absolute imports com `@/` (apps/web)
- Workspace imports com `@selecon/` (packages)
- Ordem: stdlib → externos → workspace → relativos
- Sem barrel exports desnecessários (tree-shaking)

## Git

- Branch principal de deploy: `feat/fase-1-design-system`
- Commits em português, prefixos: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Mensagens concisas, máx 72 caracteres no título

## Performance

- Lazy loading para módulos pesados
- Image optimization (next/image, WebP/AVIF)
- Code splitting automático (Next.js)
- SSG para páginas estáticas, SSR para dinâmicas
- Cache headers adequados
- Bundle size monitorado

## Segurança

- Input validation em todas as bordas (Zod)
- SQL injection impossível (Prisma ORM)
- XSS prevenido (React + CSP headers)
- CSRF tokens em forms
- Rate limiting em APIs públicas
- Secrets em variáveis de ambiente (nunca no código)
- LGPD: dados pessoais com hash, consentimento explícito
