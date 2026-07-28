import { execFileSync } from "node:child_process";
import { createLogger } from "@selecon/observability";
import { prisma } from "@selecon/db";

/**
 * Executor de migrações — pensado para rodar como comando único de uma task Fargate
 * avulsa (`aws ecs run-task` com override de comando sobre a task definition da api,
 * que já tem a rede/segredos corretos para alcançar o RDS — ver
 * scripts/build-push-deploy-dev.sh). Nunca roda como parte do boot normal da API
 * (regra: migração é um passo único e controlado, não algo que cada réplica repete).
 *
 * `pg_advisory_lock` (nível de sessão) evita que duas execuções concorrentes apliquem
 * migrações em paralelo — usa o Prisma Client já configurado (mesma DATABASE_URL
 * composta em packages/db/src/client.ts), sem depender do pacote "pg" separado, que não
 * é uma dependência do projeto.
 */
const LOCK_KEY = 872364;
const logger = createLogger("migrate");

async function main() {
  await prisma.$executeRawUnsafe(`SELECT pg_advisory_lock(${LOCK_KEY})`);
  try {
    logger.info("Aplicando migrações (prisma migrate deploy)...");
    execFileSync(
      "node_modules/.bin/prisma",
      ["migrate", "deploy", "--schema", "packages/db/prisma/schema.prisma"],
      { stdio: "inherit" },
    );
    logger.info("Migrações aplicadas com sucesso.");
  } finally {
    await prisma.$executeRawUnsafe(`SELECT pg_advisory_unlock(${LOCK_KEY})`);
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  logger.error({ err: error }, "Falha ao aplicar migrações");
  process.exitCode = 1;
});
