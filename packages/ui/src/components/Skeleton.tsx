export interface SkeletonProps {
  className?: string;
  /** Rótulo acessível anunciado enquanto o conteúdo carrega (ex.: "Carregando concursos"). */
  label?: string;
}

/**
 * Placeholder de carregamento. `aria-hidden` no bloco visual — o texto real
 * do estado de carregamento vive em `label`, anunciado uma única vez via
 * `role="status"` no componente pai, não repetido por skeleton individual.
 * Respeita `prefers-reduced-motion` (a animação de pulso vem de uma classe
 * utilitária Tailwind que já desliga `animate-*` sob esse media query — ver
 * `packages/ui/src/tokens/tokens.css`).
 */
export function Skeleton({ className = "h-4 w-full", label }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      role={label ? "status" : undefined}
      aria-label={label}
      className={`bg-background-light motion-safe:animate-pulse inline-block rounded ${className}`}
    />
  );
}
