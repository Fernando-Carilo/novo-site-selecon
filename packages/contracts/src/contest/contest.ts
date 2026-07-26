import { z } from "zod";

/**
 * Estados de domínio de um concurso — modelados explicitamente (regra 6.3 do prompt
 * mestre: "estados de domínio modelados, não strings soltas").
 */
export const contestStatusSchema = z.enum([
  "DRAFT",
  "IN_REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "SUSPENDED",
  "CLOSED",
  "ARCHIVED",
]);
export type ContestStatus = z.infer<typeof contestStatusSchema>;

export const contestSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  organization: z.string().min(1),
  status: contestStatusSchema,
  shortDescription: z.string().max(300),
  vacancies: z.number().int().nonnegative().nullable(),
  educationLevel: z.string().nullable(),
  registrationOpensAt: z.string().datetime().nullable(),
  registrationClosesAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime(),
});
export type ContestSummary = z.infer<typeof contestSummarySchema>;

/** Filtros do catálogo público de concursos (seção 9.3) — persistidos na URL pelo frontend. */
export const contestCatalogFiltersSchema = z.object({
  status: contestStatusSchema.optional(),
  state: z.string().length(2).optional(),
  city: z.string().optional(),
  organization: z.string().optional(),
  educationLevel: z.string().optional(),
  area: z.string().optional(),
  modality: z.string().optional(),
  onlyOpenRegistrations: z.coerce.boolean().optional(),
  query: z.string().optional(),
  sort: z.enum(["relevance", "opening", "updated"]).default("relevance"),
});
export type ContestCatalogFilters = z.infer<typeof contestCatalogFiltersSchema>;

/**
 * Regra crítica (seção 9.4): autor e aprovador devem ser pessoas diferentes para
 * publicações críticas. Este schema é validado na camada de aplicação, não apenas aqui.
 */
export const contestPublicationApprovalSchema = z
  .object({
    contestId: z.string().uuid(),
    authorUserId: z.string().uuid(),
    approverUserId: z.string().uuid(),
    scheduledFor: z.string().datetime().optional(),
  })
  .refine((data) => data.authorUserId !== data.approverUserId, {
    message: "O aprovador deve ser um usuário diferente do autor",
    path: ["approverUserId"],
  });
export type ContestPublicationApproval = z.infer<typeof contestPublicationApprovalSchema>;
