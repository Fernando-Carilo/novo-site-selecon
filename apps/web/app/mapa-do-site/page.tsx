import Link from "next/link";
import type { Metadata } from "next";
import { Container, SectionHeading } from "@selecon/ui";
import { PageHeader } from "@/components/PageHeader";
import { getContentProvider, type Contest } from "@/lib/content";
import { SERVICES } from "@/lib/content/data/services";
import { CANDIDATE_CTA, FOOTER_COLUMNS, PRIMARY_NAV, UTILITY_NAV, type NavItem } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mapa do site",
  description:
    "Todas as páginas públicas do portal do Instituto Selecon: concursos, instituto, serviços, atendimento, integridade, notícias e páginas de apoio.",
  alternates: { canonical: "/mapa-do-site" },
};

/** Reúne os itens de navegação únicos por `href`, preservando a ordem de aparição. */
function uniqueLinks(groups: NavItem[][]): NavItem[] {
  const seen = new Set<string>();
  const result: NavItem[] = [];
  for (const group of groups) {
    for (const item of group) {
      if (seen.has(item.href)) continue;
      seen.add(item.href);
      result.push(item);
    }
  }
  return result;
}

async function listAllContests(): Promise<Contest[]> {
  const content = getContentProvider();
  const first = await content.listContests({ status: "TODOS", sort: "atualizacao", page: 1 });
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, index) =>
      content.listContests({ status: "TODOS", sort: "atualizacao", page: index + 2 }),
    ),
  );
  return [first, ...rest].flatMap((page) => page.items);
}

function LinkList({ items }: { items: { href: string; label: string }[] }) {
  return (
    <ul className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="text-navy-primary hover:text-action-blue inline-flex min-h-11 items-center text-base underline-offset-4 hover:underline"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function SitemapPage() {
  const [contests, news] = await Promise.all([listAllContests(), getContentProvider().listNews()]);

  const mainPages = uniqueLinks([
    PRIMARY_NAV.map(({ href, label }) => ({ href, label })),
    [CANDIDATE_CTA],
    UTILITY_NAV,
  ]);

  const institutePages = uniqueLinks([
    PRIMARY_NAV.find((item) => item.href === "/instituto")?.children ?? [],
    FOOTER_COLUMNS.find((column) => column.title === "O Instituto")?.links ?? [],
  ]);

  const contestPages = uniqueLinks([
    FOOTER_COLUMNS.find((column) => column.title === "Concursos")?.links ?? [],
  ]);
  const servicePages = uniqueLinks([
    FOOTER_COLUMNS.find((column) => column.title === "Atendimento")?.links ?? [],
  ]);
  const supportPages = uniqueLinks([
    FOOTER_COLUMNS.find((column) => column.title === "Transparência")?.links ?? [],
    [{ href: "/mapa-do-site", label: "Mapa do site" }],
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Navegação"
        title="Mapa do site"
        description="Todas as páginas públicas do portal, agrupadas por área. Páginas de concursos e notícias são listadas conforme as publicações vigentes."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Mapa do site" }]}
      />

      <Container className="py-10 sm:py-14">
        <div className="space-y-12">
          <section aria-labelledby="principais-title">
            <SectionHeading id="principais-title" title="Páginas principais" />
            <LinkList items={[{ href: "/", label: "Início" }, ...mainPages]} />
          </section>

          <section aria-labelledby="instituto-title">
            <SectionHeading id="instituto-title" title="O Instituto" />
            <LinkList items={institutePages} />
          </section>

          <section aria-labelledby="servicos-title">
            <SectionHeading id="servicos-title" title="Serviços" />
            <LinkList
              items={[
                { href: "/servicos", label: "Todos os serviços" },
                ...SERVICES.map((service) => ({
                  href: `/servicos/${service.slug}`,
                  label: service.title,
                })),
                { href: "/comercial", label: "Solicite uma proposta" },
              ]}
            />
          </section>

          <section aria-labelledby="concursos-title">
            <SectionHeading
              id="concursos-title"
              title="Concursos"
              description={`${contests.length} ${contests.length === 1 ? "página de concurso publicada" : "páginas de concursos publicadas"}.`}
            />
            <LinkList items={contestPages} />
            <h3 className="text-navy-primary mt-6 text-lg font-bold">Páginas de edital</h3>
            <LinkList
              items={contests.map((contest) => ({
                href: `/concursos/${contest.slug}`,
                label: `${contest.title} — ${contest.organization.shortName}`,
              }))}
            />
          </section>

          <section aria-labelledby="atendimento-title">
            <SectionHeading id="atendimento-title" title="Atendimento e integridade" />
            <LinkList items={servicePages} />
          </section>

          <section aria-labelledby="noticias-title">
            <SectionHeading
              id="noticias-title"
              title="Notícias"
              description={`${news.length} ${news.length === 1 ? "publicação" : "publicações"}.`}
            />
            <LinkList
              items={[
                { href: "/noticias", label: "Todas as notícias" },
                ...news.map((post) => ({ href: `/noticias/${post.slug}`, label: post.title })),
              ]}
            />
          </section>

          <section aria-labelledby="apoio-title">
            <SectionHeading id="apoio-title" title="Transparência e páginas de apoio" />
            <LinkList items={supportPages} />
          </section>
        </div>
      </Container>
    </>
  );
}
