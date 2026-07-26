import { healthy } from "../health-status.js";
import type {
  AppealSummary,
  CandidateContext,
  CandidateProvider,
  PaymentStatus,
  RegistrationSummary,
  ResultSummary,
} from "./candidate-provider.js";

/**
 * Dados fictícios e determinísticos — usados em desenvolvimento/demo enquanto o contrato
 * real do sistema do candidato não é confirmado (ver docs/INTEGRATIONS.md, item 3).
 */
export class CandidateMockProvider implements CandidateProvider {
  async healthCheck() {
    return healthy("CandidateMockProvider — sem dependência externa real");
  }

  async getSignInUrl(_context?: CandidateContext): Promise<string> {
    return "https://mock-candidato.selecon.org.br/login";
  }

  async getRegistrationUrl(contestId: string): Promise<string> {
    return `https://mock-candidato.selecon.org.br/concursos/${contestId}/inscricao`;
  }

  async getRegistrationSummary(
    candidateRef: string,
    contestId: string,
  ): Promise<RegistrationSummary> {
    return {
      registrationId: `mock-${candidateRef}-${contestId}`,
      status: "CONFIRMED",
      submittedAt: new Date().toISOString(),
    };
  }

  async getPaymentStatus(_candidateRef: string, _contestId: string): Promise<PaymentStatus> {
    return { status: "PAID" };
  }

  async getExamCardUrl(_candidateRef: string, _contestId: string): Promise<string | null> {
    return null;
  }

  async getAppeals(_candidateRef: string, _contestId: string): Promise<AppealSummary[]> {
    return [];
  }

  async getResults(_candidateRef: string, _contestId: string): Promise<ResultSummary[]> {
    return [];
  }
}
