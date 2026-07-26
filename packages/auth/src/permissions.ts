import type { Role } from "./roles.js";

/**
 * Permissões por módulo. Lista inicial, a expandir por fase à medida que cada módulo é
 * implementado. Nomeação: `<modulo>:<acao>`.
 */
export const PERMISSIONS = [
  "content:read",
  "content:write",
  "content:publish",
  "contest:read",
  "contest:write",
  "contest:approve",
  "contest:publish",
  "service:read",
  "service:respond",
  "service:assign",
  "service:supervise",
  "integrity:read",
  "integrity:triage",
  "integrity:decide",
  "advertising:read",
  "advertising:write",
  "advertising:approve",
  "users:manage",
  "audit:read",
  "system:configure",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * Mapeamento inicial role → permissões. Este é o padrão de **menor privilégio** por
 * default; papéis administrativos (`*_ADMIN`) recebem o superset do próprio módulo.
 * A autorização real também considera escopo (concurso, fila, unidade, validade) —
 * ver `ScopeAssignment` em `packages/db` — não apenas este mapeamento estático.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  PORTAL_ADMIN: [...PERMISSIONS],
  CONTENT_ADMIN: ["content:read", "content:write", "content:publish"],
  CONTENT_EDITOR: ["content:read", "content:write"],
  CONTENT_REVIEWER: ["content:read"],
  CONTEST_ADMIN: ["contest:read", "contest:write", "contest:approve", "contest:publish"],
  CONTEST_EDITOR: ["contest:read", "contest:write"],
  SERVICE_ADMIN: ["service:read", "service:respond", "service:assign", "service:supervise"],
  SERVICE_SUPERVISOR: ["service:read", "service:respond", "service:assign", "service:supervise"],
  SERVICE_AGENT: ["service:read", "service:respond"],
  INTEGRITY_ADMIN: ["integrity:read", "integrity:triage", "integrity:decide"],
  INTEGRITY_ANALYST: ["integrity:read", "integrity:triage"],
  INTEGRITY_AUDITOR: ["integrity:read"],
  ADVERTISING_ADMIN: ["advertising:read", "advertising:write", "advertising:approve"],
  ADVERTISING_REVIEWER: ["advertising:read", "advertising:approve"],
  SECURITY_ADMIN: ["users:manage", "system:configure", "audit:read"],
  AUDITOR: ["audit:read"],
  READ_ONLY: ["content:read", "contest:read", "service:read"],
};

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
