import { EDUCATION_LEVEL_LABEL } from "@/lib/content/labels";
import type { ContestPosition } from "@/lib/content/types";
import { formatCurrency, formatInteger } from "@/lib/format";

interface ContestPositionsProps {
  positions: ContestPosition[];
  /** Número do edital — usado na legenda da tabela. */
  editalNumber: string;
}

/** Célula responsiva: em mobile vira bloco com rótulo vindo de `data-label`; em desktop, célula comum. */
const CELL =
  "block py-1 text-sm text-text-primary before:block before:text-xs before:font-semibold before:uppercase before:tracking-wide before:text-text-secondary before:content-[attr(data-label)] md:table-cell md:px-4 md:py-3 md:align-top md:before:hidden";

const HEAD =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary";

function vacanciesLabel(position: ContestPosition): string {
  const parts: string[] = [];
  if (position.vacancies === null || position.vacancies === undefined) {
    parts.push("Cadastro de reserva");
  } else {
    parts.push(
      `${formatInteger(position.vacancies)} ${position.vacancies === 1 ? "vaga" : "vagas"}`,
    );
  }
  if (position.reserve) parts.push(`+ ${formatInteger(position.reserve)} CR`);
  return parts.join(" ");
}

/**
 * Cargos, vagas e requisitos (seção 9.4). Tabela semântica com legenda e cabeçalhos de
 * escopo; abaixo de `md` cada linha vira um card legível sem rolagem horizontal.
 */
export function ContestPositions({ positions, editalNumber }: ContestPositionsProps) {
  if (positions.length === 0) {
    return (
      <p className="border-border-strong bg-surface text-text-secondary rounded-lg border border-dashed p-5 text-sm leading-relaxed">
        A distribuição de cargos está no edital de abertura. Consulte a{" "}
        <a
          href="#publicacoes"
          className="text-action-blue font-semibold underline underline-offset-4"
        >
          seção de publicações
        </a>{" "}
        para ler o documento vigente.
      </p>
    );
  }

  return (
    <div className="border-border bg-surface rounded-lg border md:overflow-hidden">
      <table className="block w-full border-collapse md:table">
        <caption className="text-text-secondary md:border-border block px-4 py-3 text-left text-sm md:table-caption md:border-b">
          Cargos, vagas, escolaridade, salário e requisitos — {editalNumber}
        </caption>
        <thead className="hidden md:table-header-group">
          <tr className="border-border bg-background-light border-b">
            <th scope="col" className={HEAD}>
              Cargo
            </th>
            <th scope="col" className={HEAD}>
              Vagas
            </th>
            <th scope="col" className={HEAD}>
              Escolaridade
            </th>
            <th scope="col" className={HEAD}>
              Salário
            </th>
            <th scope="col" className={HEAD}>
              Requisitos
            </th>
          </tr>
        </thead>
        <tbody className="divide-border block divide-y md:table-row-group">
          {positions.map((position, index) => (
            <tr key={`${position.title}-${index}`} className="block p-4 md:table-row md:p-0">
              <th
                scope="row"
                className="text-navy-primary block text-left text-base font-bold md:table-cell md:px-4 md:py-3 md:align-top md:text-sm"
              >
                {position.title}
              </th>
              <td data-label="Vagas" className={`${CELL} font-semibold tabular-nums`}>
                {vacanciesLabel(position)}
              </td>
              <td data-label="Escolaridade" className={CELL}>
                {EDUCATION_LEVEL_LABEL[position.level]}
              </td>
              <td data-label="Salário" className={`${CELL} tabular-nums`}>
                {position.salaryCents ? formatCurrency(position.salaryCents) : "Consulte o edital"}
              </td>
              <td data-label="Requisitos" className={CELL}>
                {position.requirements ?? "Consulte o edital"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
