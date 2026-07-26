import { randomUUID } from "node:crypto";
import { healthy } from "../health-status.js";
import type { EmailProvider, InboundEmail, OutboundEmail } from "./email-provider.js";

/**
 * Implementação mock para desenvolvimento/testes/demo — não faz nenhuma chamada de rede.
 * Nunca deve ser usada em produção; selecionada via `INTEGRATIONS_MODE=mock` (ver .env.example).
 */
export class EmailMockProvider implements EmailProvider {
  private readonly sentEmails: OutboundEmail[] = [];

  async healthCheck() {
    return healthy("EmailMockProvider — sem dependência externa real");
  }

  async send(email: OutboundEmail): Promise<{ providerMessageId: string }> {
    this.sentEmails.push(email);
    return { providerMessageId: randomUUID() };
  }

  async fetchNewMessages(): Promise<{ messages: InboundEmail[]; nextCursor: string }> {
    return { messages: [], nextCursor: "mock-cursor-0" };
  }

  /** Utilitário exclusivo de teste — inspeciona o que foi "enviado". */
  getSentEmails(): readonly OutboundEmail[] {
    return this.sentEmails;
  }
}
