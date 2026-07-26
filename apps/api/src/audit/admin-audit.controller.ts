import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { auditEventFiltersSchema, type AuditEventDto } from "@selecon/contracts";
import { prisma } from "@selecon/db";
import { RequirePermission } from "../auth/require-permission.decorator.js";

/**
 * Trilha de auditoria geral (seção 10.8) — nunca inclui eventos do domínio de denúncias
 * (ver ADR-0003: WhistleblowingAccessEvent tem trilha própria e segregada, não exposta
 * aqui nem por nenhuma outra rota fora do módulo de integridade).
 */
@ApiTags("admin-audit")
@Controller("admin/audit")
export class AdminAuditController {
  @Get("events")
  @RequirePermission("audit:read")
  async list(
    @Query("resourceType") resourceType?: string,
    @Query("action") action?: string,
    @Query("limit") limit?: string,
  ): Promise<AuditEventDto[]> {
    const filters = auditEventFiltersSchema.parse({
      resourceType,
      action,
      limit: limit ?? undefined,
    });

    const events = await prisma.auditEvent.findMany({
      where: {
        resourceType: filters.resourceType,
        action: filters.action,
      },
      orderBy: { occurredAt: "desc" },
      take: filters.limit,
    });

    return events.map((event) => ({
      id: event.id,
      actorUserId: event.actorUserId,
      actorRole: event.actorRole,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      result: event.result,
      riskLevel: event.riskLevel,
      justification: event.justification,
      occurredAt: event.occurredAt.toISOString(),
    }));
  }
}
