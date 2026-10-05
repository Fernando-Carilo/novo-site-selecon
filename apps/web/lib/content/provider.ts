import type {
  Contest,
  ContestCatalogFilters,
  ContestCatalogResult,
  NewsPost,
  ServiceLine,
} from "./types";

/**
 * Porta de conteúdo do portal público. Duas implementações:
 * - `StaticContentProvider` — dataset migrado do site atual (padrão até o cutover);
 * - `CentralContentProvider` — Central de Serviços Selecon, que passa a controlar
 *   publicações e notícias (ver docs/CENTRAL_DE_SERVICOS.md).
 */
export interface ContentProvider {
  readonly source: "static" | "central";
  listContests(filters?: ContestCatalogFilters): Promise<ContestCatalogResult>;
  getContest(slug: string): Promise<Contest | null>;
  getFeaturedContests(limit?: number): Promise<Contest[]>;
  getOpenContests(limit?: number): Promise<Contest[]>;
  getRecentPublications(limit?: number): Promise<RecentPublication[]>;
  listNews(limit?: number): Promise<NewsPost[]>;
  getNews(slug: string): Promise<NewsPost | null>;
  listServices(): Promise<ServiceLine[]>;
  getService(slug: string): Promise<ServiceLine | null>;
  /** Para sitemap e validação de links. */
  listAllSlugs(): Promise<{ contests: string[]; news: string[]; services: string[] }>;
}

export interface RecentPublication {
  contestSlug: string;
  contestTitle: string;
  organization: string;
  kind: Contest["publications"][number]["kind"];
  title: string;
  publishedAt: string;
  url?: string;
}
