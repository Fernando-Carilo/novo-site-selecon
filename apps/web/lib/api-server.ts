/**
 * Chamadas server-side (Server Components/Server Actions) para dados
 * públicos que não dependem de sessão do usuário — notícias, páginas
 * institucionais e catálogo de concursos (`/public/content/*`, `/public/contests*`).
 *
 * A origem desses dados é a Selecon Central (CRM de atendimento), que gere
 * publicações e decide quais certames aparecem no site, com o ProSeleta como
 * base: defina CONTENT_API_URL (ex.: https://atendimento.selecon.org.br/api).
 * Sem ela, cai em API_INTERNAL_URL (apps/api local), que segue atendendo
 * login, proxy do navegador e demais rotas — esses nunca passam por aqui.
 */
const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:3001/api";
const CONTENT_API_URL = (process.env.CONTENT_API_URL?.trim() || API_INTERNAL_URL).replace(/\/+$/, "");

export async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${CONTENT_API_URL}${path}`, {
    ...init,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchApiOrNull<T>(path: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(`${CONTENT_API_URL}${path}`, {
    ...init,
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Falha ao consultar ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
