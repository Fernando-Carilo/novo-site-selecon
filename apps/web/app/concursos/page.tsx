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
  status?: string;
  educationLevel?: string;
  sort?: string;
}

function buildQueryString(params: SearchParams): string {
  const search = new URLSearchParams();
  if (params.query) search.set("query", params.query);
  if (params.status && params.status !== "todos") search.set("status", params.status);
  if (params.educationLevel) search.set("educationLevel", params.educationLevel);
  if (params.sort) search.set("sort", params.sort);
  return search.toString();
}

const STATUS_FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "inscricoes-abertas", label: "Inscrições abertas" },
  { value: "em-andamento", label: "Em andamento" },
  { value: "encerrados", label: "Encerrados" },
];

export default async function ContestsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const qs = buildQueryString(params);
  const contests = await fetchApi<ContestSummary[]>(`/public/contests${qs ? `?${qs}` : ""}`);

  return (
    <>
      {/* Hero */}
      <section
        className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 py-16 sm:py-20"
        aria-label="Concursos"
      >
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto text-center">
          <p className="text-[13px] font-black uppercase tracking-wider text-green">
            Concursos e processos seletivos
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Concursos Públicos
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
            Confira todos os concursos e processos seletivos organizados pelo Instituto Selecon.
          </p>
        </div>
      </section>

      {/* Filters + Listing */}
      <section className="bg-white py-16 sm:py-[92px]" aria-labelledby="contests-listing">
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
          <h2 id="contests-listing" className="sr-only">
            Lista de concursos
          </h2>

          <form
            className="flex flex-wrap items-end gap-3"
            method="get"
            role="search"
            aria-label="Filtrar concursos"
          >
            <div className="min-w-[260px] flex-1">
              <label
                htmlFor="query"
                className="block text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Buscar
              </label>
              <input
                id="query"
                name="query"
                type="search"
                defaultValue={params.query}
                placeholder="Órgão, cargo ou palavra-chave"
                className="mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={params.status ?? "todos"}
                className="mt-1 rounded-md border border-line px-3 py-2.5 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="sort"
                className="block text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Ordenar
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={params.sort ?? "relevance"}
                className="mt-1 rounded-md border border-line px-3 py-2.5 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              >
                <option value="relevance">Relevância</option>
                <option value="opening">Abertura das inscrições</option>
                <option value="updated">Atualizados recentemente</option>
              </select>
            </div>

            <button
              type="submit"
              className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base"
            >
              Filtrar
            </button>
          </form>

          <p className="mt-6 text-sm text-muted">
            {contests.length} concurso{contests.length === 1 ? "" : "s"} encontrado
            {contests.length === 1 ? "" : "s"}
          </p>

          {contests.length === 0 ? (
            <p className="mt-10 text-sm text-muted">
              Nenhum concurso encontrado com os filtros aplicados.
            </p>
          ) : (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {contests.map((contest) => (
                <li
                  key={contest.id}
                  className="rounded-lg border border-line bg-white p-5 transition-all duration-base hover:-translate-y-1 hover:border-green/40 hover:shadow-md"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {contest.organization}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-ink">
                    <Link href={`/concursos/${contest.slug}`} className="hover:underline">
                      {contest.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    {contest.shortDescription}
                  </p>
                  <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    {contest.vacancies !== null && (
                      <div>
                        <dt className="sr-only">Vagas</dt>
                        <dd>
                          <strong className="text-ink">{contest.vacancies}</strong> vaga
                          {contest.vacancies === 1 ? "" : "s"}
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
                    className="mt-4 min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base"
                  >
                    Ver detalhes
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
