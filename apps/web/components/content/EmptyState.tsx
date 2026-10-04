import type { ReactNode } from "react";

/** Estado vazio honesto: diz o que não há, nunca preenche com exemplo. */
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      className="border-border bg-surface rounded-xl border border-dashed px-6 py-12 text-center"
    >
      <p className="text-navy-primary text-lg font-semibold">{title}</p>
      <p className="text-text-secondary mx-auto mt-2 max-w-md text-sm leading-relaxed">
        {description}
      </p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  id,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  id: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-action-blue text-xs font-semibold uppercase tracking-[0.12em]">
        {eyebrow}
      </p>
      <h1 id={id} className="text-navy-primary mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="text-text-secondary mt-4 text-lg leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}
