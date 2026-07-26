import type { HealthStatus } from "@selecon/contracts";

export interface CandidateContext {
  contestId?: string;
  returnUrl?: string;
}

export interface RegistrationSummary {
  registrationId: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  position?: string;
  submittedAt: string;
}

export interface PaymentStatus {
  status: "PENDING" | "PAID" | "EXEMPT" | "OVERDUE";
  amountCents?: number;
  dueDate?: string;
  secondCopyUrl?: string | null;
}

export interface AppealSummary {
  appealId: string;
  subject: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
  submittedAt: string;
}

export interface ResultSummary {
  stage: string;
  status: "APPROVED" | "NOT_APPROVED" | "PENDING";
  score?: number;
  publishedAt?: string;
}

/**
 * Contrato do sistema do candidato existente — conforme seção 11.4 do prompt mestre.
 * Nenhuma implementação real existe ainda (ver docs/INTEGRATIONS.md): o contrato real
 * do provedor atual precisa ser confirmado antes de qualquer implementação além do mock.
 * Quando o provedor não oferecer uma API para uma dada operação, a implementação real deve
 * usar deep link assinado/redirecionamento explícito — nunca inventar um endpoint (regra 9.5).
 */
export interface CandidateProvider {
  healthCheck(): Promise<HealthStatus>;
  getSignInUrl(context?: CandidateContext): Promise<string>;
  getRegistrationUrl(contestId: string): Promise<string>;
  getRegistrationSummary(candidateRef: string, contestId: string): Promise<RegistrationSummary>;
  getPaymentStatus(candidateRef: string, contestId: string): Promise<PaymentStatus>;
  getExamCardUrl(candidateRef: string, contestId: string): Promise<string | null>;
  getAppeals(candidateRef: string, contestId: string): Promise<AppealSummary[]>;
  getResults(candidateRef: string, contestId: string): Promise<ResultSummary[]>;
}
