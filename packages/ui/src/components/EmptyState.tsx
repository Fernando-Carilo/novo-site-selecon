import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Estado vazio de lista/tabela — substitui a mensagem de "nenhum item" que
 * cada página repetia com sua própria marcação (ex.: "Nenhuma página
 * cadastrada.", "Nenhuma campanha cadastrada.").
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="border-border text-text-secondary rounded-lg border border-dashed p-8 text-center text-sm">
      <p className="text-text-primary font-medium">{title}</p>
      {description && <p className="mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
