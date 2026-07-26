import { z } from "zod";

export const auditEventSchema = z.object({
  id: z.string().uuid(),
  actorUserId: z.string().nullable(),
  actorRole: z.string().nullable(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string().nullable(),
  result: z.enum(["SUCCESS", "FAILURE"]),
  riskLevel: z.string().nullable(),
  justification: z.string().nullable(),
  occurredAt: z.string().datetime(),
});
export type AuditEventDto = z.infer<typeof auditEventSchema>;

export const auditEventFiltersSchema = z.object({
  resourceType: z.string().optional(),
  action: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
export type AuditEventFilters = z.infer<typeof auditEventFiltersSchema>;
