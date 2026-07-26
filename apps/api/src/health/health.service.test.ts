import { describe, expect, it } from "vitest";
import { HealthService } from "./health.service";

describe("HealthService", () => {
  it("liveness retorna status ok imediatamente, sem dependências externas", () => {
    const service = new HealthService();
    const result = service.liveness();
    expect(result.status).toBe("ok");
    expect(result.checkedAt).toBeTruthy();
  });
});
