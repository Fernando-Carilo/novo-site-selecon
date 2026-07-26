import { z } from "zod";

export const contentStatusSchema = z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "UNPUBLISHED"]);
export type ContentStatus = z.infer<typeof contentStatusSchema>;

// --- Páginas institucionais (conteúdo estático por slug) ---

export const createContentPageRequestSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
  title: z.string().min(2).max(200),
  body: z.string().min(1).max(50_000),
});
export type CreateContentPageRequest = z.infer<typeof createContentPageRequestSchema>;

export const updateContentPageRequestSchema = z.object({
  title: z.string().min(2).max(200),
  body: z.string().min(1).max(50_000),
});
export type UpdateContentPageRequest = z.infer<typeof updateContentPageRequestSchema>;

export const contentPageSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  status: contentStatusSchema,
  updatedAt: z.string().datetime(),
});
export type ContentPageSummary = z.infer<typeof contentPageSummarySchema>;

export const contentPageDetailSchema = contentPageSummarySchema.extend({
  body: z.string(),
  publishedAt: z.string().datetime().nullable(),
});
export type ContentPageDetail = z.infer<typeof contentPageDetailSchema>;

// --- Notícias ---

export const createNewsPostRequestSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
  title: z.string().min(2).max(200),
  body: z.string().min(1).max(50_000),
  categoryId: z.string().uuid().optional(),
});
export type CreateNewsPostRequest = z.infer<typeof createNewsPostRequestSchema>;

export const updateNewsPostRequestSchema = createNewsPostRequestSchema
  .omit({ slug: true })
  .partial({ categoryId: true });
export type UpdateNewsPostRequest = z.infer<typeof updateNewsPostRequestSchema>;

export const newsCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
});
export type NewsCategoryDto = z.infer<typeof newsCategorySchema>;

export const newsPostSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  status: contentStatusSchema,
  categoryName: z.string().nullable(),
  publishedAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime(),
});
export type NewsPostSummary = z.infer<typeof newsPostSummarySchema>;

export const newsPostDetailSchema = newsPostSummarySchema.extend({
  body: z.string(),
});
export type NewsPostDetail = z.infer<typeof newsPostDetailSchema>;
