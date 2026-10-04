import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClassNames } from "@selecon/ui";
import { ArrowRightIcon } from "@/components/icons";
import { CANDIDATE_AREA, NAV_ITEMS } from "@/components/navigation";

interface PlaceholderPageProps {
  title: string;
  description: string;
  /** Fase do plano de implementação em que o módulo será entregue. */
  phase: string;
  /** Rota desta página, para não listá-la em "Enquanto isso". */
  currentPath: string;
  children?: ReactNode;
}

const ALL_SECTIONS = [...NAV_ITEMS, CANDIDATE_AREA];

/**
 * Página placeholder explícita — evita links quebrados (404) enquanto o módulo real
 * não é implementado (Fases 3, 4, 5 e 6). Nunca finge funcionalidade que não existe.
 */
export function PlaceholderPage({
  title,
  description,
  phase,
  currentPath,
  children,
}: PlaceholderPageProps) {
  const otherSections = ALL_SECTIONS.filter((section) => section.href !== currentPath);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-action-blue inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
            <span aria-hidden="true" className="bg-action-blue h-1.5 w-1.5 rounded-full" />
            Em construção · {phase}
          </p>
          <h1 className="text-navy-primary mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="text-text-secondary mt-5 max-w-xl text-lg leading-relaxed">{description}</p>

          {children ? <div className="mt-8">{children}</div> : null}

          <div className="mt-10">
            <Link href="/" className={buttonClassNames("secondary")}>
              Voltar à página inicial
            </Link>
          </div>
        </div>

        <aside
          aria-labelledby="other-sections-title"
          className="border-border bg-surface shadow-low rounded-xl border p-6 lg:col-span-4 lg:col-start-9"
        >
          <h2
            id="other-sections-title"
            className="text-text-secondary text-xs font-semibold uppercase tracking-[0.14em]"
          >
            Enquanto isso
          </h2>
          <ul className="divide-border mt-4 divide-y">
            {otherSections.map((section) => (
              <li key={section.href}>
                <Link
                  href={section.href}
                  className="group flex min-h-12 items-center justify-between gap-3 py-3 text-sm"
                >
                  <span>
                    <span className="text-navy-primary block font-semibold">{section.label}</span>
                    <span className="text-text-secondary block text-xs">{section.description}</span>
                  </span>
                  <ArrowRightIcon className="text-text-secondary group-hover:text-action-blue h-4 w-4 shrink-0 transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
