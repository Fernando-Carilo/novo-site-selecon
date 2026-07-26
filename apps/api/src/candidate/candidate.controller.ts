import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { CandidateDashboard } from "@selecon/contracts";
import type { CandidateProvider } from "@selecon/integrations";
import { Public } from "../auth/public.decorator.js";
import { CANDIDATE_PROVIDER } from "../integrations/integrations.module.js";

/**
 * Área do candidato (seção 11.4) — camada de experiência sobre o `CandidateProvider`.
 * Nesta fase usa exclusivamente `CandidateMockProvider` (dados fictícios determinísticos):
 * o contrato real do sistema do candidato ainda não foi confirmado (ver
 * docs/INTEGRATIONS.md, item 3) — nenhuma credencial real existe ou pode ser substituída
 * por mock seguro além do que já está implementado aqui.
 */
@ApiTags("public-candidate")
@Controller("public/candidate")
@Public()
export class CandidateController {
  constructor(@Inject(CANDIDATE_PROVIDER) private readonly provider: CandidateProvider) {}

  @Get("sign-in-url")
  async signInUrl(@Query("contestId") contestId?: string): Promise<{ url: string }> {
    const url = await this.provider.getSignInUrl(contestId ? { contestId } : undefined);
    return { url };
  }

  @Get("registration-url")
  async registrationUrl(@Query("contestId") contestId: string): Promise<{ url: string }> {
    return { url: await this.provider.getRegistrationUrl(contestId) };
  }

  @Get("dashboard")
  async dashboard(
    @Query("candidateRef") candidateRef: string,
    @Query("contestId") contestId: string,
  ): Promise<CandidateDashboard> {
    const [registration, payment, examCardUrl, appeals, results] = await Promise.all([
      this.provider.getRegistrationSummary(candidateRef, contestId),
      this.provider.getPaymentStatus(candidateRef, contestId),
      this.provider.getExamCardUrl(candidateRef, contestId),
      this.provider.getAppeals(candidateRef, contestId),
      this.provider.getResults(candidateRef, contestId),
    ]);
    return { registration, payment, examCardUrl, appeals, results };
  }
}
