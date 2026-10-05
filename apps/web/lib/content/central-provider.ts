import { StaticContentProvider } from "./static-provider";
import type { ContentProvider } from "./provider";
import type { Contest, NewsPost } from "./types";

export interface CentralProviderOptions {
  baseUrl: string;
  /** Token de leitura do portal (escopo `publications:read`), nunca exposto ao navegador. */
  apiToken?: string;
  /** Revalidação ISR em segundos (padrão: 5 min). Publicações críticas usam webhook de purge. */
  revalidateSeconds?: number;
}

interface CentralEnvelope<T> {
  data: T;
  meta?: { total?: number; generatedAt?: string };
}

/**
 * Provider que lê publicações e notícias da Central de Serviços Selecon.
 *
 * Contrato (ver docs/CENTRAL_DE_SERVICOS.md e `@selecon/contracts` › `central`):
 *   GET {baseUrl}/v1/portal/contests            → CentralEnvelope<Contest[]>
 *   GET {baseUrl}/v1/portal/contests/{slug}     → CentralEnvelope<Contest>
 *   GET {baseUrl}/v1/portal/news                → CentralEnvelope<NewsPost[]>
 *   GET {baseUrl}/v1/portal/news/{slug}         → CentralEnvelope<NewsPost>
 *
 * A listagem completa é carregada e filtrada localmente com as mesmas regras do provider
 * estático (mesma ordenação, mesmas facetas) para que as duas fontes nunca mostrem
 * contagens diferentes para a mesma consulta.
 */
export class CentralContentProvider implements ContentProvider {
  readonly source = "central" as const;

  constructor(private readonly options: CentralProviderOptions) {}

  private async fetchJson<T>(path: string): Promise<T> {
    const response = await fetch(`${this.options.baseUrl}${path}`, {
      headers: {
        Accept: "application/json",
        ...(this.options.apiToken ? { Authorization: `Bearer ${this.options.apiToken}` } : {}),
      },
      next: { revalidate: this.options.revalidateSeconds ?? 300 },
    });
    if (!response.ok) {
      throw new Error(`Central de Serviços respondeu ${response.status} em ${path}`);
    }
    const envelope = (await response.json()) as CentralEnvelope<T>;
    return envelope.data;
  }

  private async snapshot(): Promise<StaticContentProvider> {
    const [contests, news] = await Promise.all([
      this.fetchJson<Contest[]>("/v1/portal/contests"),
      this.fetchJson<NewsPost[]>("/v1/portal/news"),
    ]);
    return new StaticContentProvider(contests, news);
  }

  listContests: ContentProvider["listContests"] = async (filters) =>
    (await this.snapshot()).listContests(filters);
  getContest: ContentProvider["getContest"] = async (slug) =>
    this.fetchJson<Contest | null>(`/v1/portal/contests/${encodeURIComponent(slug)}`).catch(
      () => null,
    );
  getFeaturedContests: ContentProvider["getFeaturedContests"] = async (limit) =>
    (await this.snapshot()).getFeaturedContests(limit);
  getOpenContests: ContentProvider["getOpenContests"] = async (limit) =>
    (await this.snapshot()).getOpenContests(limit);
  getRecentPublications: ContentProvider["getRecentPublications"] = async (limit) =>
    (await this.snapshot()).getRecentPublications(limit);
  listNews: ContentProvider["listNews"] = async (limit) => (await this.snapshot()).listNews(limit);
  getNews: ContentProvider["getNews"] = async (slug) =>
    this.fetchJson<NewsPost | null>(`/v1/portal/news/${encodeURIComponent(slug)}`).catch(
      () => null,
    );
  listServices: ContentProvider["listServices"] = async () =>
    new StaticContentProvider().listServices();
  getService: ContentProvider["getService"] = async (slug) =>
    new StaticContentProvider().getService(slug);
  listAllSlugs: ContentProvider["listAllSlugs"] = async () =>
    (await this.snapshot()).listAllSlugs();
}
