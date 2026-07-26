import { randomInt } from "node:crypto";

/** Protocolo legível e não sequencial (evita enumeração — regra 12.1). */
export function generateProtocol(prefix: string): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = randomInt(100000, 999999);
  return `${prefix}-${datePart}-${randomPart}`;
}
