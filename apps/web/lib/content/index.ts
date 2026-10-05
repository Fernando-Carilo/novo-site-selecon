import { CentralContentProvider } from "./central-provider";
import { StaticContentProvider } from "./static-provider";
import type { ContentProvider } from "./provider";

let cached: ContentProvider | null = null;

/**
 * Resolve o provider de conteúdo a partir do ambiente:
 * - `CONTENT_SOURCE=central` + `CENTRAL_SERVICOS_API_URL` → Central de Serviços Selecon;
 * - qualquer outro valor → dataset estático migrado (padrão em desenvolvimento e até o cutover).
 *
 * Nunca há fallback silencioso: se a Central estiver configurada e indisponível, a página
 * falha de forma explícita (e o cache ISR anterior continua servido pelo Next.js).
 */
export function getContentProvider(): ContentProvider {
  if (cached) return cached;
  const source = process.env.CONTENT_SOURCE ?? "static";
  const baseUrl = process.env.CENTRAL_SERVICOS_API_URL;
  if (source === "central" && baseUrl) {
    cached = new CentralContentProvider({
      baseUrl,
      apiToken: process.env.CENTRAL_SERVICOS_API_TOKEN,
      revalidateSeconds: Number(process.env.CENTRAL_SERVICOS_REVALIDATE_SECONDS ?? 300),
    });
  } else {
    cached = new StaticContentProvider();
  }
  return cached;
}

export * from "./types";
export * from "./labels";
export type { ContentProvider, RecentPublication } from "./provider";
