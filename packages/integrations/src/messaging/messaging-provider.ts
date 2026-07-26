import type { HealthStatus } from "@selecon/contracts";

export type MessageDeliveryState = "sent" | "delivered" | "read" | "failed";

export interface OutboundMessage {
  to: string;
  templateName?: string;
  text?: string;
}

export interface InboundMessage {
  providerMessageId: string;
  from: string;
  text: string;
  receivedAt: string;
}

/**
 * Abstração de provedor de mensageria (WhatsApp Cloud API na implementação real — ver
 * docs/INTEGRATIONS.md e ADR-0004). Implementações reais devem validar assinatura de
 * webhook e aplicar idempotência por `event`/`message id`.
 */
export interface MessagingProvider {
  healthCheck(): Promise<HealthStatus>;
  send(message: OutboundMessage): Promise<{ providerMessageId: string }>;
  getDeliveryState(providerMessageId: string): Promise<MessageDeliveryState>;
}
