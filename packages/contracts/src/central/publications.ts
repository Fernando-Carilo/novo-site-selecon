import { z } from "zod";

/**
 * Contrato de leitura das publicações do portal a partir da Central de Serviços.
 * Espelha `apps/web/lib/content/types.ts`; qualquer mudança deve ser feita aqui primeiro.
 */

export const contestPublicStatusSchema = z.enum([
  "PREVISTO",
  "INSCRICOES_ABERTAS",
  "EM_ANDAMENTO",
  "HOMOLOGADO",
  "ENCERRADO",
  "SUSPENSO",
]);

export const contestKindSchema = z.enum([
  "CONCURSO_PUBLICO",
  "PROCESSO_SELETIVO",
  "PROCESSO_SELETIVO_SIMPLIFICADO",
  "SELECAO_ESCOLAR",
  "VESTIBULAR",
]);

export const contestAreaSchema = z.enum([
  "SEGURANCA",
  "SAUDE",
  "EDUCACAO",
  "ADMINISTRACAO",
  "ENGENHARIA",
  "LEGISLATIVO",
  "TECNICO",
  "JURIDICO",
]);

export const educationLevelSchema = z.enum(["FUNDAMENTAL", "MEDIO", "TECNICO", "SUPERIOR"]);

export const publicationKindSchema = z.enum([
  "EDITAL",
  "RETIFICACAO",
  "COMUNICADO",
  "CONVOCACAO",
  "RESULTADO",
  "GABARITO",
  "HOMOLOGACAO",
  "ANEXO",
]);

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data no formato YYYY-MM-DD");

export const pageSectionKeySchema = z.enum([
  "resumo",
  "numeros",
  "video",
  "cronograma",
  "cargos",
  "publicacoes",
  "perguntas",
  "contato",
  "relacionados",
]);
export type PageSectionKey = z.infer<typeof pageSectionKeySchema>;

export const portalContestPublicationSchema = z.object({
  id: z.string(),
  kind: publicationKindSchema,
  title: z.string(),
  publishedAt: isoDate,
  url: z.string().url().optional(),
  current: z.boolean().optional(),
  version: z.number().int().positive().optional(),
});

export const portalContestSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  editalNumber: z.string(),
  kind: contestKindSchema,
  status: contestPublicStatusSchema,
  organization: z.object({
    name: z.string(),
    shortName: z.string(),
    city: z.string(),
    uf: z.string().length(2),
    sphere: z.enum([
      "MUNICIPAL",
      "ESTADUAL",
      "FEDERAL",
      "AUTARQUIA",
      "EMPRESA_PUBLICA",
      "CONSORCIO",
    ]),
  }),
  area: contestAreaSchema,
  summary: z.string(),
  highlights: z.array(z.string()).max(4),
  educationLevels: z.array(educationLevelSchema),
  vacancies: z.number().int().nonnegative().nullable(),
  reserveVacancies: z.number().int().nonnegative().nullable().optional(),
  salaryMaxCents: z.number().int().nonnegative().nullable().optional(),
  feeCents: z.array(z.number().int().nonnegative()).optional(),
  registration: z.object({ opensAt: isoDate.optional(), closesAt: isoDate.optional() }),
  examDate: isoDate.optional(),
  positions: z.array(
    z.object({
      title: z.string(),
      vacancies: z.number().int().nullable(),
      reserve: z.number().int().nullable().optional(),
      level: educationLevelSchema,
      salaryCents: z.number().int().nullable().optional(),
      requirements: z.string().optional(),
    }),
  ),
  timeline: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      date: isoDate,
      dateEnd: isoDate.optional(),
      status: z.enum(["DONE", "CURRENT", "UPCOMING"]),
      description: z.string().optional(),
    }),
  ),
  publications: z.array(portalContestPublicationSchema),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })),
  serviceLinks: z.array(
    z.object({
      key: z.enum([
        "INSCRICAO",
        "AREA_DO_CANDIDATO",
        "BOLETO",
        "LOCAL_DE_PROVA",
        "RECURSO",
        "RESULTADO",
        "LEGADO",
      ]),
      label: z.string(),
      url: z.string().url(),
      external: z.literal(true),
    }),
  ),
  cover: z.object({
    area: contestAreaSchema,
    imageUrl: z.string().url().optional(),
    imageAlt: z.string().optional(),
  }),
  legacyUrl: z.string().url().optional(),
  featured: z.boolean().optional(),
  registeredCandidates: z.number().int().nonnegative().optional(),
  updatedAt: isoDate,
  // Aditivos (Central, 05/10): vitrine da home, SEO, vídeo, tags e seções da página
  homeOrder: z.number().int().optional(),
  seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
  videoUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  pageSections: z
    .array(z.object({ key: pageSectionKeySchema, enabled: z.boolean(), order: z.number().int() }))
    .optional(),
});
export type PortalContest = z.infer<typeof portalContestSchema>;

export const portalNewsPostSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string(),
  publishedAt: isoDate,
  category: z.enum(["CONCURSOS", "INSTITUCIONAL", "RESULTADOS", "COMUNICADOS"]),
  body: z.array(z.string()),
  contestSlug: z.string().optional(),
  author: z.string(),
  imageUrl: z.string().url().optional(),
  imageAlt: z.string().optional(),
  // Aditivos (Central, 05/10)
  homeOrder: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
  readingMinutes: z.number().int().optional(),
  imageCredit: z.string().optional(),
});
export type PortalNewsPost = z.infer<typeof portalNewsPostSchema>;

export const portalEnvelopeSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    data,
    meta: z
      .object({ total: z.number().int().optional(), generatedAt: z.string().optional() })
      .optional(),
  });
