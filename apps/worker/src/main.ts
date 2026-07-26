import { Worker } from "bullmq";
import { createLogger } from "@selecon/observability";
import { loadWorkerEnv } from "./env.js";
import { processExampleJob } from "./jobs/example-job.js";
import { QUEUE_NAMES } from "./queues.js";

const logger = createLogger("worker");

function parseRedisConnection(redisUrl: string) {
  const url = new URL(redisUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    password: url.password || undefined,
  };
}

async function bootstrap() {
  const env = loadWorkerEnv();
  const connection = parseRedisConnection(env.REDIS_URL);

  const exampleWorker = new Worker(QUEUE_NAMES.example, (job) => processExampleJob(job, logger), {
    connection,
  });

  exampleWorker.on("ready", () => logger.info("apps/worker pronto e conectado ao Redis"));
  exampleWorker.on("failed", (job, error) =>
    logger.error({ jobId: job?.id, err: error }, "Falha ao processar job"),
  );

  const shutdown = async () => {
    logger.info("Encerrando apps/worker...");
    await exampleWorker.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error) => {
  logger.error({ err: error }, "Falha ao iniciar apps/worker");
  process.exitCode = 1;
});
