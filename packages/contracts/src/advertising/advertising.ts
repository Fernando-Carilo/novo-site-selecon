import { z } from "zod";

export const campaignStatusSchema = z.enum([
  "DRAFT",
  "PENDING_REVIEW",
  "PENDING_COMPLIANCE",
  "APPROVED",
  "ACTIVE",
  "PAUSED",
  "FINISHED",
  "REJECTED",
]);
export type CampaignStatus = z.infer<typeof campaignStatusSchema>;

export const creativeFormatSchema = z.enum(["DESKTOP", "MOBILE"]);
export type CreativeFormat = z.infer<typeof creativeFormatSchema>;

export const createAdvertiserRequestSchema = z.object({
  legalName: z.string().min(2).max(200),
  taxId: z.string().max(32).optional(),
});
export type CreateAdvertiserRequest = z.infer<typeof createAdvertiserRequestSchema>;

export const advertiserSchema = z.object({
  id: z.string().uuid(),
  legalName: z.string(),
  taxId: z.string().nullable(),
});
export type AdvertiserDto = z.infer<typeof advertiserSchema>;

export const placementDtoSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  page: z.string(),
});
export type PlacementDto = z.infer<typeof placementDtoSchema>;

const creativeInputSchema = z.object({
  format: creativeFormatSchema,
  /** Chave do objeto no S3 (mock nesta fase — ver docs/INTEGRATIONS.md). */
  objectKey: z.string().min(1),
  destinationUrl: z.string().url(),
});

/** Criação de campanha (seção 9.9) — sempre nasce em DRAFT. */
export const createCampaignRequestSchema = z.object({
  advertiserId: z.string().uuid(),
  contractId: z.string().uuid().optional(),
  name: z.string().min(3).max(200),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  placementKeys: z.array(z.string()).min(1),
  creatives: z.array(creativeInputSchema).min(1),
});
export type CreateCampaignRequest = z.infer<typeof createCampaignRequestSchema>;

/**
 * Decisão de governança em duas etapas (seção 9.9 e regra de separação de funções):
 * revisor (conteúdo/marca) e compliance devem ser pessoas diferentes entre si e
 * diferentes do criador da campanha.
 */
export const campaignReviewDecisionRequestSchema = z.object({
  approved: z.boolean(),
  comment: z.string().max(1000).optional(),
});
export type CampaignReviewDecisionRequest = z.infer<typeof campaignReviewDecisionRequestSchema>;

export const campaignCreativeSchema = z.object({
  id: z.string().uuid(),
  format: creativeFormatSchema,
  objectKey: z.string(),
  destinationUrl: z.string(),
  approved: z.boolean(),
});
export type CampaignCreativeDto = z.infer<typeof campaignCreativeSchema>;

export const campaignSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  advertiserName: z.string(),
  status: campaignStatusSchema,
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});
export type CampaignSummary = z.infer<typeof campaignSummarySchema>;

export const campaignApprovalSchema = z.object({
  reviewerUserId: z.string().uuid().nullable(),
  complianceUserId: z.string().uuid().nullable(),
  approved: z.boolean().nullable(),
  decidedAt: z.string().datetime().nullable(),
});
export type CampaignApprovalDto = z.infer<typeof campaignApprovalSchema>;

export const campaignDetailSchema = campaignSummarySchema.extend({
  advertiserId: z.string().uuid(),
  createdByUserId: z.string().uuid(),
  creatives: z.array(campaignCreativeSchema),
  placements: z.array(placementDtoSchema.pick({ key: true, name: true })),
  approval: campaignApprovalSchema.nullable(),
});
export type CampaignDetail = z.infer<typeof campaignDetailSchema>;

/** Retornado pelo serviço de veiculação pública (seção 9.9) — nunca expõe dados internos. */
export const adServeResponseSchema = z.object({
  creativeId: z.string().uuid(),
  campaignId: z.string().uuid(),
  format: creativeFormatSchema,
  objectKey: z.string(),
  destinationUrl: z.string(),
});
export type AdServeResponse = z.infer<typeof adServeResponseSchema>;
