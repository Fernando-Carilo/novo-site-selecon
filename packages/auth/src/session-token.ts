import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Token de sessão opaco (CSPRNG) — o valor em si só existe no cookie do cliente.
 * O banco armazena apenas `hashSessionToken(token)` (SHA-256), nunca o token em
 * texto puro, seguindo o mesmo padrão de proteção usado para código de denúncia
 * (seção 12.3) — um vazamento do banco não permite sequestrar sessões ativas.
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Comparação em tempo constante — evita ataques de timing na busca por hash. */
export function safeCompareHash(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}
