import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Contêiner de superfície elevada — painéis de detalhe, cards de resumo. */
export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div className={`border-border bg-surface rounded-lg border p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}
