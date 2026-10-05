import Link from "next/link";
import { Icon } from "@selecon/ui";
import type { ContestCatalogFilters } from "@/lib/content/types";
import { CATALOG_PATH, describeActiveFilters } from "@/lib/contests/search-params";

interface ActiveFiltersProps {
  filters: ContestCatalogFilters;
}

/**
 * Chips dos filtros ativos. Cada chip é um link que recompõe a query sem aquele filtro —
 * funciona sem JavaScript e mantém o histórico do navegador coerente.
 */
export function ActiveFilters({ filters }: ActiveFiltersProps) {
  const chips = describeActiveFilters(filters);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-text-secondary text-sm font-semibold">Filtros ativos:</span>
      <ul className="flex flex-wrap gap-2" aria-label="Filtros ativos">
        {chips.map((chip) => (
          <li key={chip.key}>
            <Link
              href={chip.removeHref}
              className="border-border-strong bg-surface text-navy-primary hover:border-action-blue hover:text-action-blue inline-flex min-h-9 items-center gap-1.5 rounded-full border py-1 pl-3 pr-2 text-sm font-medium transition-colors"
            >
              <span>
                <span className="text-text-secondary">{chip.name}: </span>
                {chip.label}
              </span>
              <Icon
                name="x"
                size={14}
                label={`Remover filtro ${chip.name.toLowerCase()} ${chip.label}`}
              />
            </Link>
          </li>
        ))}
      </ul>
      {chips.length > 1 ? (
        <Link
          href={CATALOG_PATH}
          className="text-action-blue text-sm font-semibold underline-offset-4 hover:underline"
        >
          Limpar todos
        </Link>
      ) : null}
    </div>
  );
}
