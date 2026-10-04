import Link from "next/link";
import { listNews } from "@/lib/central";
import { NewsCard } from "@/components/content/NewsCard";
import { ArrowRightIcon } from "@/components/icons";

/** Últimas notícias publicadas na Selecon Central. Sem notícias, a seção não aparece. */
export async function LatestNews() {
  const posts = (await listNews(3)).slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="latest-news-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-action-blue text-xs font-semibold uppercase tracking-[0.12em]">
            Publicações
          </p>
          <h2
            id="latest-news-title"
            className="text-navy-primary mt-2 text-3xl font-bold tracking-tight"
          >
            Últimas notícias
          </h2>
        </div>
        <Link
          href="/noticias"
          className="text-navy-primary hover:text-action-blue inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
        >
          Todas as notícias
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <li key={p.id}>
            <NewsCard post={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
