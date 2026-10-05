import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, Container, Icon, buttonClassNames } from "@selecon/ui";
import { PageHeader } from "@/components/PageHeader";
import { getContentProvider, type NewsPost } from "@/lib/content";
import { formatLongDate } from "@/lib/format";
import { SITE_NAME, SITE_URL } from "@/lib/site";

interface NewsArticlePageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_LABEL: Record<NewsPost["category"], string> = {
  CONCURSOS: "Concursos",
  INSTITUCIONAL: "Institucional",
  RESULTADOS: "Resultados",
  COMUNICADOS: "Comunicados",
};

const CATEGORY_PARAM: Record<NewsPost["category"], string> = {
  CONCURSOS: "concursos",
  INSTITUCIONAL: "institucional",
  RESULTADOS: "resultados",
  COMUNICADOS: "comunicados",
};

export async function generateStaticParams() {
  const { news } = await getContentProvider().listAllSlugs();
  return news.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getContentProvider().getNews(slug);
  if (!post) return { title: "Notícia não encontrada" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/noticias/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: `${post.publishedAt}T12:00:00-03:00`,
      authors: [post.author],
      section: CATEGORY_LABEL[post.category],
      ...(post.imageUrl
        ? { images: [{ url: post.imageUrl, alt: post.imageAlt ?? post.title }] }
        : {}),
    },
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params;
  const content = getContentProvider();
  const post = await content.getNews(slug);
  if (!post) notFound();

  const [allNews, contest] = await Promise.all([
    content.listNews(),
    post.contestSlug ? content.getContest(post.contestSlug) : Promise.resolve(null),
  ]);
  const more = allNews.filter((item) => item.slug !== post.slug).slice(0, 3);

  const absoluteUrl = `${SITE_URL}/noticias/${post.slug}`;
  const shareText = `${post.title} — ${absoluteUrl}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const mailHref = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(
    `${post.excerpt}\n\n${absoluteUrl}`,
  )}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    datePublished: `${post.publishedAt}T12:00:00-03:00`,
    dateModified: `${post.publishedAt}T12:00:00-03:00`,
    articleSection: CATEGORY_LABEL[post.category],
    inLanguage: "pt-BR",
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl },
    url: absoluteUrl,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/selecon-logo-1280.png` },
    },
    ...(post.imageUrl ? { image: [post.imageUrl] } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <PageHeader
        eyebrow={CATEGORY_LABEL[post.category]}
        title={post.title}
        description={post.excerpt}
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Notícias", href: "/noticias" },
          {
            label: CATEGORY_LABEL[post.category],
            href: `/noticias?categoria=${CATEGORY_PARAM[post.category]}`,
          },
          { label: post.title },
        ]}
      >
        <p className="text-text-secondary flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span>
            Publicado em{" "}
            <time dateTime={post.publishedAt} className="text-text-primary font-medium">
              {formatLongDate(post.publishedAt)}
            </time>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Por <span className="text-text-primary font-medium">{post.author}</span>
          </span>
        </p>
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          <article className="min-w-0" aria-labelledby="artigo-title">
            <h2 id="artigo-title" className="sr-only">
              Texto da notícia
            </h2>
            {post.imageUrl ? (
              <figure className="border-border bg-surface mb-8 overflow-hidden rounded-lg border">
                <Image
                  src={post.imageUrl}
                  alt={post.imageAlt ?? ""}
                  width={1600}
                  height={900}
                  className="h-auto w-full"
                  sizes="(min-width: 1024px) 48rem, 100vw"
                />
                {post.imageAlt ? (
                  <figcaption className="text-text-secondary px-4 py-2 text-sm">
                    {post.imageAlt}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}

            <div className="prose-selecon text-text-primary max-w-3xl text-base">
              {post.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {post.contestSlug ? (
              <div className="border-action-blue bg-wash-blue mt-10 rounded-lg border-l-4 p-5">
                <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
                  Concurso relacionado
                </p>
                <p className="text-navy-primary mt-1 text-base font-bold">
                  {contest ? contest.title : "Página do concurso"}
                </p>
                <p className="text-text-secondary mt-1 text-sm">
                  Edital, cronograma, publicações oficiais e links de inscrição ficam na página do
                  concurso.
                </p>
                <Link
                  href={`/concursos/${post.contestSlug}`}
                  className={buttonClassNames("primary", "mt-4")}
                >
                  Ver página do concurso
                  <Icon name="arrow-right" size={16} />
                </Link>
              </div>
            ) : null}

            <section
              aria-labelledby="compartilhar-title"
              className="border-border mt-10 border-t pt-6"
            >
              <h2
                id="compartilhar-title"
                className="text-text-secondary text-sm font-semibold uppercase tracking-wide"
              >
                Compartilhar
              </h2>
              <ul className="mt-3 flex flex-wrap gap-3">
                <li>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClassNames("secondary")}
                  >
                    <Icon name="message-circle" size={18} />
                    WhatsApp
                    <Icon name="external-link" size={14} label="abre em nova aba" />
                  </a>
                </li>
                <li>
                  <a href={mailHref} className={buttonClassNames("secondary")}>
                    <Icon name="mail" size={18} />
                    E-mail
                  </a>
                </li>
              </ul>
              <p className="text-text-secondary mt-3 text-sm">
                Endereço desta notícia:{" "}
                <span className="text-text-primary break-all font-medium">{absoluteUrl}</span>
              </p>
            </section>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="mais-title">
            <h2
              id="mais-title"
              className="text-action-blue text-sm font-semibold uppercase tracking-wide"
            >
              Mais notícias
            </h2>
            <ul className="mt-3 space-y-4">
              {more.map((item) => (
                <li key={item.slug}>
                  <Card as="article" interactive className="relative">
                    <p className="text-action-blue text-xs font-semibold uppercase tracking-wide">
                      {CATEGORY_LABEL[item.category]}
                      {" · "}
                      <time dateTime={item.publishedAt}>{formatLongDate(item.publishedAt)}</time>
                    </p>
                    <h3 className="text-navy-primary mt-1.5 text-base font-bold leading-snug">
                      <Link
                        href={`/noticias/${item.slug}`}
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                      >
                        {item.title}
                      </Link>
                    </h3>
                  </Card>
                </li>
              ))}
            </ul>
            <Link href="/noticias" className={buttonClassNames("secondary", "mt-4 w-full")}>
              Todas as notícias
              <Icon name="arrow-right" size={16} />
            </Link>
          </aside>
        </div>
      </Container>
    </>
  );
}
