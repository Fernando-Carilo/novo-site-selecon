"use client";

/**
 * Chamadas client-side — sempre via `/api/*` (mesma origem, proxy para apps/api).
 *
 * Só define `Content-Type: application/json` quando há corpo. O Fastify (apps/api)
 * rejeita com 400 qualquer requisição com esse header e corpo vazio (ex.: um POST de
 * ação sem payload, como logout) — um bug real encontrado pela suíte E2E
 * (e2e/tests/admin-auth.spec.ts) no botão de logout, que chamava `apiFetch(path, {
 * method: "POST" })` sem `body`.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(body.message ?? "Erro na requisição", response.status, body);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
  }
}
