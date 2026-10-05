import Link from "next/link";
import { Icon, SelectField, buttonClassNames } from "@selecon/ui";
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
  ContestCatalogResult,
  ContestKind,
  ContestPublicStatus,
  EducationLevel,
} from "@/lib/content/types";
import {
  CATALOG_PATH,
  SORT_LABEL,
  SORT_VALUES,
  hasActiveFilters,
} from "@/lib/contests/search-params";

interface CatalogFiltersProps {
  filters: ContestCatalogFilters;
  facets: ContestCatalogResult["facets"];
}

/**
 * Filtros do catálogo (seção 9.3): formulário GET para `/concursos`, selects nativos e botão
 * "Aplicar filtros" — funciona sem JavaScript e persiste tudo na URL. As facetas trazem
 * contagens para que o candidato saiba o que vai encontrar antes de filtrar.
 */
export function CatalogFilters({ filters, facets }: CatalogFiltersProps) {
  const statusCount = new Map(facets.statuses.map((f) => [f.value, f.count]));
  const openCount = statusCount.get("INSCRICOES_ABERTAS") ?? 0;

  const statusOptions = [
    { value: "ABERTOS", label: `Inscrições abertas (${openCount})` },
    ...(Object.keys(CONTEST_STATUS_LABEL) as ContestPublicStatus[])
      .filter((status) => status !== "INSCRICOES_ABERTAS")
      .map((status) => ({
        value: status,
        label: `${CONTEST_STATUS_LABEL[status]} (${statusCount.get(status) ?? 0})`,
      })),
  ];

  const ufOptions = facets.ufs.map((facet) => ({
    value: facet.value,
    label: `${UF_LABEL[facet.value]} (${facet.count})`,
  }));

  const areaOptions = facets.areas.map((facet) => ({
    value: facet.value,
    label: `${CONTEST_AREA_LABEL[facet.value]} (${facet.count})`,
  }));

  const levelOptions = (Object.keys(EDUCATION_LEVEL_LABEL) as EducationLevel[]).map((level) => ({
    value: level,
    label: EDUCATION_LEVEL_LABEL[level],
  }));

  const kindOptions = (Object.keys(CONTEST_KIND_LABEL) as ContestKind[]).map((kind) => ({
    value: kind,
    label: CONTEST_KIND_LABEL[kind],
  }));

  const sortOptions = SORT_VALUES.map((sort) => ({ value: sort, label: SORT_LABEL[sort] }));

  return (
    <form
      action={CATALOG_PATH}
      method="get"
      aria-labelledby="filtros-title"
      className="border-border bg-surface shadow-low rounded-lg border p-5"
    >
      <div className="flex items-center gap-2">
        <Icon name="filter" size={18} className="text-action-blue" />
        <h2 id="filtros-title" className="text-navy-primary text-base font-bold">
          Filtrar concursos
        </h2>
      </div>
      {filters.q ? <input type="hidden" name="q" value={filters.q} /> : null}
      <div className="mt-4 space-y-4">
        <SelectField
          id="filtro-status"
          name="status"
          label="Situação"
          options={statusOptions}
          placeholder="Todas as situações"
          defaultValue={
            filters.status === "INSCRICOES_ABERTAS" ? "ABERTOS" : (filters.status ?? "")
          }
        />
        <SelectField
          id="filtro-uf"
          name="uf"
          label="Estado"
          options={ufOptions}
          placeholder="Todos os estados"
          defaultValue={filters.uf ?? ""}
        />
        <SelectField
          id="filtro-area"
          name="area"
          label="Área de atuação"
          options={areaOptions}
          placeholder="Todas as áreas"
          defaultValue={(filters.area as ContestArea | undefined) ?? ""}
        />
        <SelectField
          id="filtro-level"
          name="level"
          label="Escolaridade"
          options={levelOptions}
          placeholder="Qualquer escolaridade"
          defaultValue={filters.level ?? ""}
        />
        <SelectField
          id="filtro-kind"
          name="kind"
          label="Tipo de seleção"
          options={kindOptions}
          placeholder="Todos os tipos"
          defaultValue={filters.kind ?? ""}
        />
        <SelectField
          id="filtro-sort"
          name="sort"
          label="Ordenar por"
          options={sortOptions}
          defaultValue={filters.sort ?? "relevancia"}
        />
      </div>
      <div className="mt-5 flex flex-col gap-3">
        <button type="submit" className={buttonClassNames("primary", "w-full")}>
          Aplicar filtros
        </button>
        {hasActiveFilters(filters) ? (
          <Link href={CATALOG_PATH} className={buttonClassNames("secondary", "w-full")}>
            <Icon name="x" size={16} />
            Limpar filtros
          </Link>
        ) : null}
      </div>
    </form>
  );
}
