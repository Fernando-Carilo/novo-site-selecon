import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, Container, type BreadcrumbItem } from "@selecon/ui";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  breadcrumbs: BreadcrumbItem[];
  /** Ações (CTAs) exibidas à direita em desktop e abaixo em mobile. */
  actions?: ReactNode;
  /** Conteúdo extra abaixo do título (badges, metadados). */
  children?: ReactNode;
  tone?: "light" | "navy";
}

function BreadcrumbLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/** Cabeçalho padrão das páginas internas: trilha, rótulo, título H1, descrição e ações. */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  children,
  tone = "light",
}: PageHeaderProps) {
  const navy = tone === "navy";
  return (
    <section className={navy ? "bg-navy-primary text-white" : "border-b border-border bg-surface"}>
      <Container className="py-8 sm:py-10">
        <Breadcrumbs
          items={breadcrumbs}
          linkComponent={BreadcrumbLink}
          className={navy ? "[&_a]:text-white/80 [&_a:hover]:text-white [&_span]:text-white [&_span[aria-hidden]]:text-white/50" : ""}
        />
        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className={`text-sm font-semibold uppercase tracking-wide ${navy ? "text-support-cyan" : "text-action-blue"}`}>
                {eyebrow}
              </p>
            ) : null}
            <h1 className={`mt-1 text-3xl font-bold leading-tight sm:text-4xl ${navy ? "text-white" : "text-navy-primary"}`}>
              {title}
            </h1>
            {description ? (
              <p className={`mt-3 text-base leading-relaxed sm:text-lg ${navy ? "text-white/85" : "text-text-secondary"}`}>
                {description}
              </p>
            ) : null}
            {children ? <div className="mt-4">{children}</div> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div> : null}
        </div>
      </Container>
    </section>
  );
}
