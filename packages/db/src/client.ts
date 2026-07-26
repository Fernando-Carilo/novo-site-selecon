import { PrismaClient } from "../generated/client/index.js";

/**
 * Em produção (ECS), o segredo do RDS injetado pelo Secrets Manager só permite
 * mapear UM campo por variável de ambiente — por isso `DB_HOST`/`DB_PORT`/`DB_USER`/
 * `DB_PASSWORD`/`DB_NAME` chegam separados (ver infrastructure/cdk/lib/selecon-portal-stack.ts),
 * nunca uma `DATABASE_URL` já pronta vinda do Secrets Manager (que seria o JSON bruto
 * do segredo, não uma connection string válida para o Prisma). Se `DATABASE_URL` já
 * estiver definida (desenvolvimento local via `.env`), ela é respeitada como está.
 */
function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME) return undefined;

  const url = `postgresql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${encodeURIComponent(DB_NAME)}?schema=public`;
  process.env.DATABASE_URL = url;
  return url;
}

resolveDatabaseUrl();

/**
 * Singleton do Prisma Client, evitando múltiplas instâncias em hot-reload de
 * desenvolvimento (padrão recomendado pela documentação do Prisma para Next.js/Node).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
