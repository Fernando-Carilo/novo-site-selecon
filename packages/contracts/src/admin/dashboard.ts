import { z } from "zod";

/**
 * Métricas agregadas do dashboard administrativo (seção 5 do prompt mestre) — todas
 * calculadas por consultas reais ao banco em tempo de requisição, nunca valores fixos.
 */
export const adminDashboardStatsSchema = z.object({
  contests: z.object({
    active: z.number().int(),
    draft: z.number().int(),
    closed: z.number().int(),
  }),
  tickets: z.object({
    open: z.number().int(),
    overdueOpen: z.number().int(),
    averageResolutionHours: z.number().nullable(),
  }),
  whistleblowing: z.object({
    received: z.number().int(),
    underAnalysis: z.number().int(),
  }),
  advertising: z.object({
    activeCampaigns: z.number().int(),
    pendingReview: z.number().int(),
  }),
  content: z.object({
    pendingPages: z.number().int(),
    pendingNews: z.number().int(),
  }),
  recentAuditEvents: z.array(
    z.object({
      id: z.string().uuid(),
      action: z.string(),
      resourceType: z.string(),
      occurredAt: z.string().datetime(),
      riskLevel: z.string().nullable(),
    }),
  ),
  integrations: z.array(
    z.object({
      name: z.string(),
      mode: z.enum(["mock", "real"]),
    }),
  ),
});
export type AdminDashboardStats = z.infer<typeof adminDashboardStatsSchema>;
