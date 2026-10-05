import "server-only";
import { randomBytes } from "node:crypto";
import {
  commercialLeadSchema,
  alertSubscriptionSchema,
  createTicketRequestSchema,
  submissionReceiptSchema,
  ticketLookupResultSchema,
  type AlertSubscription,
  type CommercialLead,
  type CreateTicketRequest,
  type SubmissionReceipt,
  type TicketLookupResult,
} from "@selecon/contracts";

/**
 * Porta de envio do portal para a Central de Serviços Selecon (leads comerciais, tickets do
 * Fale Conosco e assinaturas de alerta). Duas implementações:
 * - `MockSubmissionGateway` — desenvolvimento/demonstração: gera protocolo local e registra
 *   no log do servidor (sem dados pessoais no log);
 * - `CentralSubmissionGateway` — HTTP para a Central (`CENTRAL_SERVICOS_API_URL`).
 * Nunca há fallback silencioso em produção: sem Central configurada, o mock é usado apenas
 * quando `SUBMISSIONS_MODE=mock`.
 */
export interface SubmissionGateway {
  readonly mode: "mock" | "central";
  submitCommercialLead(lead: CommercialLead): Promise<SubmissionReceipt>;
  submitTicket(ticket: CreateTicketRequest): Promise<SubmissionReceipt>;
  subscribeAlerts(subscription: AlertSubscription): Promise<SubmissionReceipt>;
  /**
   * Consulta pública de protocolo (seção 9.6). Retorna status, assunto e mensagens do
   * solicitante — nunca dados de terceiros. `found: false` quando o protocolo não existe.
   */
  lookupTicket(protocol: string): Promise<TicketLookupResult>;
}

function localProtocol(prefix: string): string {
  const year = new Date().getFullYear();
  const random = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${year}-${random}`;
}

export class MockSubmissionGateway implements SubmissionGateway {
  readonly mode = "mock" as const;

  private receipt(prefix: string, queue: SubmissionReceipt["queue"]): SubmissionReceipt {
    const receipt = { protocol: localProtocol(prefix), receivedAt: new Date().toISOString(), queue };
    console.warn(`[submissions:mock] ${queue} recebido — protocolo ${receipt.protocol}`);
    return receipt;
  }

  async submitCommercialLead(lead: CommercialLead) {
    commercialLeadSchema.parse(lead);
    return this.receipt("COM", "COMERCIAL");
  }

  async submitTicket(ticket: CreateTicketRequest) {
    createTicketRequestSchema.parse(ticket);
    return this.receipt("ATD", "ATENDIMENTO");
  }

  async subscribeAlerts(subscription: AlertSubscription) {
    alertSubscriptionSchema.parse(subscription);
    return this.receipt("ALT", "ALERTAS");
  }

  /**
   * O mock não armazena chamados: qualquer protocolo é honestamente "não encontrado".
   * A interface orienta o candidato a consultar protocolos do sistema anterior no
   * atendimento legado (`INSTITUTION.legacySystems.service`).
   */
  async lookupTicket(_protocol: string): Promise<TicketLookupResult> {
    return { found: false, reason: "NOT_FOUND" };
  }
}

export class CentralSubmissionGateway implements SubmissionGateway {
  readonly mode = "central" as const;

  constructor(
    private readonly baseUrl: string,
    private readonly apiToken?: string,
  ) {}

  private async post(path: string, body: unknown, idempotencyKey: string): Promise<SubmissionReceipt> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Idempotency-Key": idempotencyKey,
        ...(this.apiToken ? { Authorization: `Bearer ${this.apiToken}` } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Central de Serviços respondeu ${response.status} em ${path}`);
    }
    return submissionReceiptSchema.parse(await response.json());
  }

  submitCommercialLead(lead: CommercialLead) {
    return this.post("/v1/portal/commercial-leads", commercialLeadSchema.parse(lead), crypto.randomUUID());
  }

  submitTicket(ticket: CreateTicketRequest) {
    return this.post("/v1/portal/tickets", createTicketRequestSchema.parse(ticket), crypto.randomUUID());
  }

  subscribeAlerts(subscription: AlertSubscription) {
    return this.post(
      "/v1/portal/alert-subscriptions",
      alertSubscriptionSchema.parse(subscription),
      crypto.randomUUID(),
    );
  }

  /** `GET /v1/portal/tickets/{protocol}` — 404 é um resultado válido (não encontrado). */
  async lookupTicket(protocol: string): Promise<TicketLookupResult> {
    const path = `/v1/portal/tickets/${encodeURIComponent(protocol)}`;
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(this.apiToken ? { Authorization: `Bearer ${this.apiToken}` } : {}),
      },
      cache: "no-store",
    });
    if (response.status === 404) {
      return { found: false, reason: "NOT_FOUND" };
    }
    if (!response.ok) {
      throw new Error(`Central de Serviços respondeu ${response.status} em ${path}`);
    }
    return ticketLookupResultSchema.parse(await response.json());
  }
}

let cached: SubmissionGateway | null = null;

export function getSubmissionGateway(): SubmissionGateway {
  if (cached) return cached;
  const baseUrl = process.env.CENTRAL_SERVICOS_API_URL;
  const mode = process.env.SUBMISSIONS_MODE ?? (baseUrl ? "central" : "mock");
  if (mode === "central" && baseUrl) {
    cached = new CentralSubmissionGateway(baseUrl, process.env.CENTRAL_SERVICOS_API_TOKEN);
  } else {
    if (process.env.NODE_ENV === "production" && mode !== "mock") {
      throw new Error(
        "CENTRAL_SERVICOS_API_URL não configurada em produção — defina a Central ou SUBMISSIONS_MODE=mock explicitamente.",
      );
    }
    cached = new MockSubmissionGateway();
  }
  return cached;
}
