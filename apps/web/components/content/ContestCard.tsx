import Link from "next/link";
import { contestPhase, formatDate, type ContestSummary } from "@/lib/central";
import { ArrowRightIcon } from "@/components/icons";

const TONE: Record<ReturnType<typeof contestPhase>["tone"], string> = {
  green: "bg-success-green/10 text-success-green",
  blue: "bg-action-blue/10 text-action-blue",
  neutral: "bg-navy-primary/5 text-text-secondary",
  red: "bg-institutional-red/10 text-institutional-red",
};

export function ContestCard({
  contest,
  headingLevel = "h3",
}: {
  contest: ContestSummary;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const phase = contestPhase(contest);
  const place = [contest.city, contest.state].filter(Boolean).join("/");
  return (
    <article className="border-border bg-surface shadow-low hover:shadow-medium duration-base focus-within:ring-action-blue group relative flex h-full flex-col rounded-xl border p-6 transition-[transform,box-shadow] ease-out focus-within:ring-[3px] focus-within:ring-offset-2 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[phase.tone]}`}>
          {phase.label}
        </span>
        {contest.featured ? (
          <span className="bg-support-cyan/15 text-navy-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">
            Destaque
          </span>
        ) : null}
      </div>
      <Heading className="text-navy-primary mt-4 text-lg font-semibold leading-snug">
        <Link
          href={`/concursos/${contest.slug}`}
          className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
        >
          {contest.title}
        </Link>
      </Heading>
      {contest.fullName !== contest.title ? (
        <p className="text-text-secondary mt-1 text-sm">{contest.fullName}</p>
      ) : null}
      <p className="text-text-secondary mt-1 text-sm">
        {[contest.organization, place].filter(Boolean).join(" · ") || "Instituto Selecon"}
      </p>
      {contest.shortDescription ? (
        <p className="text-text-primary mt-3 flex-1 text-sm leading-relaxed">
          {contest.shortDescription}
        </p>
      ) : (
        <span className="flex-1" />
      )}
      <dl className="text-text-secondary mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {contest.registrationClosesAt ? (
          <>
            <dt>Inscrições até</dt>
            <dd className="text-navy-primary font-semibold">
              {formatDate(contest.registrationClosesAt)}
            </dd>
          </>
        ) : null}
        {contest.examDate ? (
          <>
            <dt>Prova</dt>
            <dd className="text-navy-primary font-semibold">{formatDate(contest.examDate)}</dd>
          </>
        ) : null}
      </dl>
      <span
        aria-hidden="true"
        className="text-action-blue mt-5 inline-flex items-center gap-1.5 text-sm font-semibold"
      >
        Ver concurso
        <ArrowRightIcon className="duration-base h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
      </span>
    </article>
  );
}
