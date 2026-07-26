import argon2 from "argon2";

/**
 * Hash de senha para autenticação de desenvolvimento (provider LOCAL_DEV — ver
 * ADR sobre autenticação). Argon2id é o algoritmo recomendado pela OWASP para
 * hashing de senha (regra 12.1). Em produção real, este mecanismo é substituído
 * por SSO/OIDC (seção 10.7) — nunca reative texto puro.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plainPassword: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch {
    return false;
  }
}

/** Gera uma senha temporária legível, usada apenas no seed/provisionamento inicial. */
export function generateTemporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
