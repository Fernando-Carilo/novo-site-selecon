import { hashPassword } from "@selecon/auth";
import { prisma } from "@selecon/db";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AuditService } from "../audit/audit.service.js";
import { AuthService } from "./auth.service.js";

/**
 * Teste de integração real contra o Postgres local (mesma DATABASE_URL do
 * ambiente de desenvolvimento) — cria e remove um usuário descartável próprio,
 * sem depender do estado do seed.
 */
describe("AuthService (integração real com Postgres)", () => {
  const email = `auth-integration-${Date.now()}@selecon.example`;
  const initialPassword = "SenhaInicial123!";
  let userId: string;
  const service = new AuthService(new AuditService());

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email,
        displayName: "Usuário de Teste de Integração",
        passwordHash: await hashPassword(initialPassword),
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.loginEvent.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("autentica com senha correta e cria uma sessão real", async () => {
    const result = await service.login(email, initialPassword);
    expect(result.token).toBeTruthy();

    const session = await prisma.session.findFirst({ where: { userId } });
    expect(session).not.toBeNull();
    expect(session?.tokenHash).not.toBe(result.token);
  });

  it("rejeita senha incorreta e registra LoginEvent de falha", async () => {
    await expect(service.login(email, "senha-errada")).rejects.toThrow();

    const failure = await prisma.loginEvent.findFirst({
      where: { userId, result: "FAILURE" },
    });
    expect(failure).not.toBeNull();
  });

  it("logout revoga a sessão", async () => {
    const login = await service.login(email, initialPassword);
    const session = await prisma.session.findFirstOrThrow({ where: { userId, revokedAt: null } });

    await service.logout(session.id, userId);

    const revoked = await prisma.session.findUniqueOrThrow({ where: { id: session.id } });
    expect(revoked.revokedAt).not.toBeNull();
    expect(login.token).toBeTruthy();
  });

  it("changePassword exige a senha atual correta", async () => {
    await expect(service.changePassword(userId, "senha-errada", "NovaSenha456!")).rejects.toThrow();
  });

  it("changePassword atualiza o hash e permite login com a nova senha", async () => {
    await service.changePassword(userId, initialPassword, "NovaSenha456!");
    const result = await service.login(email, "NovaSenha456!");
    expect(result.token).toBeTruthy();
  });
});
