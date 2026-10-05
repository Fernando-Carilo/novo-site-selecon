import Link from "next/link";
import { Card, Icon } from "@selecon/ui";
import { ContestCover } from "@/components/contests/ContestCover";
import { StatusBadge } from "@/components/contests/StatusBadge";
import { CONTEST_KIND_LABEL, EDUCATION_LEVEL_LABEL } from "@/lib/content/labels";
import type { Contest } from "@/lib/content/types";
import { daysUntil, formatCurrency, formatDate, formatInteger } from "@/lib/format";

interface ContestCardProps {
  contest: Contest;
  /** Define o nível do título do card dentro da hierarquia da página. */
  headingLevel?: "h2" | "h3";
}

export function registrationDeadlineLabel(contest: Contest, now = new Date()): string | null {
  const { opensAt, closesAt } = contest.registration;
  if (contest.status === "INSCRICOES_ABERTAS" && closesAt) {
    const days = daysUntil(closesAt, now);
    if (days < 0) return `Inscrições encerradas em ${formatDate(closesAt)}`;
    if (days === 0) return "Último dia de inscrições";
    if (days === 1) return "Inscrições encerram amanhã";
    return `Inscrições até ${formatDate(closesAt)} (${days} dias)`;
  }
  if (contest.status === "PREVISTO") return "Edital em elaboração";
  if (closesAt) return `Inscrições encerradas em ${formatDate(closesAt)}`;
  if (opensAt) return `Inscrições a partir de ${formatDate(opensAt)}`;
  return null;
}

/** Card do catálogo (seção 9.3): órgão, título, situação, descrição, vagas, escolaridade, prazo e CTA. */
export function ContestCard({ contest, headingLevel: Heading = "h3" }: ContestCardProps) {
  const deadline = registrationDeadlineLabel(contest);
  const levels = contest.educationLevels.map((level) => EDUCATION_LEVEL_LABEL[level]).join(", ");

  return (
    <Card as="article" padding="none" interactive className="relative flex h-full flex-col overflow-hidden">
      <ContestCover
        cover={contest.cover}
        label={contest.organization.shortName}
        uf={contest.organization.uf}
        className="aspect-[16/9]"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={contest.status} />
          <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            {CONTEST_KIND_LABEL[contest.kind]}
          </span>
        </div>
        <Heading className="mt-3 text-lg font-bold leading-snug text-navy-primary">
          <Link
            href={`/concursos/${contest.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {contest.title}
          </Link>
        </Heading>
        <p className="mt-1 text-sm text-text-secondary">{contest.editalNumber}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-text-primary">{contest.summary}</p>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Vagas</dt>
            <dd className="font-semibold tabular-nums text-navy-primary">
              {contest.vacancies === null ? "Cadastro de reserva" : formatInteger(contest.vacancies)}
              {contest.reserveVacancies ? ` + ${formatInteger(contest.reserveVacancies)} CR` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Escolaridade</dt>
            <dd className="font-semibold text-navy-primary">{levels}</dd>
          </div>
          {contest.salaryMaxCents ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Salário até</dt>
              <dd className="font-semibold tabular-nums text-navy-primary">{formatCurrency(contest.salaryMaxCents)}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Local</dt>
            <dd className="font-semibold text-navy-primary">
              {contest.organization.city}/{contest.organization.uf}
            </dd>
          </div>
        </dl>
        {deadline ? (
          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-text-primary">
            <Icon name="calendar" size={16} className="text-action-blue" />
            {deadline}
          </p>
        ) : null}
        <p className="mt-auto pt-4 text-sm font-semibold text-action-blue">
          Ver página do edital
          <Icon name="arrow-right" size={16} className="ml-1 inline" />
        </p>
      </div>
    </Card>
  );
}
