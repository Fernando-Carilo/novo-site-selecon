import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonClassNames } from "@selecon/ui";
import { contestPhase, formatDate, getContest, listNews } from "@/lib/central";
import { NewsCard } from "@/components/content/NewsCard";
import { ArrowRightIcon, FileSearchIcon } from "@/components/icons";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = await getContest(slug);
  if (!c) return { title: "Concurso não encontrado" };
  return { title: c.title, description: c.shortDescription || `${c.fullName} — Instituto Selecon` };
}

const TONE: Record<ReturnType<typeof contestPhase>["tone"], string> = {
  green: "bg-success-green/10 text-success-green",
  blue: "bg-action-blue/10 text-action-blue",
  neutral: "bg-navy-primary/5 text-text-secondary",
  red: "bg-institutional-red/10 text-institutional-red",
};

export default async function ContestDetailPage({ params }: Params) {
  const { slug } = await params;
  const c = await getContest(slug);
  if (!c) notFound();
  const phase = contestPhase(c);
  const place = [c.city, c.state].filter(Boolean).join("/");
  const today = new Date(new Date().toISOString().slice(0, 10));
  const news = (await listNews(50)).filter((n) => n.contest?.slug === c.slug).slice(0, 3);
  const keyDates = [
    { label: "Início das inscrições", value: formatDate(c.registrationOpensAt) },
    { label: "Fim das inscrições", value: formatDate(c.registrationClosesAt) },
    { label: "Prova", value: formatDate(c.examDate) },
  ].filter((d) => d.value);

  return (
    <article className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <nav aria-label="Trilha" className="text-text-secondary text-sm">
        <Link
          href="/concursos"
          className="hover:text-action-blue underline-offset-4 hover:underline"
        >
          Concursos
        </Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[phase.tone]}`}
            >
              {phase.label}
            </span>
            {c.featured ? (
              <span className="bg-support-cyan/15 text-navy-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">
                Destaque
              </span>
            ) : null}
          </div>
          <h1 className="text-navy-primary mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {c.title}
          </h1>
          {c.fullName !== c.title ? (
            <p className="text-text-secondary mt-2 text-lg">{c.fullName}</p>
          ) : null}
          <p className="text-text-secondary mt-1 text-sm">
            {[c.organization, place].filter(Boolean).join(" · ") || "Instituto Selecon"}
          </p>
          {c.shortDescription ? (
            <p className="text-text-primary mt-6 text-lg leading-relaxed">{c.shortDescription}</p>
          ) : null}

          {keyDates.length ? (
            <dl className="mt-8 grid gap-4 sm:grid-cols-3">
              {keyDates.map((d) => (
                <div
                  key={d.label}
                  className="border-border bg-surface shadow-low rounded-xl border p-4"
                >
                  <dt className="text-text-secondary text-xs font-semibold uppercase tracking-wide">
                    {d.label}
                  </dt>
                  <dd className="text-navy-primary mt-1 text-xl font-bold">{d.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <section aria-labelledby="schedule-title" className="mt-12">
            <h2 id="schedule-title" className="text-navy-primary text-2xl font-bold">
              Cronograma
            </h2>
            {c.milestones.length === 0 ? (
              <p className="text-text-secondary mt-3 text-sm">
                O cronograma deste concurso ainda não foi publicado. Consulte o edital nos
                documentos oficiais.
              </p>
            ) : (
              <ol className="mt-5 space-y-3">
                {c.milestones.map((m) => {
                  const past = m.date ? new Date(m.date) < today : false;
                  const cancelled = m.status === "CANCELADO";
                  return (
                    <li
                      key={m.id}
                      className={`border-border bg-surface flex gap-4 rounded-lg border p-4 ${cancelled ? "opacity-60" : ""}`}
                    >
                      <time
                        dateTime={m.date ?? undefined}
                        className={`w-28 shrink-0 text-sm font-semibold tabular-nums ${past ? "text-text-secondary" : "text-navy-primary"}`}
                      >
                        {formatDate(m.date) ?? "A definir"}
                      </time>
                      <div>
                        <p
                          className={`text-sm font-semibold ${cancelled ? "text-text-secondary line-through" : "text-navy-primary"}`}
                        >
                          {m.label}
                          {cancelled ? " (cancelado)" : ""}
                        </p>
                        {m.description ? (
                          <p className="text-text-secondary mt-0.5 text-sm">{m.description}</p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section aria-labelledby="documents-title" className="mt-12">
            <h2 id="documents-title" className="text-navy-primary text-2xl font-bold">
              Documentos oficiais
            </h2>
            {c.documents.length === 0 ? (
              <p className="text-text-secondary mt-3 text-sm">
                Nenhum documento publicado para este concurso até o momento.
              </p>
            ) : (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {c.documents.map((d) => (
                  <li key={d.id}>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-border bg-surface hover:border-action-blue group flex min-h-14 items-center gap-3 rounded-lg border p-4 transition-colors"
                    >
                      <span className="bg-action-blue/10 text-action-blue flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                        <FileSearchIcon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="text-navy-primary block truncate text-sm font-semibold">
                          {d.title}
                        </span>
                        <span className="text-text-secondary block text-xs">
                          {[d.type, formatDate(d.publicDate)].filter(Boolean).join(" · ") ||
                            "Abre em nova aba"}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {c.faqs.length ? (
            <section aria-labelledby="faq-title" className="mt-12">
              <h2 id="faq-title" className="text-navy-primary text-2xl font-bold">
                Perguntas frequentes
              </h2>
              <div className="mt-5 space-y-2">
                {c.faqs.map((f) => (
                  <details key={f.id} className="border-border bg-surface group rounded-lg border">
                    <summary className="text-navy-primary flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                      {f.question}
                      <ArrowRightIcon className="text-text-secondary h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="text-text-primary whitespace-pre-line px-4 pb-4 text-sm leading-relaxed">
                      {f.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="lg:col-span-4">
          <div className="border-border bg-surface shadow-high sticky top-24 rounded-xl border p-6">
            <p className="text-action-blue text-xs font-semibold uppercase tracking-[0.12em]">
              Candidato
            </p>
            <h2 className="text-navy-primary mt-2 text-xl font-bold">Inscrição e acompanhamento</h2>
            <p className="text-text-secondary mt-2 text-sm leading-relaxed">
              Inscrição, comprovante, local de prova, recursos e resultado individual são feitos na
              área do candidato.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/candidato" className={buttonClassNames("primary", "w-full", "lg")}>
                Área do candidato
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link href="/atendimento" className={buttonClassNames("secondary", "w-full")}>
                Falar com o atendimento
              </Link>
            </div>
            {c.publishedAt ? (
              <p className="text-text-secondary mt-4 text-xs">
                Publicado no portal em {formatDate(c.publishedAt)}.
              </p>
            ) : null}
          </div>
        </aside>
      </div>

      {news.length ? (
        <section aria-labelledby="contest-news-title" className="mt-16">
          <h2 id="contest-news-title" className="text-navy-primary text-2xl font-bold">
            Comunicados deste concurso
          </h2>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <li key={n.id}>
                <NewsCard post={n} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
