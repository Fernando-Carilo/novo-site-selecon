import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password.js";

describe("password hashing", () => {
  it("gera um hash Argon2id verificável com a senha correta", async () => {
    const hash = await hashPassword("Senha-Correta-123!");
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(hash, "Senha-Correta-123!")).toBe(true);
  });

  it("rejeita senha incorreta", async () => {
    const hash = await hashPassword("Senha-Correta-123!");
    expect(await verifyPassword(hash, "senha-errada")).toBe(false);
  });

  it("nunca retorna a senha em texto puro no hash", async () => {
    const hash = await hashPassword("segredo-super-secreto");
    expect(hash).not.toContain("segredo-super-secreto");
  });
});
