import { Global, Module } from "@nestjs/common";
import {
  CandidateMockProvider,
  EmailMockProvider,
  MessagingMockProvider,
  StorageMockProvider,
} from "@selecon/integrations";

export const CANDIDATE_PROVIDER = "CANDIDATE_PROVIDER";
export const EMAIL_PROVIDER = "EMAIL_PROVIDER";
export const MESSAGING_PROVIDER = "MESSAGING_PROVIDER";
export const STORAGE_PROVIDER = "STORAGE_PROVIDER";

/**
 * Nesta fase, `INTEGRATIONS_MODE` só suporta "mock" (ver docs/INTEGRATIONS.md) — nenhuma
 * credencial real foi fornecida para Microsoft Graph, WhatsApp Cloud API, sistema do
 * candidato ou storage. Quando as implementações reais existirem, este módulo passa a
 * escolher a implementação por `INTEGRATIONS_MODE`.
 */
@Global()
@Module({
  providers: [
    { provide: CANDIDATE_PROVIDER, useClass: CandidateMockProvider },
    { provide: EMAIL_PROVIDER, useClass: EmailMockProvider },
    { provide: MESSAGING_PROVIDER, useClass: MessagingMockProvider },
    { provide: STORAGE_PROVIDER, useClass: StorageMockProvider },
  ],
  exports: [CANDIDATE_PROVIDER, EMAIL_PROVIDER, MESSAGING_PROVIDER, STORAGE_PROVIDER],
})
export class IntegrationsModule {}
