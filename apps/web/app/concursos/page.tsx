import type { Metadata } from "next";
import Link from "next/link";
import { buttonClassNames } from "@selecon/ui";
import { isCentralConfigured, listContests } from "@/lib/central";
import { ContestCard } from "@/components/content/ContestCard";
import { EmptyState, SectionIntro } from "@/components/content/EmptyState";
import { SearchIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Concursos",
  description:
    "Concursos públicos e processos seletivos organizados pelo Instituto Selecon: inscrições, cronograma, documentos oficiais e resultados.",
};

const STATUS_FILTERS = [
  { key: "", label: "Todos" },
  { key: "PUBLISHED", label: "Em andamento" },
  { key: "CLOSED", label: "Encerrados" },
] as const;

interface ContestsPageProps {
  searchParams: Promise<{ q?: string | string[]; status?: string | string[] }>;
}

function catalogHref(q: string, status: string) {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (status) qs.set("status", status);
  const s = qs.toString();
  return `/concursos${s ? `?${s}` : ""}`;
}

/** Catálogo de concursos lido da Selecon Central (certames ligados em "Concursos no site"). */
export default async function ContestsPage({ searchParams }: ContestsPageProps) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status)?.trim() ?? "";
  const contests = await listContests({ q: q || undefined, status: status || undefined });

  return (
    <section
      aria-labelledby="contests-title"
      className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20"
    >
      <SectionIntro
        id="contests-title"
        eyebrow="Catálogo"
        title="Concursos"
        description="Concursos públicos e processos seletivos organizados pelo Instituto Selecon, com cronograma, documentos oficiais e orientações."
      />

      <form role="search" action="/concursos" method="get" className="mt-10">
        <label htmlFor="catalog-search" className="text-navy-primary block text-sm font-semibold">
          Buscar
        </label>
        <div className="border-border bg-surface shadow-low focus-within:border-action-blue focus-within:ring-action-blue/25 mt-2 flex items-center gap-2 rounded-lg border p-1.5 pl-4 transition-[box-shadow,border-color] focus-within:ring-4">
          <SearchIcon className="text-text-secondary h-5 w-5 shrink-0" />
          <input
            id="catalog-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Órgão, cargo ou cidade"
            className="text-text-primary placeholder:text-text-secondary/80 min-h-11 w-full min-w-0 bg-transparent text-base outline-none focus-visible:outline-none"
          />
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <button type="submit" className={buttonClassNames("primary", "shrink-0 px-5")}>
            Buscar
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por situação">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.key;
          return (
            <Link
              key={f.key}
              href={catalogHref(q, f.key)}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors ${
                active
                  ? "border-navy-primary bg-navy-primary text-white"
                  : "border-border bg-surface text-navy-primary hover:border-action-blue"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-10">
        {contests.length === 0 ? (
          <EmptyState
            title={
              !isCentralConfigured()
                ? "Catálogo indisponível no momento"
                : q || status
                  ? "Nenhum concurso encontrado"
                  : "Nenhum concurso publicado"
            }
            description={
              !isCentralConfigured()
                ? "A fonte de conteúdo do portal não está configurada neste ambiente."
                : q || status
                  ? "Tente outro termo ou remova o filtro."
                  : "Assim que um concurso for publicado, ele aparece aqui."
            }
          >
            {q || status ? (
              <Link href="/concursos" className={buttonClassNames("secondary")}>
                Limpar busca
              </Link>
            ) : null}
          </EmptyState>
        ) : (
          <>
            <p className="text-text-secondary text-sm" role="status">
              {contests.length} {contests.length === 1 ? "concurso" : "concursos"}
              {q ? ` para “${q}”` : ""}
            </p>
            <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {contests.map((c) => (
                <li key={c.id}>
                  <ContestCard contest={c} headingLevel="h2" />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
