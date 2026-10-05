"use server";

import { alertSubscriptionSchema } from "@selecon/contracts";
import { getSubmissionGateway } from "@/lib/central/submissions";

export interface AlertsFormState {
  status: "idle" | "success" | "error";
  message?: string;
  protocol?: string;
  errors?: Partial<Record<"email" | "privacyConsent", string>>;
}

/** Assinatura de alertas de novos editais (seção 9.4) — consentimento explícito, sem dados extras. */
export async function subscribeAlertsAction(
  _previous: AlertsFormState,
  formData: FormData,
): Promise<AlertsFormState> {
  const parsed = alertSubscriptionSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    contestSlug: formData.get("contestSlug") ? String(formData.get("contestSlug")) : undefined,
    uf: formData.get("uf") ? String(formData.get("uf")) : undefined,
    privacyConsent: formData.get("privacyConsent") === "on" ? true : undefined,
  });

  if (!parsed.success) {
    const errors: AlertsFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "email") errors.email = "Informe um e-mail válido.";
      if (key === "privacyConsent") errors.privacyConsent = issue.message;
    }
    return { status: "error", message: "Revise os campos destacados.", errors };
  }

  try {
    const receipt = await getSubmissionGateway().subscribeAlerts(parsed.data);
    return {
      status: "success",
      protocol: receipt.protocol,
      message: "Assinatura registrada. Você receberá um e-mail de confirmação para ativar os alertas.",
    };
  } catch {
    return {
      status: "error",
      message: "Não foi possível registrar a assinatura agora. Tente novamente em alguns minutos.",
    };
  }
}
