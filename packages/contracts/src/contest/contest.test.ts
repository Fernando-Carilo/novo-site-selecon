import { describe, expect, it } from "vitest";
import { contestPublicationApprovalSchema } from "./contest.js";

describe("contestPublicationApprovalSchema", () => {
  it("rejeita quando autor e aprovador são o mesmo usuário", () => {
    const result = contestPublicationApprovalSchema.safeParse({
      contestId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      authorUserId: "3fa85f64-5717-4562-b3fc-2c963f66afa7",
      approverUserId: "3fa85f64-5717-4562-b3fc-2c963f66afa7",
    });

    expect(result.success).toBe(false);
  });

  it("aceita quando autor e aprovador são diferentes", () => {
    const result = contestPublicationApprovalSchema.safeParse({
      contestId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      authorUserId: "3fa85f64-5717-4562-b3fc-2c963f66afa7",
      approverUserId: "3fa85f64-5717-4562-b3fc-2c963f66afa8",
    });

    expect(result.success).toBe(true);
  });
});
