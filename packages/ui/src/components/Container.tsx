import type { ElementType, ReactNode } from "react";

export interface ContainerProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** `narrow` para leitura (prosa), `default` para páginas, `wide` para grades densas. */
  width?: "narrow" | "default" | "wide";
  id?: string;
}

const WIDTHS = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

/** Largura máxima padrão com margem lateral de 16px em telas pequenas (seção 5.3). */
export function Container({
  as: Tag = "div",
  className = "",
  children,
  width = "default",
  id,
}: ContainerProps) {
  return (
    <Tag id={id} className={`mx-auto w-full px-4 sm:px-6 ${WIDTHS[width]} ${className}`}>
      {children}
    </Tag>
  );
}
