import { describe, expect, it } from "vitest";
import { generateSessionToken, hashSessionToken, safeCompareHash } from "./session-token.js";

describe("session token", () => {
  it("gera tokens distintos e com entropia suficiente", () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(32);
  });

  it("o hash é determinístico para o mesmo token", () => {
    const token = generateSessionToken();
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
  });

  it("safeCompareHash confirma igualdade e rejeita diferença", () => {
    const token = generateSessionToken();
    const hash = hashSessionToken(token);
    expect(safeCompareHash(hash, hashSessionToken(token))).toBe(true);
    expect(safeCompareHash(hash, hashSessionToken(generateSessionToken()))).toBe(false);
  });
});
