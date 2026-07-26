import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export const CORRELATION_HEADER = "x-correlation-id";

const storage = new AsyncLocalStorage<string>();

/** Executa `fn` com um correlation ID definido no contexto assíncrono atual. */
export function withCorrelationId<T>(correlationId: string | undefined, fn: () => T): T {
  return storage.run(correlationId ?? randomUUID(), fn);
}

/** Lê o correlation ID do contexto assíncrono atual, gerando um novo se não houver nenhum. */
export function getCorrelationId(): string {
  return storage.getStore() ?? randomUUID();
}
