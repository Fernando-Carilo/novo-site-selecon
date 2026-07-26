export interface SkipLinkProps {
  targetId: string;
  label?: string;
}

/**
 * Skip link exigido pela seção 5.4 (acessibilidade AA) — fica visualmente oculto até
 * receber foco por teclado, permitindo pular a navegação e ir direto ao conteúdo principal.
 */
export function SkipLink({ targetId, label = "Pular para o conteúdo principal" }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={[
        "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50",
        "focus:bg-navy-primary focus:rounded-md focus:px-4 focus:py-2 focus:text-white",
        "focus-visible:ring-support-cyan focus-visible:outline-none focus-visible:ring-[3px]",
      ].join(" ")}
    >
      {label}
    </a>
  );
}
