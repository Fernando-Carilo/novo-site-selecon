/**
 * Chamadas server-side (Server Components/Server Actions) direto para
 * apps/api — não passam pelo proxy `/api/*` (que existe para o navegador).
 * Usado para dados públicos que não dependem de sessão do usuário.
 */
const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:3001/api";

export async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_INTERNAL_URL}${path}`, {
    ...init,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchApiOrNull<T>(path: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(`${API_INTERNAL_URL}${path}`, {
    ...init,
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Falha ao consultar ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
