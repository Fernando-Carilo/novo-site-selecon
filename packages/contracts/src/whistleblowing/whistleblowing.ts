import { z } from "zod";

export const whistleblowingCaseStatusSchema = z.enum([
  "RECEIVED",
  "TRIAGE",
  "UNDER_ANALYSIS",
  "AWAITING_INFO",
  "DECIDED",
  "CLOSED",
]);
export type WhistleblowingCaseStatus = z.infer<typeof whistleblowingCaseStatusSchema>;

export const whistleblowingRiskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type WhistleblowingRiskLevel = z.infer<typeof whistleblowingRiskLevelSchema>;

/** Formulário público de nova denúncia (seção 9.7) — enviado em uma única submissão
 * atômica ao final do assistente em etapas do frontend. */
export const createWhistleblowingCaseRequestSchema = z.object({
  isAnonymous: z.boolean(),
  reporterName: z.string().max(200).optional(),
  reporterEmail: z.string().email().optional(),
  categoryId: z.string().uuid(),
  description: z.string().min(20).max(10000),
  involvedPeople: z.string().max(2000).optional(),
  location: z.string().max(500).optional(),
  incidentDate: z.string().datetime().optional(),
});
export type CreateWhistleblowingCaseRequest = z.infer<typeof createWhistleblowingCaseRequestSchema>;

/** Retornado uma única vez, imediatamente após o envio — nunca mais recuperável. */
export const whistleblowingCredentialsSchema = z.object({
  protocol: z.string(),
  accessCode: z.string(),
});
export type WhistleblowingCredentials = z.infer<typeof whistleblowingCredentialsSchema>;

export const lookupWhistleblowingCaseRequestSchema = z.object({
  protocol: z.string().min(6),
  accessCode: z.string().min(6),
});
export type LookupWhistleblowingCaseRequest = z.infer<typeof lookupWhistleblowingCaseRequestSchema>;

export const whistleblowingMessageSchema = z.object({
  id: z.string().uuid(),
  direction: z.enum(["FROM_REPORTER", "FROM_INSTITUTION"]),
  body: z.string(),
  createdAt: z.string().datetime(),
});
export type WhistleblowingMessageDto = z.infer<typeof whistleblowingMessageSchema>;

/** Visão pública/protegida do caso — nunca expõe o analista designado nem notas internas. */
export const whistleblowingCasePublicViewSchema = z.object({
  protocol: z.string(),
  status: whistleblowingCaseStatusSchema,
  createdAt: z.string().datetime(),
  messages: z.array(whistleblowingMessageSchema),
});
export type WhistleblowingCasePublicView = z.infer<typeof whistleblowingCasePublicViewSchema>;

export const addWhistleblowingMessageRequestSchema = lookupWhistleblowingCaseRequestSchema.extend({
  body: z.string().min(1).max(5000),
});
export type AddWhistleblowingMessageRequest = z.infer<typeof addWhistleblowingMessageRequestSchema>;

export const whistleblowingCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
});
export type WhistleblowingCategoryDto = z.infer<typeof whistleblowingCategorySchema>;

// --- Administração (acesso restrito, seção 10.5) ---

export const whistleblowingCaseSummarySchema = z.object({
  id: z.string().uuid(),
  protocol: z.string(),
  status: whistleblowingCaseStatusSchema,
  riskLevel: whistleblowingRiskLevelSchema.nullable(),
  isAnonymous: z.boolean(),
  categoryName: z.string(),
  createdAt: z.string().datetime(),
});
export type WhistleblowingCaseSummary = z.infer<typeof whistleblowingCaseSummarySchema>;

export const whistleblowingCaseDetailSchema = whistleblowingCaseSummarySchema.extend({
  description: z.string(),
  involvedPeople: z.string().nullable(),
  location: z.string().nullable(),
  incidentDate: z.string().datetime().nullable(),
  messages: z.array(whistleblowingMessageSchema),
  decision: z.object({ summary: z.string(), decidedAt: z.string().datetime() }).nullable(),
});
export type WhistleblowingCaseDetail = z.infer<typeof whistleblowingCaseDetailSchema>;

/** Toda visualização do caso pelo time interno exige justificativa (regra 12.3). */
export const accessWhistleblowingCaseRequestSchema = z.object({
  justification: z.string().min(10).max(1000),
});
export type AccessWhistleblowingCaseRequest = z.infer<typeof accessWhistleblowingCaseRequestSchema>;

export const updateWhistleblowingStatusRequestSchema = z.object({
  status: whistleblowingCaseStatusSchema,
  justification: z.string().min(10).max(1000),
});
export type UpdateWhistleblowingStatusRequest = z.infer<
  typeof updateWhistleblowingStatusRequestSchema
>;

export const addWhistleblowingDecisionRequestSchema = z.object({
  summary: z.string().min(10).max(5000),
});
export type AddWhistleblowingDecisionRequest = z.infer<
  typeof addWhistleblowingDecisionRequestSchema
>;
