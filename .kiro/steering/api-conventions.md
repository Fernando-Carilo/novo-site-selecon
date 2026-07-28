---
inclusion: fileMatch
fileMatchPattern: "**/apps/api/**,**/packages/contracts/**"
---

# Convenções da API — Portal Selecon

## Estrutura de Módulos

Cada domínio de negócio é um módulo NestJS independente:

```
apps/api/src/
  {domain}/
    {domain}.module.ts      — NestJS module definition
    {domain}.controller.ts  — HTTP endpoints (thin)
    {domain}.service.ts     — Business logic
    {domain}.repository.ts  — Data access (Prisma queries)
    dto/                    — Request/Response DTOs
    guards/                 — Authorization guards
    pipes/                  — Validation pipes
```

## Endpoints RESTful

- `GET /api/{resource}` — listar (paginado)
- `GET /api/{resource}/:id` — buscar por ID
- `POST /api/{resource}` — criar
- `PATCH /api/{resource}/:id` — atualizar parcial
- `DELETE /api/{resource}/:id` — remover/desativar

## Paginação

```typescript
// Query params: ?page=1&pageSize=20&sort=createdAt&order=desc
// Response:
{
  data: T[],
  meta: {
    page: number,
    pageSize: number,
    total: number,
    totalPages: number
  }
}
```

## Validação

- Usar schemas Zod de @selecon/contracts
- Pipe de validação global no bootstrap da app
- Erros de validação retornam 422 com detalhes

## Respostas de Erro

```typescript
{
  statusCode: number,
  error: string,
  message: string,
  details?: Record<string, string[]>
}
```

## Autenticação/Autorização

- Session-based (cookie HttpOnly, secure, SameSite=Strict)
- RBAC via @selecon/auth (roles + permissions + scope)
- Guards: `@RequireAuth()`, `@RequirePermission('contest.publish')`
- Scope-based: operador só vê dados do escopo atribuído

## Rate Limiting

- APIs públicas: 60 req/min por IP
- APIs autenticadas: 300 req/min por sessão
- Upload: 10 req/min

## Health Check

- `GET /api/health` — retorna status de todos os serviços
- Checados: PostgreSQL, Redis, dependências externas

## Swagger/OpenAPI

- Documentação automática em `/api/docs` (apenas DEV)
- Decorators `@ApiOperation`, `@ApiResponse` em todos os endpoints
- Tags organizadas por módulo
