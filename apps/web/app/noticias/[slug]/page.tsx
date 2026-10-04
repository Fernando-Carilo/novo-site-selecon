import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { NewsPostDetail } from "@selecon/contracts";
import { fetchApiOrNull } from "@/lib/api-server";
import { PublicationBody } from "@/components/content/PublicationBody";

// Campos extras enviados pela Selecon Central (ausentes no apps/api local).
type NewsFromCentral = NewsPostDetail & { bodyFormat?: "TEXT" | "HTML" | null; coverUrl?: string | null };

async function getNews(slug: string): Promise<NewsFromCentral | null> {
  return fetchApiOrNull<NewsFromCentral>(`/public/content/news/${slug}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNews(slug);
  if (!post) return { title: "Notícia não encontrada | Instituto Selecon" };
  return { title: `${post.title} | Instituto Selecon` };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getNews(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {post.categoryName && (
        <p className="text-action-blue text-xs font-semibold uppercase tracking-wide">
          {post.categoryName}
        </p>
      )}
      <h1 className="text-navy-primary mt-1 text-3xl font-bold">{post.title}</h1>
      {post.publishedAt && (
        <p className="text-text-secondary mt-2 text-sm">
          {new Date(post.publishedAt).toLocaleDateString("pt-BR")}
        </p>
      )}
      {post.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- origem externa (Central/S3), sem domínio fixo para next/image
        <img src={post.coverUrl} alt="" className="mt-6 h-auto w-full rounded-lg" />
      )}
      <PublicationBody body={post.body} format={post.bodyFormat} />
    </article>
  );
}
