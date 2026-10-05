"use server";

import { ticketProtocolLookupSchema, type TicketLookupResult } from "@selecon/contracts";
import { getSubmissionGateway } from "@/lib/central/submissions";

export interface ProtocolLookupState {
  status: "idle" | "found" | "not_found" | "error";
  protocol?: string;
  message?: string;
  result?: Extract<TicketLookupResult, { found: true }>;
  errors?: Partial<Record<"protocol", string>>;
}

/**
 * Consulta pública de protocolo (seção 9.6). Mostra status, assunto e mensagens do próprio
 * chamado; nunca inventa um resultado — "não encontrado" é uma resposta honesta.
 */
export async function lookupProtocolAction(
  _previous: ProtocolLookupState,
  formData: FormData,
): Promise<ProtocolLookupState> {
  const raw = formData.get("protocol");
  const protocol = typeof raw === "string" ? raw.trim().toUpperCase() : "";

  const parsed = ticketProtocolLookupSchema.safeParse({ protocol });
  if (!parsed.success) {
    return {
      status: "error",
      protocol,
      message: "Revise o número do protocolo.",
      errors: { protocol: "Informe o protocolo completo, como consta no e-mail de confirmação." },
    };
  }

  try {
    const result = await getSubmissionGateway().lookupTicket(parsed.data.protocol);
    if (result.found) {
      return { status: "found", protocol: parsed.data.protocol, result };
    }
    if (result.reason === "UNAVAILABLE") {
      return {
        status: "error",
        protocol: parsed.data.protocol,
        message:
          "A consulta de protocolos está temporariamente indisponível. Tente novamente em alguns minutos.",
      };
    }
    return { status: "not_found", protocol: parsed.data.protocol };
  } catch {
    return {
      status: "error",
      protocol: parsed.data.protocol,
      message: "Não foi possível consultar o protocolo agora. Tente novamente em alguns minutos.",
    };
  }
}
