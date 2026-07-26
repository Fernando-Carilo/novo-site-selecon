import type { Job } from "bullmq";
import { describe, expect, it, vi } from "vitest";
import { createLogger } from "@selecon/observability";
import { processExampleJob } from "./example-job.js";

describe("processExampleJob", () => {
  it("loga a mensagem do job sem lançar erro", async () => {
    const logger = createLogger("test", "silent");
    const infoSpy = vi.spyOn(logger, "info");
    const job = { id: "1", data: { message: "olá" } } as Job<{ message: string }>;

    await processExampleJob(job, logger);

    expect(infoSpy).toHaveBeenCalled();
  });
});
