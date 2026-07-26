import Link from "next/link";
import type { Metadata } from "next";
import type { ContestSummary } from "@selecon/contracts";
import { fetchApi } from "@/lib/api-server";

export const metadata: Metadata = {
  title: "Concursos | Instituto Selecon",
  description:
    "Catálogo de concursos públicos e processos seletivos organizados pelo Instituto Selecon.",
};

interface SearchParams {
  query?: string;
  educationLevel?: string;
  onlyOpenRegistrations?: string;
  sort?: string;
}

function buildQueryString(params: SearchParams): string {
  const search = new URLSearchParams();
  if (params.query) search.set("query", params.query);
  if (params.educationLevel) search.set("educationLevel", params.educationLevel);
  if (params.onlyOpenRegistrations)
    search.set("onlyOpenRegistrations", params.onlyOpenRegistrations);
  if (params.sort) search.set("sort", params.sort);
  return search.toString();
}

export default async function ContestsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const qs = buildQueryString(params);
  const contests = await fetchApi<ContestSummary[]>(`/public/contests${qs ? `?${qs}` : ""}`);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-navy-primary text-3xl font-bold">Concursos</h1>
      <p className="text-text-secondary mt-2">
        {contests.length} concurso{contests.length === 1 ? "" : "s"} encontrado
        {contests.length === 1 ? "" : "s"}.
      </p>

      <form
        className="mt-6 flex flex-wrap gap-3"
        method="get"
        role="search"
        aria-label="Filtrar concursos"
      >
        <label className="sr-only" htmlFor="query">
          Buscar por órgão, cargo ou palavra-chave
        </label>
        <input
          id="query"
          name="query"
          type="search"
          defaultValue={params.query}
          placeholder="Buscar por órgão, cargo ou palavra-chave"
          className="border-border min-w-[260px] flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <label className="sr-only" htmlFor="sort">
          Ordenar por
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={params.sort ?? "relevance"}
          className="border-border rounded-md border px-3 py-2 text-sm"
        >
          <option value="relevance">Relevância</option>
          <option value="opening">Abertura das inscrições</option>
          <option value="updated">Atualizados recentemente</option>
        </select>
        <button
          type="submit"
          className="bg-action-blue hover:bg-navy-secondary focus-visible:ring-action-blue min-h-11 rounded-md px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2"
        >
          Filtrar
        </button>
      </form>

      {contests.length === 0 ? (
        <p className="text-text-secondary mt-10">
          Nenhum concurso encontrado com os filtros aplicados.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contests.map((contest) => (
            <li key={contest.id} className="border-border bg-surface rounded-lg border p-5">
              <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide">
                {contest.organization}
              </p>
              <h2 className="text-navy-primary mt-1 text-lg font-semibold">
                <Link href={`/concursos/${contest.slug}`} className="hover:underline">
                  {contest.title}
                </Link>
              </h2>
              <p className="text-text-secondary mt-2 text-sm">{contest.shortDescription}</p>
              <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {contest.vacancies !== null && (
                  <div>
                    <dt className="sr-only">Vagas</dt>
                    <dd>
                      <strong>{contest.vacancies}</strong> vaga{contest.vacancies === 1 ? "" : "s"}
                    </dd>
                  </div>
                )}
                {contest.educationLevel && (
                  <div>
                    <dt className="sr-only">Escolaridade</dt>
                    <dd>{contest.educationLevel}</dd>
                  </div>
                )}
              </dl>
              <Link
                href={`/concursos/${contest.slug}`}
                className="bg-action-blue hover:bg-navy-secondary focus-visible:ring-action-blue mt-4 inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2"
              >
                Ver detalhes
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
