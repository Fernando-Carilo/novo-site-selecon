import type { Permission } from "./permissions.js";
import { roleHasPermission } from "./permissions.js";
import type { Role } from "./roles.js";

/**
 * Escopo de autorização (ABAC), além do papel (RBAC): concurso, fila, unidade, módulo e
 * validade temporal (seção 10.7). `null`/omitido em `resourceScope` significa "sem
 * restrição adicional de escopo" — a decisão final ainda depende do papel ter a permissão.
 */
export interface AuthorizationSubject {
  userId: string;
  roles: readonly Role[];
  /** Escopos concedidos ao usuário, ex.: { contestId: "..." } ou { queueId: "..." }. */
  scopes?: readonly Record<string, string>[];
}

export interface AuthorizationContext {
  permission: Permission;
  /** Escopo exigido pelo recurso acessado, ex.: { contestId: "abc" }. */
  resourceScope?: Record<string, string>;
}

export interface AuthorizationDecision {
  allowed: boolean;
  reason: string;
}

function scopeMatches(
  granted: readonly Record<string, string>[] | undefined,
  required: Record<string, string> | undefined,
): boolean {
  if (!required) return true;
  if (!granted || granted.length === 0) return false;
  return granted.some((scope) =>
    Object.entries(required).every(([key, value]) => scope[key] === value),
  );
}

/**
 * Decisão de autorização combinando RBAC (papel → permissão) e ABAC (escopo do recurso).
 * Uso previsto: `apps/api` chama isto em um guard/middleware antes de qualquer operação
 * sensível. Break-glass, revogação de sessão e expiração de acesso temporário são tratados
 * na camada de sessão (fora deste pacote), não aqui.
 */
export function authorize(
  subject: AuthorizationSubject,
  context: AuthorizationContext,
): AuthorizationDecision {
  const hasPermission = subject.roles.some((role) => roleHasPermission(role, context.permission));
  if (!hasPermission) {
    return { allowed: false, reason: "Nenhum papel do usuário concede esta permissão" };
  }

  if (!scopeMatches(subject.scopes, context.resourceScope)) {
    return { allowed: false, reason: "Usuário não possui escopo para este recurso" };
  }

  return { allowed: true, reason: "Permitido por papel e escopo compatíveis" };
}
