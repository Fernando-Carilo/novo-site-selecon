import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getNews } from "@/lib/central";
import { PublicationBody } from "@/components/content/PublicationBody";
import { ArrowRightIcon } from "@/components/icons";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNews(slug);
  if (!post) return { title: "Notícia não encontrada" };
  return {
    title: post.title,
    description: post.summary ?? undefined,
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      images: post.coverUrl ? [post.coverUrl] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: Params) {
  const { slug } = await params;
  const post = await getNews(slug);
  if (!post) notFound();
  const date = formatDate(post.publishedAt, { day: "2-digit", month: "long", year: "numeric" });

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <nav aria-label="Trilha" className="text-text-secondary text-sm">
        <Link
          href="/noticias"
          className="hover:text-action-blue underline-offset-4 hover:underline"
        >
          Notícias
        </Link>
        {post.contest?.slug ? (
          <>
            <span aria-hidden="true"> / </span>
            <Link
              href={`/concursos/${post.contest.slug}`}
              className="hover:text-action-blue underline-offset-4 hover:underline"
            >
              {post.contest.name}
            </Link>
          </>
        ) : null}
      </nav>
      <div className="text-text-secondary mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {post.categoryName ? (
          <span className="bg-action-blue/10 text-action-blue rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide">
            {post.categoryName}
          </span>
        ) : null}
        {date ? <time dateTime={post.publishedAt ?? undefined}>{date}</time> : null}
      </div>
      <h1 className="text-navy-primary mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {post.title}
      </h1>
      {post.summary ? (
        <p className="text-text-secondary mt-4 text-lg leading-relaxed">{post.summary}</p>
      ) : null}
      {post.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- origem externa (Central/S3)
        <img src={post.coverUrl} alt="" className="mt-8 h-auto w-full rounded-xl" />
      ) : null}
      <PublicationBody body={post.body} format={post.bodyFormat} />
      {post.contest?.slug ? (
        <p className="mt-10">
          <Link
            href={`/concursos/${post.contest.slug}`}
            className="text-action-blue inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
          >
            Página do concurso {post.contest.name}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </p>
      ) : null}
    </article>
  );
}
