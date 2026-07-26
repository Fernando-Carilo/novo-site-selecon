import { randomUUID } from "node:crypto";
import { healthy } from "../health-status.js";
import type {
  MessageDeliveryState,
  MessagingProvider,
  OutboundMessage,
} from "./messaging-provider.js";

export class MessagingMockProvider implements MessagingProvider {
  private readonly deliveryStates = new Map<string, MessageDeliveryState>();

  async healthCheck() {
    return healthy("MessagingMockProvider — sem dependência externa real");
  }

  async send(_message: OutboundMessage): Promise<{ providerMessageId: string }> {
    const providerMessageId = randomUUID();
    this.deliveryStates.set(providerMessageId, "sent");
    return { providerMessageId };
  }

  async getDeliveryState(providerMessageId: string): Promise<MessageDeliveryState> {
    return this.deliveryStates.get(providerMessageId) ?? "failed";
  }
}
