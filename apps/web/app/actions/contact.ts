"use server";

import { createTicketRequestSchema } from "@selecon/contracts";
import { getSubmissionGateway } from "@/lib/central/submissions";
import { findContactSubject } from "@/lib/service/faq";

export type ContactField =
  | "name"
  | "email"
  | "phone"
  | "contestSlug"
  | "subject"
  | "preferredChannel"
  | "description"
  | "privacyConsent";

export interface ContactFormState {
  status: "idle" | "success" | "error";
  message?: string;
  protocol?: string;
  errors?: Partial<Record<ContactField, string>>;
  /** Valores enviados, devolvidos ao formulário para não perder o preenchimento após erro. */
  values?: Partial<Record<ContactField, string>>;
}

const FIELD_MESSAGES: Record<ContactField, string> = {
  name: "Informe seu nome completo.",
  email: "Informe um e-mail válido — a resposta será enviada para ele.",
  phone: "Telefone inválido.",
  contestSlug: "Selecione um concurso válido ou a opção “Não se refere a um concurso”.",
  subject: "Selecione o assunto.",
  preferredChannel: "Selecione o canal preferido de resposta.",
  description: "Descreva sua solicitação (máximo de 5.000 caracteres).",
  privacyConsent: "É necessário aceitar o aviso de privacidade.",
};

const TEXT_FIELDS: ContactField[] = [
  "name",
  "email",
  "phone",
  "contestSlug",
  "subject",
  "preferredChannel",
  "description",
];

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Fale Conosco (seção 9.6): gera ticket na fila ATENDIMENTO da Central com protocolo.
 * O assunto é enviado com o rótulo legível; o concurso vai em `contestSlug` (slug público).
 * Nenhum dado pessoal é registrado em log.
 */
export async function submitContactAction(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values: ContactFormState["values"] = {};
  for (const field of TEXT_FIELDS) values[field] = text(formData, field);
  values.privacyConsent = formData.get("privacyConsent") === "on" ? "on" : "";

  const errors: ContactFormState["errors"] = {};
  const subject = findContactSubject(values.subject);
  if (!subject) {
    errors.subject = FIELD_MESSAGES.subject;
  } else if (subject.id === "COMERCIAL") {
    errors.subject =
      "Solicitações de proposta e contratação são atendidas pela área comercial, no formulário da página Para órgãos públicos.";
  }

  const parsed = createTicketRequestSchema.safeParse({
    name: values.name,
    email: values.email?.toLowerCase(),
    phone: values.phone ? values.phone : undefined,
    contestSlug: values.contestSlug ? values.contestSlug : undefined,
    subject: subject?.label ?? "",
    preferredChannel: values.preferredChannel,
    description: values.description,
    privacyConsent: values.privacyConsent === "on" ? true : undefined,
  });

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && key in FIELD_MESSAGES && !errors[key as ContactField]) {
        errors[key as ContactField] = FIELD_MESSAGES[key as ContactField];
      }
    }
  }

  if (Object.keys(errors).length > 0 || !parsed.success) {
    return {
      status: "error",
      message: "Revise os campos destacados antes de enviar.",
      errors,
      values,
    };
  }

  try {
    const receipt = await getSubmissionGateway().submitTicket(parsed.data);
    return {
      status: "success",
      protocol: receipt.protocol,
      message:
        "Chamado registrado. Guarde o protocolo: a resposta será enviada ao e-mail informado, em dias úteis, e o andamento pode ser consultado na Central de atendimento.",
    };
  } catch {
    return {
      status: "error",
      message:
        "Não foi possível registrar o chamado agora. Tente novamente em alguns minutos ou utilize o e-mail do Fale Conosco.",
      values,
    };
  }
}
