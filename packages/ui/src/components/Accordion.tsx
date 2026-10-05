import type { ReactNode } from "react";

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  /** Abre o primeiro item por padrão. */
  openFirst?: boolean;
}

/**
 * Acordeão baseado em `<details>/<summary>` nativos: acessível por teclado, sem JavaScript,
 * com o estado aberto/fechado anunciado por leitores de tela.
 */
export function Accordion({ items, className = "", openFirst = false }: AccordionProps) {
  return (
    <div
      className={`divide-border border-border bg-surface divide-y rounded-lg border ${className}`}
    >
      {items.map((item, index) => (
        <details key={item.id} id={item.id} open={openFirst && index === 0} className="group">
          <summary className="text-navy-primary hover:bg-background-light focus-visible:ring-action-blue flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold marker:content-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset [&::-webkit-details-marker]:hidden">
            <span>{item.title}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="text-action-blue duration-base h-5 w-5 shrink-0 transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div className="text-text-primary px-5 pb-5 text-base leading-relaxed">
            {item.content}
          </div>
        </details>
      ))}
    </div>
  );
}
