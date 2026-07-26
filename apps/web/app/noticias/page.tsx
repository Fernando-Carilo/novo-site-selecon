import Link from "next/link";
import type { Metadata } from "next";
import type { NewsPostSummary } from "@selecon/contracts";
import { fetchApi } from "@/lib/api-server";

export const metadata: Metadata = {
  title: "Notícias | Instituto Selecon",
  description: "Últimas notícias e comunicados do Instituto Selecon.",
};

export default async function NewsListPage() {
  const posts = await fetchApi<NewsPostSummary[]>("/public/content/news");

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-navy-primary text-3xl font-bold">Notícias</h1>

      {posts.length === 0 ? (
        <p className="text-text-secondary mt-8">Nenhuma notícia publicada no momento.</p>
      ) : (
        <ul className="mt-8 space-y-6">
          {posts.map((post) => (
            <li key={post.id} className="border-border border-b pb-6">
              {post.categoryName && (
                <p className="text-action-blue text-xs font-semibold uppercase tracking-wide">
                  {post.categoryName}
                </p>
              )}
              <h2 className="text-navy-primary mt-1 text-xl font-semibold">
                <Link href={`/noticias/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              {post.publishedAt && (
                <p className="text-text-secondary mt-1 text-sm">
                  {new Date(post.publishedAt).toLocaleDateString("pt-BR")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
