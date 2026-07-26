import type { HealthStatus } from "@selecon/contracts";

export interface OutboundEmail {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  inReplyToMessageId?: string;
}

export interface InboundEmail {
  providerMessageId: string;
  from: string;
  subject: string;
  bodyText: string;
  receivedAt: string;
  threadId?: string;
}

/**
 * Abstração de provedor de e-mail (Microsoft Graph na implementação real — ver
 * docs/INTEGRATIONS.md e ADR-0004). Implementações reais devem ser idempotentes ao
 * processar recebimento (dedup por `providerMessageId`) e nunca persistir tokens sem
 * criptografia.
 */
export interface EmailProvider {
  healthCheck(): Promise<HealthStatus>;
  send(email: OutboundEmail): Promise<{ providerMessageId: string }>;
  /** Usado por polling/reconciliação; implementações reais preferem push (subscription). */
  fetchNewMessages(sinceCursor?: string): Promise<{ messages: InboundEmail[]; nextCursor: string }>;
}
