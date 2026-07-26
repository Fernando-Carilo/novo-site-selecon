import type { Job } from "bullmq";
import type { Logger } from "@selecon/observability";

export interface ExampleJobData {
  message: string;
}

/**
 * Job de exemplo — confirma que a infraestrutura de filas (Redis + BullMQ) está
 * funcionando de ponta a ponta. Jobs de negócio reais chegam a partir da Fase 4+.
 */
export async function processExampleJob(job: Job<ExampleJobData>, logger: Logger): Promise<void> {
  logger.info({ jobId: job.id, data: job.data }, "Processando example job");
}
