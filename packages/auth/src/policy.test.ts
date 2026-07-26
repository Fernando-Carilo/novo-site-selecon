import { describe, expect, it } from "vitest";
import { authorize } from "./policy.js";

describe("authorize", () => {
  it("nega quando nenhum papel concede a permissão", () => {
    const decision = authorize(
      { userId: "u1", roles: ["READ_ONLY"] },
      { permission: "contest:publish" },
    );
    expect(decision.allowed).toBe(false);
  });

  it("permite quando o papel concede a permissão e não há escopo exigido", () => {
    const decision = authorize(
      { userId: "u1", roles: ["CONTEST_ADMIN"] },
      { permission: "contest:publish" },
    );
    expect(decision.allowed).toBe(true);
  });

  it("nega quando há escopo exigido mas o usuário não o possui", () => {
    const decision = authorize(
      { userId: "u1", roles: ["CONTEST_EDITOR"], scopes: [{ contestId: "outro-concurso" }] },
      { permission: "contest:write", resourceScope: { contestId: "concurso-123" } },
    );
    expect(decision.allowed).toBe(false);
  });

  it("permite quando o escopo do usuário corresponde ao escopo exigido", () => {
    const decision = authorize(
      { userId: "u1", roles: ["CONTEST_EDITOR"], scopes: [{ contestId: "concurso-123" }] },
      { permission: "contest:write", resourceScope: { contestId: "concurso-123" } },
    );
    expect(decision.allowed).toBe(true);
  });
});
