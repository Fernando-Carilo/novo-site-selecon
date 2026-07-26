import { buttonClassNames } from "./Button";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Paginação simples anterior/próxima — usada por listas administrativas que
 * podem crescer sem limite (usuários, campanhas, casos). `aria-current="page"`
 * no indicador de página atual, botões desabilitados nos extremos em vez de
 * ocultos (mantém o alvo de toque previsível).
 */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginação" className="mt-4 flex items-center justify-between gap-4 text-sm">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={buttonClassNames("secondary")}
      >
        Anterior
      </button>
      <p aria-current="page" className="text-text-secondary">
        Página {page} de {totalPages}
      </p>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={buttonClassNames("secondary")}
      >
        Próxima
      </button>
    </nav>
  );
}
