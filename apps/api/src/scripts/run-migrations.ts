import { execFileSync } from "node:child_process";
import { createLogger } from "@selecon/observability";
import { prisma } from "@selecon/db";

/**
 * Executor de migrações — pensado para rodar no boot do container (entrypoint.sh)
 * antes de qualquer processo da aplicação aceitar tráfego.
 *
 * `pg_advisory_lock` (nível de sessão) evita que duas execuções concorrentes apliquem
 * migrações em paralelo — usa o Prisma Client já configurado (mesma DATABASE_URL
 * composta em packages/db/src/client.ts), sem depender do pacote "pg" separado, que não
 * é uma dependência do projeto.
 *
 * O prisma CLI é instalado explicitamente na imagem final (ver Dockerfile, stage
 * "runner") e fica disponível em node_modules/.bin/prisma dentro de /app/apps/api-deploy.
 */
const LOCK_KEY = 872364;
const logger = createLogger("migrate");

async function main() {
  await prisma.$executeRawUnsafe(`SELECT pg_advisory_lock(${LOCK_KEY})`);
  try {
    logger.info("Aplicando migrações (prisma migrate deploy)...");
    execFileSync(
      "node",
      [
        "node_modules/prisma/build/index.js",
        "migrate",
        "deploy",
        "--schema",
        "packages/db/prisma/schema.prisma",
      ],
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
