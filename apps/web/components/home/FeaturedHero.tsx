"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Icon, buttonClassNames } from "@selecon/ui";
import { ContestCover } from "@/components/contests/ContestCover";
import { StatusBadge } from "@/components/contests/StatusBadge";
import { CONTEST_KIND_LABEL } from "@/lib/content/labels";
import type { Contest } from "@/lib/content/types";
import { formatDate } from "@/lib/format";

interface FeaturedHeroProps {
  contests: Contest[];
  /** Intervalo de rotação automática em ms; desativada com `prefers-reduced-motion`. */
  intervalMs?: number;
}

function deadlineText(contest: Contest): string {
  if (contest.status === "INSCRICOES_ABERTAS" && contest.registration.closesAt) {
    return `Inscrições até ${formatDate(contest.registration.closesAt)}`;
  }
  if (contest.status === "PREVISTO") return "Edital em elaboração — ative os alertas";
  if (contest.examDate && contest.status === "EM_ANDAMENTO") return `Prova em ${formatDate(contest.examDate)}`;
  if (contest.registration.closesAt) return `Inscrições encerradas em ${formatDate(contest.registration.closesAt)}`;
  return CONTEST_KIND_LABEL[contest.kind];
}

/**
 * Hero grande com concursos em destaque: painel principal + lista de abas (padrão WAI-ARIA
 * Tabs). Rotação automática pausa com hover/foco e respeita redução de movimento.
 */
export function FeaturedHero({ contests, intervalMs = 8000 }: FeaturedHeroProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = contests[index] ?? contests[0];

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const listener = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || contests.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % contests.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, contests.length, intervalMs]);

  if (!active) return null;

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, current: number) => {
    let next: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (current + 1) % contests.length;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (current - 1 + contests.length) % contests.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = contests.length - 1;
    if (next === null) return;
    event.preventDefault();
    setIndex(next);
    tabRefs.current[next]?.focus();
  };

  const primaryLink = active.serviceLinks.find((link) => link.key === "INSCRICAO");

  return (
    <div
      className="grid gap-4 lg:grid-cols-[1.6fr_1fr]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${index}`}
        className="relative min-h-[26rem] overflow-hidden rounded-xl shadow-high lg:min-h-[30rem]"
      >
        <ContestCover
          cover={active.cover}
          label={active.organization.shortName}
          uf={active.organization.uf}
          size="hero"
          plain
          priority
          className="absolute inset-0"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-navy-primary via-navy-primary/70 to-navy-primary/10"
        />
        <div className="relative flex h-full flex-col justify-end p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={active.status} />
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {active.organization.uf} · {CONTEST_KIND_LABEL[active.kind]}
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold text-support-cyan">{active.organization.name}</p>
          <h2 className="mt-1 max-w-2xl text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
            {active.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">{active.summary}</p>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Destaques do concurso">
            {active.highlights.map((item) => (
              <li
                key={item}
                className="rounded-md border border-white/25 bg-white/10 px-2.5 py-1 text-sm font-medium text-white"
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href={`/concursos/${active.slug}`} className={buttonClassNames("inverse", "", "lg")}>
              Ver página do edital
              <Icon name="arrow-right" size={18} />
            </Link>
            {primaryLink && active.status === "INSCRICOES_ABERTAS" ? (
              <a
                href={primaryLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClassNames("cyan", "", "lg")}
              >
                Inscreva-se
                <Icon name="external-link" size={16} label="abre em nova aba" />
              </a>
            ) : null}
            <span className="inline-flex items-center gap-2 text-sm font-medium text-white/90">
              <Icon name="calendar" size={16} className="text-support-cyan" />
              {deadlineText(active)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-support-cyan">Concursos em destaque</p>
          {contests.length > 1 && !reducedMotion ? (
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-pressed={paused}
              className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
            >
              {paused ? "Retomar rotação" : "Pausar rotação"}
            </button>
          ) : null}
        </div>
        <div role="tablist" aria-orientation="vertical" aria-label="Escolher concurso em destaque" className="grid gap-2">
          {contests.map((contest, i) => {
            const selected = i === index;
            return (
              <button
                key={contest.slug}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`${baseId}-tab-${i}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setIndex(i)}
                onKeyDown={(event) => onTabKeyDown(event, i)}
                className={[
                  "flex min-h-14 w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  selected
                    ? "border-support-cyan bg-white text-navy-primary shadow-medium"
                    : "border-white/15 bg-white/5 text-white hover:bg-white/10",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={`h-10 w-1 shrink-0 rounded-full ${selected ? "bg-support-cyan" : "bg-white/20"}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{contest.organization.shortName}</span>
                  <span className={`block truncate text-xs ${selected ? "text-text-secondary" : "text-white/70"}`}>
                    {contest.highlights[0]} · {deadlineText(contest)}
                  </span>
                </span>
                <StatusBadge status={contest.status} className="hidden sm:inline-flex" />
              </button>
            );
          })}
        </div>
        <Link
          href="/concursos"
          className="mt-3 inline-flex min-h-11 items-center gap-2 self-start px-1 text-sm font-semibold text-white underline-offset-4 hover:underline"
        >
          Ver todos os concursos
          <Icon name="arrow-right" size={16} />
        </Link>
      </div>
    </div>
  );
}
