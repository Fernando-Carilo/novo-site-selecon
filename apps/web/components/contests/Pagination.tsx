import Link from "next/link";
import { Icon } from "@selecon/ui";
import type { ContestCatalogFilters } from "@/lib/content/types";
import { catalogHref } from "@/lib/contests/search-params";

interface PaginationProps {
  filters: ContestCatalogFilters;
  page: number;
  totalPages: number;
}

/** Páginas exibidas: primeira, última, atual e vizinhas; `null` representa reticências. */
function pageWindow(page: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result: (number | null)[] = [];
  let previous: number | null = null;
  for (const current of sorted) {
    if (previous !== null && current - previous > 1) result.push(null);
    result.push(current);
    previous = current;
  }
  return result;
}

const LINK_BASE =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-md px-3 text-sm font-semibold transition-colors";
const LINK_IDLE = `${LINK_BASE} border border-border-strong bg-surface text-navy-primary hover:border-action-blue hover:text-action-blue`;
const LINK_CURRENT = `${LINK_BASE} bg-navy-primary text-white`;
const LINK_DISABLED = `${LINK_BASE} border border-border bg-surface-muted text-text-secondary`;

/** Paginação acessível (seção 9.3): links que preservam a query e anunciam a página atual. */
export function Pagination({ filters, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;
  const items = pageWindow(page, totalPages);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav aria-label="Paginação" className="flex flex-col items-center gap-3">
      <p className="text-text-secondary text-sm">
        Página <span className="text-navy-primary font-semibold tabular-nums">{page}</span> de{" "}
        <span className="text-navy-primary font-semibold tabular-nums">{totalPages}</span>
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {hasPrev ? (
            <Link href={catalogHref(filters, { page: page - 1 })} rel="prev" className={LINK_IDLE}>
              <Icon name="arrow-left" size={16} />
              <span>Anterior</span>
            </Link>
          ) : (
            <span className={LINK_DISABLED} aria-disabled="true">
              <Icon name="arrow-left" size={16} />
              <span>Anterior</span>
            </span>
          )}
        </li>
        {items.map((item, index) =>
          item === null ? (
            <li key={`gap-${index}`} aria-hidden="true" className="text-text-secondary px-1">
              …
            </li>
          ) : (
            <li key={item}>
              {item === page ? (
                <span aria-current="page" className={LINK_CURRENT}>
                  <span className="sr-only">Página </span>
                  <span className="tabular-nums">{item}</span>
                </span>
              ) : (
                <Link href={catalogHref(filters, { page: item })} className={LINK_IDLE}>
                  <span className="sr-only">Página </span>
                  <span className="tabular-nums">{item}</span>
                </Link>
              )}
            </li>
          ),
        )}
        <li>
          {hasNext ? (
            <Link href={catalogHref(filters, { page: page + 1 })} rel="next" className={LINK_IDLE}>
              <span>Próxima</span>
              <Icon name="arrow-right" size={16} />
            </Link>
          ) : (
            <span className={LINK_DISABLED} aria-disabled="true">
              <span>Próxima</span>
              <Icon name="arrow-right" size={16} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
