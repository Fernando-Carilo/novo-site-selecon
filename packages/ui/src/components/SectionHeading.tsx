import type { ReactNode } from "react";

export interface SectionHeadingProps {
  /** Rótulo curto acima do título (ex.: "Concursos"). */
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  /** Ação à direita (ex.: link "Ver todos"). */
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  tone?: "default" | "inverse";
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  as: Tag = "h2",
  align = "left",
  tone = "default",
  id,
  className = "",
}: SectionHeadingProps) {
  const inverse = tone === "inverse";
  return (
    <div
      className={[
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" ? "text-center sm:flex-col sm:items-center" : "",
        className,
      ].join(" ")}
    >
      <div className={align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}>
        {eyebrow ? (
          <p
            className={`text-sm font-semibold uppercase tracking-wide ${
              inverse ? "text-support-cyan" : "text-action-blue"
            }`}
          >
            {eyebrow}
          </p>
        ) : null}
        <Tag
          id={id}
          className={[
            "mt-1 font-bold tracking-tight",
            Tag === "h1" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
            inverse ? "text-white" : "text-navy-primary",
          ].join(" ")}
        >
          {title}
        </Tag>
        {description ? (
          <p className={`mt-3 text-base ${inverse ? "text-white/80" : "text-text-secondary"}`}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
