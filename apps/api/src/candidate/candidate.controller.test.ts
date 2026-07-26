import { CandidateMockProvider } from "@selecon/integrations";
import { describe, expect, it } from "vitest";
import { CandidateController } from "./candidate.controller.js";

describe("CandidateController", () => {
  const controller = new CandidateController(new CandidateMockProvider());

  it("retorna a URL de login do sistema do candidato", async () => {
    const result = await controller.signInUrl("contest-1");
    expect(result.url).toContain("login");
  });

  it("agrega inscrição, pagamento, cartão de confirmação, recursos e resultados em um único painel", async () => {
    const dashboard = await controller.dashboard("candidato-teste", "contest-1");
    expect(dashboard.registration.status).toBe("CONFIRMED");
    expect(dashboard.payment.status).toBe("PAID");
    expect(dashboard.examCardUrl).toBeNull();
    expect(Array.isArray(dashboard.appeals)).toBe(true);
    expect(Array.isArray(dashboard.results)).toBe(true);
  });
});
