import { SetMetadata } from "@nestjs/common";
import type { Permission } from "@selecon/auth";

export const REQUIRE_PERMISSION_KEY = "requiredPermission";

/**
 * Exige uma permissão RBAC para acessar a rota. Combine com `@RequireScope()`
 * quando a operação também depende de escopo (ex.: concurso específico).
 * Nunca confie apenas na ausência do botão no frontend (regra 12.1).
 */
export const RequirePermission = (permission: Permission) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permission);
