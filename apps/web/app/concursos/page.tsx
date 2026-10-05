import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, Icon, buttonClassNames } from "@selecon/ui";
import { PageHeader } from "@/components/PageHeader";
import { ActiveFilters } from "@/components/contests/ActiveFilters";
import { CatalogFilters } from "@/components/contests/CatalogFilters";
import { ContestCard } from "@/components/contests/ContestCard";
import { Pagination } from "@/components/contests/Pagination";
import { AlertsForm } from "@/components/home/AlertsForm";
import { ContestSearchForm } from "@/components/home/ContestSearchForm";
import { getContentProvider } from "@/lib/content";
import { CONTEST_AREA_LABEL, UF_LABEL } from "@/lib/content/labels";
import type { ContestCatalogFilters, ContestPublicStatus } from "@/lib/content/types";
import {
  CATALOG_PATH,
  catalogHref,
  describeActiveFilters,
  hasActiveFilters,
  parseCatalogSearchParams,
  type CatalogSearchParams,
} from "@/lib/contests/search-params";
import { formatInteger } from "@/lib/format";

interface CatalogPageProps {
  searchParams: Promise<CatalogSearchParams>;
}

const CATALOG_DESCRIPTION =
  "Concursos públicos, processos seletivos e seleções escolares organizados pelo Instituto Selecon: filtre por situação, estado, área, escolaridade e tipo, e abra a página do edital com cronograma, cargos e documentos vigentes.";

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const filters = parseCatalogSearchParams(await searchParams);
  const title = filters.q ? `Concursos: “${filters.q}”` : "Catálogo de concursos";
  return {
    title,
    description: CATALOG_DESCRIPTION,
    alternates: { canonical: CATALOG_PATH },
    openGraph: {
      title: `${title} | Instituto Selecon`,
      description: CATALOG_DESCRIPTION,
      url: CATALOG_PATH,
    },
  };
}

interface StatusTab {
  label: string;
  status?: ContestCatalogFilters["status"];
  count: number;
  active: boolean;
}

function pluralize(count: number, singular: string, plural: string): string {
  return `${formatInteger(count)} ${count === 1 ? singular : plural}`;
}

