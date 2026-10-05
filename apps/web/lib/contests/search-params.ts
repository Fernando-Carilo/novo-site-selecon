import {
  CONTEST_AREA_LABEL,
  CONTEST_KIND_LABEL,
  CONTEST_STATUS_LABEL,
  EDUCATION_LEVEL_LABEL,
  UF_LABEL,
} from "@/lib/content/labels";
import type {
  ContestArea,
  ContestCatalogFilters,
  ContestKind,
  ContestPublicStatus,
  EducationLevel,
  UF,
} from "@/lib/content/types";

/**
 * Parse e serialização dos filtros do catálogo (`/concursos?...`). Os filtros persistem na
 * URL (seção 9.3): valores inválidos são ignorados em vez de gerar erro, e a serialização
 * omite os padrões para manter URLs curtas e compartilháveis.
 */

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

export const CATALOG_PATH = "/concursos";

export const STATUS_PARAM_VALUES = [
  "ABERTOS",
  "TODOS",
  ...(Object.keys(CONTEST_STATUS_LABEL) as ContestPublicStatus[]),
] as const;

export type StatusParam = (typeof STATUS_PARAM_VALUES)[number];

export const SORT_VALUES = ["relevancia", "inscricoes", "atualizacao"] as const;
export type SortParam = (typeof SORT_VALUES)[number];

export const SORT_LABEL: Record<SortParam, string> = {
  relevancia: "Relevância",
  inscricoes: "Abertura das inscrições",
  atualizacao: "Última atualização",
};

const UF_VALUES = Object.keys(UF_LABEL) as UF[];
const AREA_VALUES = Object.keys(CONTEST_AREA_LABEL) as ContestArea[];
const LEVEL_VALUES = Object.keys(EDUCATION_LEVEL_LABEL) as EducationLevel[];
const KIND_VALUES = Object.keys(CONTEST_KIND_LABEL) as ContestKind[];

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  if (!value) return undefined;
  const upper = value.trim();
  return (allowed as readonly string[]).includes(upper) ? (upper as T) : undefined;
}

/** Converte os `searchParams` brutos em `ContestCatalogFilters` validados. */
export function parseCatalogSearchParams(params: CatalogSearchParams): ContestCatalogFilters {
  const filters: ContestCatalogFilters = {};

  const q = first(params.q)?.trim();
  if (q) filters.q = q.slice(0, 120);

  const status = oneOf(first(params.status)?.toUpperCase(), STATUS_PARAM_VALUES);
  if (status && status !== "TODOS") filters.status = status;

  const uf = oneOf(first(params.uf)?.toUpperCase(), UF_VALUES);
  if (uf) filters.uf = uf;

  const area = oneOf(first(params.area)?.toUpperCase(), AREA_VALUES);
  if (area) filters.area = area;

  const level = oneOf(first(params.level)?.toUpperCase(), LEVEL_VALUES);
  if (level) filters.level = level;

  const kind = oneOf(first(params.kind)?.toUpperCase(), KIND_VALUES);
  if (kind) filters.kind = kind;

  const sort = oneOf(first(params.sort)?.toLowerCase(), SORT_VALUES);
  if (sort && sort !== "relevancia") filters.sort = sort;

  const page = Number.parseInt(first(params.page) ?? "", 10);
  if (Number.isInteger(page) && page > 1) filters.page = page;

  return filters;
}

/** Serializa filtros em query string (sem o `?`), omitindo valores padrão. */
export function serializeCatalogFilters(filters: ContestCatalogFilters): string {
  const search = new URLSearchParams();
  if (filters.q) search.set("q", filters.q);
  if (filters.status && filters.status !== "TODOS") search.set("status", filters.status);
  if (filters.uf) search.set("uf", filters.uf);
  if (filters.area) search.set("area", filters.area);
  if (filters.level) search.set("level", filters.level);
  if (filters.kind) search.set("kind", filters.kind);
  if (filters.sort && filters.sort !== "relevancia") search.set("sort", filters.sort);
  if (filters.page && filters.page > 1) search.set("page", String(filters.page));
  return search.toString();
}

/**
 * Monta a URL do catálogo a partir dos filtros atuais com alterações pontuais. Qualquer
 * alteração de filtro (exceto `page`) volta para a primeira página.
 */
export function catalogHref(
  filters: ContestCatalogFilters,
  overrides: Partial<ContestCatalogFilters> = {},
): string {
  const next: ContestCatalogFilters = { ...filters, ...overrides };
  if (!("page" in overrides)) delete next.page;
  for (const key of Object.keys(next) as (keyof ContestCatalogFilters)[]) {
    if (next[key] === undefined) delete next[key];
  }
  const query = serializeCatalogFilters(next);
  return query ? `${CATALOG_PATH}?${query}` : CATALOG_PATH;
}

export interface ActiveFilterChip {
  key: keyof ContestCatalogFilters;
  /** Nome do filtro (ex.: "Estado"). */
  name: string;
  /** Valor legível (ex.: "Mato Grosso"). */
  label: string;
  /** URL do catálogo sem este filtro. */
  removeHref: string;
}

/** Lista legível dos filtros ativos, cada um com o link que o remove. */
export function describeActiveFilters(filters: ContestCatalogFilters): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  if (filters.q) {
    chips.push({
      key: "q",
      name: "Busca",
      label: `“${filters.q}”`,
      removeHref: catalogHref(filters, { q: undefined }),
    });
  }
  if (filters.status && filters.status !== "TODOS") {
    chips.push({
      key: "status",
      name: "Situação",
      label:
        filters.status === "ABERTOS" ? "Inscrições abertas" : CONTEST_STATUS_LABEL[filters.status],
      removeHref: catalogHref(filters, { status: undefined }),
    });
  }
  if (filters.uf) {
    chips.push({
      key: "uf",
      name: "Estado",
      label: UF_LABEL[filters.uf],
      removeHref: catalogHref(filters, { uf: undefined }),
    });
  }
  if (filters.area) {
    chips.push({
      key: "area",
      name: "Área",
      label: CONTEST_AREA_LABEL[filters.area],
      removeHref: catalogHref(filters, { area: undefined }),
    });
  }
  if (filters.level) {
    chips.push({
      key: "level",
      name: "Escolaridade",
      label: EDUCATION_LEVEL_LABEL[filters.level],
      removeHref: catalogHref(filters, { level: undefined }),
    });
  }
  if (filters.kind) {
    chips.push({
      key: "kind",
      name: "Tipo",
      label: CONTEST_KIND_LABEL[filters.kind],
      removeHref: catalogHref(filters, { kind: undefined }),
    });
  }
  if (filters.sort && filters.sort !== "relevancia") {
    chips.push({
      key: "sort",
      name: "Ordenação",
      label: SORT_LABEL[filters.sort],
      removeHref: catalogHref(filters, { sort: undefined }),
    });
  }
  return chips;
}

/** Verdadeiro quando há qualquer filtro além da paginação. */
export function hasActiveFilters(filters: ContestCatalogFilters): boolean {
  return describeActiveFilters(filters).length > 0;
}
