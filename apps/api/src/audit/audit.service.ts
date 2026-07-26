import { Injectable } from "@nestjs/common";
import { prisma } from "@selecon/db";
import { getCorrelationId } from "@selecon/observability";

export interface AuditLogInput {
  actorUserId?: string;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  beforeData?: unknown;
  afterData?: unknown;
  result?: "SUCCESS" | "FAILURE";
  riskLevel?: string;
  justification?: string;
}

/**
 * Trilha de auditoria geral (seção 10.8). Escrita apenas — não há operação de
 * update/delete exposta pela interface comum (a trilha não pode ser editada).
 * Nunca registrar dados do domínio de denúncias aqui (ver ADR-0003 — este
 * domínio tem sua própria trilha, `WhistleblowingAccessEvent`).
 */
@Injectable()
export class AuditService {
  async log(input: AuditLogInput): Promise<void> {
    await prisma.auditEvent.create({
      data: {
        actorUserId: input.actorUserId,
        actorRole: input.actorRole,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        beforeData: input.beforeData === undefined ? undefined : (input.beforeData as object),
        afterData: input.afterData === undefined ? undefined : (input.afterData as object),
        result: input.result ?? "SUCCESS",
        riskLevel: input.riskLevel,
        justification: input.justification,
        correlationId: getCorrelationId(),
      },
    });
  }
}
