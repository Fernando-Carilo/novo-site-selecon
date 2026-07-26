import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ROLES, ROLE_PERMISSIONS } from "@selecon/auth";
import type { PermissionMatrixEntry } from "@selecon/contracts";
import { prisma } from "@selecon/db";
import { RequirePermission } from "../auth/require-permission.decorator.js";

/**
 * Matriz de perfis e permissões — reflete diretamente `ROLE_PERMISSIONS`
 * (packages/auth/src/permissions.ts), a fonte real usada por `PermissionGuard` em
 * tempo de execução. Não é editável por esta rota: papéis e permissões são definidos
 * em código (decisão de arquitetura), não numa tabela administrável — expor a matriz
 * real evita que o painel mostre algo diferente do que o backend de fato aplica.
 */
@ApiTags("admin-permissions")
@Controller("admin/permissions")
export class AdminPermissionsController {
  @Get("matrix")
  @RequirePermission("users:manage")
  async matrix(): Promise<PermissionMatrixEntry[]> {
    const roles = await prisma.role.findMany();
    const descriptionByKey = new Map(roles.map((role) => [role.key, role.description]));

    return ROLES.map((roleKey) => ({
      roleKey,
      description: descriptionByKey.get(roleKey) ?? roleKey,
      permissions: [...ROLE_PERMISSIONS[roleKey]],
    }));
  }
}
