import { verifyPassword } from "@selecon/auth";
import { prisma } from "@selecon/db";
import { afterAll, describe, expect, it } from "vitest";
import { AuditService } from "../audit/audit.service.js";
import { UsersService } from "./users.service.js";

describe("UsersService (integração real com Postgres)", () => {
  const service = new UsersService(new AuditService());
  const actorUserId = "66666666-6666-6666-6666-666666666666";
  const createdUserIds: string[] = [];

  afterAll(async () => {
    await prisma.session.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.userRole.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  async function createUser() {
    const result = await service.create(
      {
        email: `usuario-teste-${Date.now()}@selecon.example`,
        displayName: "Usuário de teste",
        roleKey: "READ_ONLY",
      },
      actorUserId,
    );
    createdUserIds.push(result.user.id);
    return result;
  }

  it("cria usuário com senha temporária com hash Argon2id e exige troca no primeiro login", async () => {
    const { user, credential } = await createUser();
    expect(user.mustChangePassword).toBe(true);
    expect(user.roles).toHaveLength(1);
    expect(user.roles[0]?.roleKey).toBe("READ_ONLY");

    const stored = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(stored.passwordHash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(stored.passwordHash!, credential.temporaryPassword)).toBe(true);
  });

  it("desativar usuário revoga todas as sessões ativas", async () => {
    const { user } = await createUser();
    const token = "session-token-de-teste";
    const { hashSessionToken } = await import("@selecon/auth");
    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: hashSessionToken(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await service.setActive(user.id, false, actorUserId);

    const sessions = await prisma.session.findMany({ where: { userId: user.id } });
    expect(sessions.every((s) => s.revokedAt !== null)).toBe(true);
  });

  it("redefinir senha gera uma nova credencial e revoga sessões ativas", async () => {
    const { user, credential: original } = await createUser();
    const { hashSessionToken } = await import("@selecon/auth");
    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: hashSessionToken("outro-token"),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const reset = await service.resetPassword(user.id, actorUserId);
    expect(reset.temporaryPassword).not.toBe(original.temporaryPassword);

    const stored = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(await verifyPassword(stored.passwordHash!, reset.temporaryPassword)).toBe(true);
    expect(stored.mustChangePassword).toBe(true);

    const sessions = await prisma.session.findMany({ where: { userId: user.id } });
    expect(sessions.every((s) => s.revokedAt !== null)).toBe(true);
  });

  it("atribui e revoga perfis, refletindo apenas atribuições ativas", async () => {
    const { user } = await createUser();
    const updated = await service.assignRole(user.id, "AUDITOR", actorUserId);
    expect(updated.roles.map((r) => r.roleKey).sort()).toEqual(["AUDITOR", "READ_ONLY"]);

    const readOnlyRole = updated.roles.find((r) => r.roleKey === "READ_ONLY")!;
    const afterRevoke = await service.revokeRole(user.id, readOnlyRole.id, actorUserId);
    expect(afterRevoke.roles.map((r) => r.roleKey)).toEqual(["AUDITOR"]);
  });
});
