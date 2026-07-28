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
    <>
      {/* Hero */}
      <section
        className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 py-16 sm:py-20"
        aria-label="Notícias"
      >
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto text-center">
          <p className="text-[13px] font-black uppercase tracking-wider text-green">
            Publicações
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Notícias e Comunicados
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
            Acompanhe as últimas novidades, comunicados oficiais e atualizações do Instituto
            Selecon.
          </p>
        </div>
      </section>

      {/* Listing */}
      <section className="bg-white py-16 sm:py-[92px]" aria-labelledby="news-listing">
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto">
          <h2 id="news-listing" className="sr-only">
            Lista de notícias
          </h2>

          {posts.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma notícia publicada no momento.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-lg border border-line bg-white p-5 transition-all duration-base hover:-translate-y-1 hover:border-green/40 hover:shadow-md"
                >
                  {post.categoryName && (
                    <span className="inline-block rounded-sm bg-green/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-green-700">
                      {post.categoryName}
                    </span>
                  )}
                  <h3 className="mt-2 text-base font-bold text-ink">
                    <Link href={`/noticias/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  {post.publishedAt && (
                    <p className="mt-2 text-xs text-muted">
                      {new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
