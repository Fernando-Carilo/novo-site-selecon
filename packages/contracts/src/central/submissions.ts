import { z } from "zod";
import { ticketStatusSchema } from "../ticket/ticket.js";

/**
 * Contratos de envio do portal público para a Central de Serviços Selecon.
 * Fonte de verdade compartilhada entre `apps/web` (produtor) e a Central (consumidora).
 * Ver docs/CENTRAL_DE_SERVICOS.md para endpoints, autenticação e idempotência.
 */

export const projectTypeSchema = z.enum([
  "CONCURSO_PUBLICO",
  "PROCESSO_SELETIVO",
  "SELECAO_ESCOLAR_OU_VESTIBULAR",
  "CAPACITACAO",
  "PESQUISA",
  "OUTRO",
]);
export type ProjectType = z.infer<typeof projectTypeSchema>;

export const organizationSphereSchema = z.enum([
  "MUNICIPAL",
  "ESTADUAL",
  "FEDERAL",
  "AUTARQUIA_OU_FUNDACAO",
  "EMPRESA_PUBLICA",
  "CONSORCIO",
  "PRIVADO",
]);
export type OrganizationSphere = z.infer<typeof organizationSphereSchema>;

export const estimatedCandidatesSchema = z.enum([
  "ATE_5_MIL",
  "DE_5_A_20_MIL",
  "DE_20_A_50_MIL",
  "DE_50_A_100_MIL",
  "ACIMA_DE_100_MIL",
  "NAO_SEI",
]);

/** Lead comercial (seção 9.8): entra em fila separada de atendimento, classificado por projeto. */
export const commercialLeadSchema = z.object({
  organizationName: z.string().min(2).max(200),
  organizationSphere: organizationSphereSchema,
  uf: z.string().length(2),
  city: z.string().min(2).max(120),
  contactName: z.string().min(2).max(200),
  contactRole: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(8).max(30),
  projectType: projectTypeSchema,
  estimatedCandidates: estimatedCandidatesSchema,
  expectedStart: z.string().max(60).optional(),
  hasTermOfReference: z.boolean().default(false),
  message: z.string().min(10).max(5000),
  privacyConsent: z.literal(true, {
    errorMap: () => ({ message: "É necessário aceitar o aviso de privacidade" }),
  }),
  /** Origem do lead para métricas first-party (sem cookies de terceiros). */
  source: z.string().max(60).default("portal-comercial"),
});
export type CommercialLead = z.infer<typeof commercialLeadSchema>;

export const alertSubscriptionSchema = z.object({
  email: z.string().email(),
  /** Vazio = todos os novos editais. */
  contestSlug: z.string().max(120).optional(),
  uf: z.string().length(2).optional(),
  privacyConsent: z.literal(true, {
    errorMap: () => ({ message: "É necessário aceitar o aviso de privacidade" }),
  }),
});
export type AlertSubscription = z.infer<typeof alertSubscriptionSchema>;

export const submissionReceiptSchema = z.object({
  /** Protocolo público — gerado pela Central (ou pelo mock em desenvolvimento). */
  protocol: z.string().min(6),
  receivedAt: z.string().datetime(),
  queue: z.enum(["COMERCIAL", "ATENDIMENTO", "ALERTAS"]),
});
export type SubmissionReceipt = z.infer<typeof submissionReceiptSchema>;

/** Mensagem visível ao solicitante na consulta de protocolo — nunca inclui dados de terceiros. */
export const ticketLookupMessageSchema = z.object({
  at: z.string().datetime(),
  /** `IN` = enviada pelo solicitante; `OUT` = resposta do atendimento. */
  direction: z.enum(["IN", "OUT"]),
  body: z.string().max(10000),
});
export type TicketLookupMessage = z.infer<typeof ticketLookupMessageSchema>;

/**
 * Resultado da consulta pública de protocolo (`GET /v1/portal/tickets/{protocol}`, seção 9.6).
 * `found: false` com `reason: "NOT_FOUND"` é a resposta honesta quando o protocolo não existe
 * na Central (ou quando o portal roda com o gateway mock, que não armazena chamados).
 */
export const ticketLookupResultSchema = z.discriminatedUnion("found", [
  z.object({
    found: z.literal(true),
    status: ticketStatusSchema,
    subject: z.string().max(200),
    updatedAt: z.string().datetime(),
    messages: z.array(ticketLookupMessageSchema).default([]),
  }),
  z.object({
    found: z.literal(false),
    reason: z.enum(["NOT_FOUND", "UNAVAILABLE"]),
  }),
]);
export type TicketLookupResult = z.infer<typeof ticketLookupResultSchema>;
