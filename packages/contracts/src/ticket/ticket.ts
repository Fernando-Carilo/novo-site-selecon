import { z } from "zod";

export const ticketStatusSchema = z.enum(["NEW", "IN_PROGRESS", "ANSWERED", "CLOSED", "REOPENED"]);
export type TicketStatus = z.infer<typeof ticketStatusSchema>;

export const ticketChannelSchema = z.enum(["WEB", "EMAIL", "WHATSAPP", "CHAT"]);
export type TicketChannel = z.infer<typeof ticketChannelSchema>;

export const ticketPrioritySchema = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);
export type TicketPriority = z.infer<typeof ticketPrioritySchema>;

/** Formulário público do Fale Conosco / atendimento (seção 9.6). */
export const createTicketRequestSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  cpf: z.string().length(11).optional(),
  contestId: z.string().uuid().optional(),
  subject: z.string().min(1).max(200),
  preferredChannel: ticketChannelSchema,
  description: z.string().min(1).max(5000),
  privacyConsent: z.literal(true, {
    errorMap: () => ({ message: "É necessário aceitar o aviso de privacidade" }),
  }),
});
export type CreateTicketRequest = z.infer<typeof createTicketRequestSchema>;

export const ticketProtocolLookupSchema = z.object({
  protocol: z.string().min(6),
});
export type TicketProtocolLookup = z.infer<typeof ticketProtocolLookupSchema>;

export const ticketMessageSchema = z.object({
  id: z.string().uuid(),
  direction: z.enum(["INBOUND", "OUTBOUND"]),
  body: z.string(),
  createdAt: z.string().datetime(),
});
export type TicketMessageDto = z.infer<typeof ticketMessageSchema>;

/** Visão pública da consulta de protocolo — nunca expõe dados de terceiros/atendente. */
export const ticketPublicViewSchema = z.object({
  protocol: z.string(),
  subject: z.string(),
  status: ticketStatusSchema,
  createdAt: z.string().datetime(),
  messages: z.array(ticketMessageSchema),
});
export type TicketPublicView = z.infer<typeof ticketPublicViewSchema>;

export const ticketSummarySchema = z.object({
  id: z.string().uuid(),
  protocol: z.string(),
  subject: z.string(),
  status: ticketStatusSchema,
  priority: ticketPrioritySchema,
  channel: ticketChannelSchema,
  contactName: z.string(),
  contactEmail: z.string(),
  assignedUserId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
});
export type TicketSummary = z.infer<typeof ticketSummarySchema>;

export const ticketDetailSchema = ticketSummarySchema.extend({
  description: z.string(),
  messages: z.array(ticketMessageSchema),
  internalNotes: z.array(
    z.object({
      id: z.string().uuid(),
      body: z.string(),
      authorUserId: z.string(),
      createdAt: z.string().datetime(),
    }),
  ),
});
export type TicketDetail = z.infer<typeof ticketDetailSchema>;

export const assignTicketRequestSchema = z.object({
  userId: z.string().uuid(),
});
export type AssignTicketRequest = z.infer<typeof assignTicketRequestSchema>;

export const addTicketMessageRequestSchema = z.object({
  body: z.string().min(1).max(5000),
});
export type AddTicketMessageRequest = z.infer<typeof addTicketMessageRequestSchema>;

export const addInternalNoteRequestSchema = z.object({
  body: z.string().min(1).max(5000),
});
export type AddInternalNoteRequest = z.infer<typeof addInternalNoteRequestSchema>;
