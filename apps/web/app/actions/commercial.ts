"use server";

import { commercialLeadSchema, type CommercialLead } from "@selecon/contracts";
import { getSubmissionGateway } from "@/lib/central/submissions";

export type CommercialLeadField = Exclude<keyof CommercialLead, "source">;

export interface CommercialLeadFormState {
  status: "idle" | "success" | "error";
  message?: string;
  protocol?: string;
  errors?: Partial<Record<CommercialLeadField, string>>;
  /** Valores enviados, devolvidos ao formulário para não perder o preenchimento após erro. */
  values?: Partial<Record<CommercialLeadField, string>>;
}

const FIELD_MESSAGES: Record<CommercialLeadField, string> = {
  organizationName: "Informe o nome do órgão ou instituição (mínimo de 2 caracteres).",
  organizationSphere: "Selecione a esfera ou natureza do órgão.",
  uf: "Selecione o estado.",
  city: "Informe o município (mínimo de 2 caracteres).",
  contactName: "Informe o nome da pessoa de contato.",
  contactRole: "Informe o cargo ou função da pessoa de contato.",
  email: "Informe um e-mail institucional válido.",
  phone: "Informe um telefone com DDD (mínimo de 8 dígitos).",
  projectType: "Selecione o tipo de projeto.",
  estimatedCandidates: "Selecione a estimativa de candidatos.",
  expectedStart: "Use no máximo 60 caracteres (ex.: 1º semestre de 2027).",
  hasTermOfReference: "Valor inválido.",
  message: "Descreva a demanda com pelo menos 10 caracteres (máximo de 5.000).",
  privacyConsent: "É necessário aceitar o aviso de privacidade.",
};

const TEXT_FIELDS: CommercialLeadField[] = [
  "organizationName",
  "organizationSphere",
  "uf",
  "city",
  "contactName",
  "contactRole",
  "email",
  "phone",
  "projectType",
  "estimatedCandidates",
  "expectedStart",
  "message",
];

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Lead comercial (seção 9.8): entra na fila COMERCIAL da Central de Serviços, classificado por
 * `projectType`. Validação server-side com o contrato compartilhado; nada é registrado em log.
 */
export async function submitCommercialLeadAction(
  _previous: CommercialLeadFormState,
  formData: FormData,
): Promise<CommercialLeadFormState> {
  const values: CommercialLeadFormState["values"] = {};
  for (const field of TEXT_FIELDS) values[field] = text(formData, field);
  values.hasTermOfReference = formData.get("hasTermOfReference") === "on" ? "on" : "";
  values.privacyConsent = formData.get("privacyConsent") === "on" ? "on" : "";

  const parsed = commercialLeadSchema.safeParse({
    organizationName: values.organizationName,
    organizationSphere: values.organizationSphere,
    uf: values.uf?.toUpperCase(),
    city: values.city,
    contactName: values.contactName,
    contactRole: values.contactRole,
    email: values.email?.toLowerCase(),
    phone: values.phone,
    projectType: values.projectType,
    estimatedCandidates: values.estimatedCandidates,
    expectedStart: values.expectedStart ? values.expectedStart : undefined,
    hasTermOfReference: values.hasTermOfReference === "on",
    message: values.message,
    privacyConsent: values.privacyConsent === "on" ? true : undefined,
    source: "portal-comercial",
  });

  if (!parsed.success) {
    const errors: CommercialLeadFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && key in FIELD_MESSAGES && !errors[key as CommercialLeadField]) {
        errors[key as CommercialLeadField] = FIELD_MESSAGES[key as CommercialLeadField];
      }
    }
    return {
      status: "error",
      message: "Revise os campos destacados antes de enviar.",
      errors,
      values,
    };
  }

  try {
    const receipt = await getSubmissionGateway().submitCommercialLead(parsed.data);
    return {
      status: "success",
      protocol: receipt.protocol,
      message:
        "Solicitação registrada na fila comercial. A equipe comercial responde pelo e-mail informado, em dias úteis.",
    };
  } catch {
    return {
      status: "error",
      message:
        "Não foi possível registrar a solicitação agora. Tente novamente em alguns minutos ou escreva para o e-mail comercial.",
      values,
    };
  }
}
