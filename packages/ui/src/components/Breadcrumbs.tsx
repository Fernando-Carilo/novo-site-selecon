import type { ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Componente de link (ex.: `next/link`) — recebe `href`, `className` e `children`. */
  linkComponent: (props: { href: string; className?: string; children: ReactNode }) => ReactNode;
  className?: string;
}

/** Trilha de navegação semântica (seção 13.1) — o último item é a página atual. */
export function Breadcrumbs({
  items,
  linkComponent: LinkComponent,
  className = "",
}: BreadcrumbsProps) {
  return (
    <nav aria-label="Trilha de navegação" className={`text-sm ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-text-secondary">
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <LinkComponent
                  href={item.href}
                  className="text-text-secondary hover:text-action-blue focus-visible:ring-action-blue underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px]"
                >
                  {item.label}
                </LinkComponent>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="text-navy-primary font-medium"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