export default async function ContestsCatalogPage({ searchParams }: CatalogPageProps) {
  const filters = parseCatalogSearchParams(await searchParams);
  const content = getContentProvider();
  const result = await content.listContests(filters);

  const statusCount = new Map<ContestPublicStatus, number>(
    result.facets.statuses.map((facet) => [facet.value, facet.count]),
  );
  const totalPublished = result.facets.statuses.reduce((sum, facet) => sum + facet.count, 0);

  const tabs: StatusTab[] = [
    { label: "Todos", status: undefined, count: totalPublished, active: !filters.status },
    {
      label: "Inscrições abertas",
      status: "ABERTOS",
      count: statusCount.get("INSCRICOES_ABERTAS") ?? 0,
      active: filters.status === "ABERTOS" || filters.status === "INSCRICOES_ABERTAS",
    },
    {
      label: "Em andamento",
      status: "EM_ANDAMENTO",
      count: statusCount.get("EM_ANDAMENTO") ?? 0,
      active: filters.status === "EM_ANDAMENTO",
    },
    {
      label: "Encerrados",
      status: "ENCERRADO",
      count: statusCount.get("ENCERRADO") ?? 0,
      active: filters.status === "ENCERRADO",
    },
  ];

  const suggestions = Array.from(
    new Set([
      ...result.facets.ufs.map((facet) => UF_LABEL[facet.value]),
      ...result.facets.areas.map((facet) => CONTEST_AREA_LABEL[facet.value]),
      ...result.items.flatMap((contest) => [
        contest.organization.shortName,
        contest.organization.city,
        contest.editalNumber,
      ]),
    ]),
  ).slice(0, 60);

  const activeChips = describeActiveFilters(filters);
  const filtered = hasActiveFilters(filters);
  const emptyDescription = activeChips
    .map((chip) => `${chip.name.toLowerCase()} ${chip.label}`)
    .join(", ");

  return (
    <>
      <PageHeader
        eyebrow="Concursos"
        title="Catálogo de concursos"
        description={`${pluralize(totalPublished, "concurso publicado", "concursos publicados")} pelo Instituto Selecon, com ${pluralize(statusCount.get("INSCRICOES_ABERTAS") ?? 0, "edital com inscrições abertas", "editais com inscrições abertas")}. Pesquise, filtre e abra a página do edital para ver cronograma, cargos e documentos vigentes.`}
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Concursos" }]}
      />

      <Container className="py-8">
        <ContestSearchForm
          suggestions={suggestions}
          defaultValue={filters.q ?? ""}
          variant="inline"
        />

        <nav aria-label="Situação do concurso" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <li key={tab.label}>
                <Link
                  href={catalogHref(filters, { status: tab.status })}
                  aria-current={tab.active ? "page" : undefined}
                  className={[
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                    tab.active
                      ? "border-navy-primary bg-navy-primary text-white"
                      : "border-border-strong bg-surface text-navy-primary hover:border-action-blue hover:text-action-blue",
                  ].join(" ")}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                      tab.active ? "bg-white/15 text-white" : "bg-wash-neutral text-text-secondary"
                    }`}
                  >
                    {formatInteger(tab.count)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside aria-label="Filtros do catálogo" className="lg:sticky lg:top-24 lg:self-start">
            <CatalogFilters filters={filters} facets={result.facets} />
          </aside>

          <section aria-labelledby="resultados-title" className="min-w-0">
            <h2 id="resultados-title" className="sr-only">
              Resultados
            </h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <p className="text-text-secondary text-sm" role="status">
                Mostrando{" "}
                <span className="text-navy-primary font-semibold tabular-nums">
                  {formatInteger(result.items.length)}
                </span>{" "}
                de{" "}
                <span className="text-navy-primary font-semibold tabular-nums">
                  {formatInteger(result.total)}
                </span>{" "}
                {result.total === 1 ? "concurso" : "concursos"}
                {result.totalPages > 1 ? (
                  <>
                    {" "}
                    (página <span className="tabular-nums">{result.page}</span> de{" "}
                    <span className="tabular-nums">{result.totalPages}</span>)
                  </>
                ) : null}
              </p>
            </div>
            {activeChips.length > 0 ? (
              <div className="mt-3">
                <ActiveFilters filters={filters} />
              </div>
            ) : null}

            {result.items.length > 0 ? (
              <ul className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {result.items.map((contest) => (
                  <li key={contest.slug}>
                    <ContestCard contest={contest} headingLevel="h3" />
                  </li>
                ))}
              </ul>
            ) : (
              <Card padding="lg" className="mt-6">
                <div className="flex gap-4">
                  <span className="bg-wash-blue text-action-blue flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <Icon name="search" size={24} />
                  </span>
                  <div>
                    <h3 className="text-navy-primary text-xl font-bold">
                      {filtered
                        ? `Nenhum concurso encontrado para ${emptyDescription}`
                        : "Nenhum concurso publicado no momento"}
                    </h3>
                    <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                      {filters.q
                        ? "Tente termos mais gerais, como o nome do órgão, da cidade ou do cargo, e confira se não há erro de digitação. A busca ignora acentos e aceita siglas como GCM, PM e PSS."
                        : "Combine menos filtros ou veja todos os concursos. Você também pode ativar alertas para ser avisado quando um novo edital for publicado."}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-3">
                      {filtered ? (
                        <li>
                          <Link href={CATALOG_PATH} className={buttonClassNames("primary")}>
                            Limpar filtros
                          </Link>
                        </li>
                      ) : null}
                      <li>
                        <Link
                          href={catalogHref({}, { status: "ABERTOS" })}
                          className={buttonClassNames("secondary")}
                        >
                          Ver inscrições abertas
                        </Link>
                      </li>
                      <li>
                        <a href="#alertas" className={buttonClassNames("secondary")}>
                          <Icon name="bell" size={16} />
                          Ativar alertas
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {result.totalPages > 1 ? (
              <div className="mt-10">
                <Pagination filters={filters} page={result.page} totalPages={result.totalPages} />
              </div>
            ) : null}
          </section>
        </div>
      </Container>

      <section className="bg-surface py-14" aria-labelledby="alertas-title">
        <Container>
          <div
            id="alertas"
            className="border-border bg-background-light grid scroll-mt-24 gap-8 rounded-lg border p-6 sm:p-8 lg:grid-cols-[1fr_1.2fr] lg:items-start"
          >
            <div>
              <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
                Alertas de editais
              </p>
              <h2 id="alertas-title" className="text-navy-primary mt-1 text-2xl font-bold">
                Receber alertas de novos editais
              </h2>
              <p className="text-text-secondary mt-3 text-sm leading-relaxed">
                Avisamos por e-mail quando um edital é publicado, retificado ou tem resultado
                divulgado. Escolha um estado para receber apenas o que interessa. Sem spam: apenas
                publicações oficiais, e você pode cancelar a qualquer momento.
              </p>
            </div>
            <AlertsForm />
          </div>
        </Container>
      </section>
    </>
  );
}
