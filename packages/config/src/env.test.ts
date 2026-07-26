import { describe, expect, it } from "vitest";
import { baseEnvSchema, parseEnv } from "./env.js";

describe("parseEnv", () => {
  it("aceita variáveis válidas e aplica defaults", () => {
    const env = parseEnv(baseEnvSchema, {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/selecon",
      REDIS_URL: "redis://localhost:6379",
    });

    expect(env.NODE_ENV).toBe("development");
    expect(env.LOG_LEVEL).toBe("info");
    expect(env.DATABASE_URL).toContain("postgresql://");
  });

  it("falha rápido quando uma variável obrigatória está ausente", () => {
    expect(() =>
      parseEnv(baseEnvSchema, {
        REDIS_URL: "redis://localhost:6379",
      }),
    ).toThrow(/DATABASE_URL/);
  });

  it("rejeita NODE_ENV inválido", () => {
    expect(() =>
      parseEnv(baseEnvSchema, {
        NODE_ENV: "staging",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/selecon",
        REDIS_URL: "redis://localhost:6379",
      }),
    ).toThrow();
  });
});
