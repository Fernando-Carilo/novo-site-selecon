import { normalizeText } from "@/lib/format";
import { CONTESTS } from "./data/contests";
import { NEWS } from "./data/news";
import { SERVICES } from "./data/services";
import type { ContentProvider, RecentPublication } from "./provider";
import type {
  Contest,
  ContestArea,
  ContestCatalogFilters,
  ContestCatalogResult,
  ContestPublicStatus,
  UF,
} from "./types";

const PAGE_SIZE = 9;

const STATUS_ORDER: Record<ContestPublicStatus, number> = {
  INSCRICOES_ABERTAS: 0,
  PREVISTO: 1,
  EM_ANDAMENTO: 2,
  HOMOLOGADO: 3,
  SUSPENSO: 4,
  ENCERRADO: 5,
};

/** Sinônimos básicos para a busca (seção 9.2). */
const SYNONYMS: Record<string, string[]> = {
  gcm: ["guarda", "guarda municipal", "guarda civil"],
  guarda: ["gcm"],
  pm: ["policia militar"],
  prefeitura: ["municipio", "municipal"],
  camara: ["legislativo"],
  acs: ["agente comunitario de saude"],
  ace: ["agente de combate as endemias"],
  seletivo: ["processo seletivo", "pss"],
  pss: ["processo seletivo simplificado"],
  professor: ["docente", "educacao"],
  tecnico: ["cefet", "curso tecnico"],
};

function expandQuery(q: string): string[] {
  const base = normalizeText(q);
  const terms = new Set<string>([base]);
  for (const token of base.split(/\s+/)) {
    for (const synonym of SYNONYMS[token] ?? []) terms.add(normalizeText(synonym));
  }
  return [...terms];
}

function searchableText(contest: Contest): string {
  return normalizeText(
    [
      contest.title,
      contest.editalNumber,
      contest.organization.name,
      contest.organization.shortName,
      contest.organization.city,
      contest.organization.uf,
      contest.summary,
      contest.positions.map((p) => p.title).join(" "),
      contest.highlights.join(" "),
    ].join(" "),
  );
}

function matchesQuery(contest: Contest, q?: string): boolean {
  if (!q || !q.trim()) return true;
  const haystack = searchableText(contest);
  const terms = expandQuery(q);
  // Todos os tokens da consulta original precisam aparecer (ou um sinônimo deles).
  const tokens = normalizeText(q).split(/\s+/).filter(Boolean);
  return (
    tokens.every((token) => {
      if (haystack.includes(token)) return true;
      return (SYNONYMS[token] ?? []).some((syn) => haystack.includes(normalizeText(syn)));
    }) || terms.some((term) => haystack.includes(term))
  );
}

function applyFilters(contests: Contest[], filters: ContestCatalogFilters): Contest[] {
  return contests.filter((contest) => {
    if (!matchesQuery(contest, filters.q)) return false;
    if (filters.status && filters.status !== "TODOS") {
      if (filters.status === "ABERTOS") {
        if (contest.status !== "INSCRICOES_ABERTAS") return false;
      } else if (contest.status !== filters.status) {
        return false;
      }
    }
    if (filters.uf && contest.organization.uf !== filters.uf) return false;
    if (filters.area && contest.area !== filters.area) return false;
    if (filters.level && !contest.educationLevels.includes(filters.level)) return false;
    if (filters.kind && contest.kind !== filters.kind) return false;
    return true;
  });
}

function sortContests(contests: Contest[], sort: ContestCatalogFilters["sort"]): Contest[] {
  const copy = [...contests];
  if (sort === "inscricoes") {
    return copy.sort((a, b) =>
      (b.registration.opensAt ?? "").localeCompare(a.registration.opensAt ?? ""),
    );
  }
  if (sort === "atualizacao") {
    return copy.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  return copy.sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (byStatus !== 0) return byStatus;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

function countBy<T extends string>(values: T[]): { value: T; count: number }[] {
  const map = new Map<T, number>();
  for (const value of values) map.set(value, (map.get(value) ?? 0) + 1);
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || String(a.value).localeCompare(String(b.value)));
}

export class StaticContentProvider implements ContentProvider {
  readonly source = "static" as const;

  constructor(
    private readonly contests: Contest[] = CONTESTS,
    private readonly news = NEWS,
    private readonly services = SERVICES,
  ) {}

  async listContests(filters: ContestCatalogFilters = {}): Promise<ContestCatalogResult> {
    const filtered = sortContests(applyFilters(this.contests, filters), filters.sort);
    const page = Math.max(1, filters.page ?? 1);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      total: filtered.length,
      page: safePage,
      pageSize: PAGE_SIZE,
      totalPages,
      facets: {
        ufs: countBy<UF>(this.contests.map((c) => c.organization.uf)),
        areas: countBy<ContestArea>(this.contests.map((c) => c.area)),
        statuses: countBy<ContestPublicStatus>(this.contests.map((c) => c.status)),
      },
    };
  }

  async getContest(slug: string): Promise<Contest | null> {
    return this.contests.find((c) => c.slug === slug) ?? null;
  }

  async getFeaturedContests(limit = 5): Promise<Contest[]> {
    return sortContests(
      this.contests.filter((c) => c.featured),
      "relevancia",
    ).slice(0, limit);
  }

  async getOpenContests(limit = 6): Promise<Contest[]> {
    return sortContests(
      this.contests.filter((c) => c.status === "INSCRICOES_ABERTAS" || c.status === "PREVISTO"),
      "relevancia",
    ).slice(0, limit);
  }

  async getRecentPublications(limit = 8): Promise<RecentPublication[]> {
    const all: RecentPublication[] = this.contests.flatMap((contest) =>
      contest.publications.map((publication) => ({
        contestSlug: contest.slug,
        contestTitle: contest.title,
        organization: contest.organization.shortName,
        kind: publication.kind,
        title: publication.title,
        publishedAt: publication.publishedAt,
        url: publication.url,
      })),
    );
    return all.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, limit);
  }

  async listNews(limit?: number) {
    const sorted = [...this.news].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return limit ? sorted.slice(0, limit) : sorted;
  }

  async getNews(slug: string) {
    return this.news.find((n) => n.slug === slug) ?? null;
  }

  async listServices() {
    return this.services;
  }

  async getService(slug: string) {
    return this.services.find((s) => s.slug === slug) ?? null;
  }

  async listAllSlugs() {
    return {
      contests: this.contests.map((c) => c.slug),
      news: this.news.map((n) => n.slug),
      services: this.services.map((s) => s.slug),
    };
  }
}
