import { PrismaClient } from "../generated/client/index.js";

/**
 * Singleton do Prisma Client, evitando múltiplas instâncias em hot-reload de
 * desenvolvimento (padrão recomendado pela documentação do Prisma para Next.js/Node).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
