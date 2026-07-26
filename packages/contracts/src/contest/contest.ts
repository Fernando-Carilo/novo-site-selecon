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

// --- Administração ---

export const createContestRequestSchema = z.object({
  title: z.string().min(3).max(300),
  slug: z
    .string()
    .min(3)
    .max(150)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens"),
  organizationId: z.string().uuid(),
  shortDescription: z.string().min(1).max(300),
  vacancies: z.number().int().nonnegative().optional(),
  educationLevel: z.string().optional(),
  registrationOpensAt: z.string().datetime().optional(),
  registrationClosesAt: z.string().datetime().optional(),
  examDate: z.string().datetime().optional(),
  feeAmountCents: z.number().int().nonnegative().optional(),
});
export type CreateContestRequest = z.infer<typeof createContestRequestSchema>;

export const updateContestRequestSchema = createContestRequestSchema.partial().omit({
  slug: true,
});
export type UpdateContestRequest = z.infer<typeof updateContestRequestSchema>;

export const publishContestRequestSchema = z.object({
  scheduledFor: z.string().datetime().optional(),
});
export type PublishContestRequest = z.infer<typeof publishContestRequestSchema>;

export const contestOrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});
export type ContestOrganizationDto = z.infer<typeof contestOrganizationSchema>;

export const contestFaqSchema = z.object({
  id: z.string().uuid(),
  question: z.string(),
  answer: z.string(),
  order: z.number().int(),
});
export type ContestFaqDto = z.infer<typeof contestFaqSchema>;

export const createContestFaqRequestSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(5000),
  order: z.number().int().nonnegative().default(0),
});
export type CreateContestFaqRequest = z.infer<typeof createContestFaqRequestSchema>;

export const contestPositionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  vacancies: z.number().int(),
  requirements: z.string(),
  salaryCents: z.number().int().nullable(),
});
export type ContestPositionDto = z.infer<typeof contestPositionSchema>;

export const createContestPositionRequestSchema = z.object({
  title: z.string().min(1).max(200),
  vacancies: z.number().int().nonnegative(),
  requirements: z.string().min(1).max(2000),
  salaryCents: z.number().int().nonnegative().optional(),
});
export type CreateContestPositionRequest = z.infer<typeof createContestPositionRequestSchema>;

export const contestDetailSchema = contestSummarySchema.extend({
  organizationId: z.string().uuid(),
  examDate: z.string().datetime().nullable(),
  feeAmountCents: z.number().int().nullable(),
  createdByUserId: z.string().uuid(),
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  faqs: z.array(contestFaqSchema),
  positions: z.array(contestPositionSchema),
});
export type ContestDetail = z.infer<typeof contestDetailSchema>;
