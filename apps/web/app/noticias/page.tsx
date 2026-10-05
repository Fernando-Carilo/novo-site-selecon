import Link from "next/link";
import type { Metadata } from "next";
import { Card, Container, Icon, buttonClassNames } from "@selecon/ui";
import { AlertsForm } from "@/components/home/AlertsForm";
import { PageHeader } from "@/components/PageHeader";
import { getContentProvider, type NewsPost } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Notícias e comunicados",
  description:
    "Notícias, comunicados e resultados publicados pelo Instituto Selecon sobre concursos públicos, processos seletivos e a atuação institucional.",
  alternates: { canonical: "/noticias" },
};

type Category = NewsPost["category"];

const CATEGORY_LABEL: Record<Category, string> = {
  CONCURSOS: "Concursos",
  INSTITUCIONAL: "Institucional",
  RESULTADOS: "Resultados",
  COMUNICADOS: "Comunicados",
};

/** Parâmetro legível na URL (`?categoria=resultados`) → categoria do modelo. */
const CATEGORY_BY_PARAM: Record<string, Category> = {
  concursos: "CONCURSOS",
  institucional: "INSTITUCIONAL",
  resultados: "RESULTADOS",
  comunicados: "COMUNICADOS",
};

interface NewsPageProps {
  searchParams: Promise<{ categoria?: string | string[] }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const rawParam = Array.isArray(params.categoria) ? params.categoria[0] : params.categoria;
  const selected = rawParam ? CATEGORY_BY_PARAM[rawParam.toLowerCase()] : undefined;

  const all = await getContentProvider().listNews();
  const posts = selected ? all.filter((post) => post.category === selected) : all;

  const filters: { param?: string; label: string; count: number }[] = [
    { label: "Todas", count: all.length },
    ...Object.entries(CATEGORY_BY_PARAM).map(([param, category]) => ({
      param,
      label: CATEGORY_LABEL[category],
      count: all.filter((post) => post.category === category).length,
    })),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Notícias"
        title="Notícias e comunicados"
        description="Publicações da Assessoria de Comunicação sobre concursos, resultados e a atuação do Instituto, em ordem cronológica. Documentos oficiais (editais, gabaritos, resultados) ficam sempre na página de cada concurso."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Notícias" }]}
      />

      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div className="min-w-0">
            <nav aria-label="Filtrar por categoria">
              <ul className="flex flex-wrap gap-2">
                {filters.map((filter) => {
                  const active = filter.param
                    ? selected === CATEGORY_BY_PARAM[filter.param]
                    : !selected;
                  return (
                    <li key={filter.label}>
                      <Link
                        href={filter.param ? `/noticias?categoria=${filter.param}` : "/noticias"}
                        aria-current={active ? "page" : undefined}
                        className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${
                          active
                            ? "border-navy-primary bg-navy-primary text-white"
                            : "border-border bg-surface text-navy-primary hover:border-action-blue hover:text-action-blue"
                        }`}
                      >
                        {filter.label}
                        <span
                          className={`tabular-nums ${active ? "text-white/80" : "text-text-secondary"}`}
                        >
                          ({filter.count})
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <section aria-labelledby="lista-title" className="mt-8">
              <h2 id="lista-title" className="text-navy-primary text-lg font-bold">
                {selected ? `${CATEGORY_LABEL[selected]}: ` : ""}
                {posts.length === 1 ? "1 publicação" : `${posts.length} publicações`}
              </h2>

              {posts.length === 0 ? (
                <div className="border-border bg-surface mt-6 rounded-lg border p-6">
                  <p className="text-text-primary text-base">
                    Nenhuma publicação nesta categoria por enquanto.
                  </p>
                  <Link href="/noticias" className={buttonClassNames("secondary", "mt-4")}>
                    Ver todas as notícias
                  </Link>
                </div>
              ) : (
                <ul className="mt-6 grid gap-6 md:grid-cols-2">
                  {posts.map((post) => (
                    <li key={post.slug}>
                      <Card as="article" interactive className="relative flex h-full flex-col">
                        <p className="text-action-blue text-xs font-semibold uppercase tracking-wide">
                          {CATEGORY_LABEL[post.category]}
                          {" · "}
                          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                        </p>
                        <h3 className="text-navy-primary mt-2 text-lg font-bold leading-snug">
                          <Link
                            href={`/noticias/${post.slug}`}
                            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                          >
                            {post.title}
                          </Link>
                        </h3>
                        <p className="text-text-secondary mt-2 flex-1 text-sm leading-relaxed">
                          {post.excerpt}
                        </p>
                        <span className="text-action-blue mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                          Ler notícia
                          <Icon name="arrow-right" size={16} />
                        </span>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside
            className="space-y-6 lg:sticky lg:top-24 lg:self-start"
            aria-label="Alertas e imprensa"
          >
            <div className="border-border bg-surface rounded-lg border p-5">
              <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
                Alertas de editais
              </p>
              <h2 className="text-navy-primary mt-1 text-lg font-bold">
                Receba novos editais por e-mail
              </h2>
              <p className="text-text-secondary mt-2 text-sm">
                Apenas publicações oficiais. Sem spam.
              </p>
              <div className="mt-4">
                <AlertsForm compact />
              </div>
            </div>
            <div className="border-border bg-surface rounded-lg border p-5">
              <h2 className="text-navy-primary text-lg font-bold">Imprensa</h2>
              <p className="text-text-secondary mt-2 text-sm">
                Jornalistas encontram contatos, números-chave e a marca oficial na página de
                imprensa.
              </p>
              <Link href="/imprensa" className={buttonClassNames("secondary", "mt-4 w-full")}>
                Sala de imprensa
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
