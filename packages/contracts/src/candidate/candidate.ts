import { z } from "zod";

export const candidateQuerySchema = z.object({
  candidateRef: z.string().min(1),
  contestId: z.string().uuid(),
});
export type CandidateQuery = z.infer<typeof candidateQuerySchema>;

export const registrationSummarySchema = z.object({
  registrationId: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]),
  position: z.string().optional(),
  submittedAt: z.string().datetime(),
});
export type RegistrationSummaryDto = z.infer<typeof registrationSummarySchema>;

export const paymentStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "EXEMPT", "OVERDUE"]),
  amountCents: z.number().int().optional(),
  dueDate: z.string().datetime().optional(),
  secondCopyUrl: z.string().nullable().optional(),
});
export type PaymentStatusDto = z.infer<typeof paymentStatusSchema>;

export const appealSummarySchema = z.object({
  appealId: z.string(),
  subject: z.string(),
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED"]),
  submittedAt: z.string().datetime(),
});
export type AppealSummaryDto = z.infer<typeof appealSummarySchema>;

export const resultSummarySchema = z.object({
  stage: z.string(),
  status: z.enum(["APPROVED", "NOT_APPROVED", "PENDING"]),
  score: z.number().optional(),
  publishedAt: z.string().datetime().optional(),
});
export type ResultSummaryDto = z.infer<typeof resultSummarySchema>;

/**
 * Painel agregado do candidato (seção 11.4) — combina todas as chamadas do
 * `CandidateProvider` em uma única resposta para o frontend.
 */
export const candidateDashboardSchema = z.object({
  registration: registrationSummarySchema,
  payment: paymentStatusSchema,
  examCardUrl: z.string().nullable(),
  appeals: z.array(appealSummarySchema),
  results: z.array(resultSummarySchema),
});
export type CandidateDashboard = z.infer<typeof candidateDashboardSchema>;
