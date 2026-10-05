import type { ElementType, ReactNode } from "react";

export interface CardProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** `interactive` adiciona elevação no hover — use quando o card inteiro é um link. */
  interactive?: boolean;
  padding?: "none" | "md" | "lg";
}

const PADDING = { none: "", md: "p-5", lg: "p-6 sm:p-8" } as const;

export function Card({
  as: Tag = "div",
  children,
  className = "",
  interactive = false,
  padding = "md",
}: CardProps) {
  return (
    <Tag
      className={[
        "border-border bg-surface shadow-low rounded-lg border",
        interactive
          ? "duration-base hover:shadow-medium focus-within:ring-action-blue transition-shadow focus-within:ring-[3px]"
          : "",
        PADDING[padding],
        className,
      ].join(" ")}
    >
      {children}
    </Tag>
  );
}
