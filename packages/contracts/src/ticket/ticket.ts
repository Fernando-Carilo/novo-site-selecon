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
