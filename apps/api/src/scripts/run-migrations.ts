import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
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
 * O prisma CLI é localizado via require.resolve para funcionar tanto em dev (pnpm
 * workspace com symlinks) quanto em produção (pnpm deploy --prod, flat node_modules).
 */
const LOCK_KEY = 872364;
const logger = createLogger("migrate");

function findPrismaBin(): string {
  try {
    // Resolve the prisma package entry point, then navigate to the CLI
    const prismaPackage = require.resolve("prisma/package.json");
    return resolve(dirname(prismaPackage), "build", "index.js");
  } catch {
    // Fallback: try common pnpm deploy path
    return resolve("node_modules", "prisma", "build", "index.js");
  }
}

async function main() {
  await prisma.$executeRawUnsafe(`SELECT pg_advisory_lock(${LOCK_KEY})`);
  try {
    logger.info("Aplicando migrações (prisma migrate deploy)...");
    const prismaCli = findPrismaBin();
    logger.info(`Prisma CLI encontrado em: ${prismaCli}`);
    execFileSync(
      "node",
      [prismaCli, "migrate", "deploy", "--schema", "packages/db/prisma/schema.prisma"],
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
