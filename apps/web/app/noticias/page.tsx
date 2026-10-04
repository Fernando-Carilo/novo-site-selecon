import type { Metadata } from "next";
import { listNews, isCentralConfigured } from "@/lib/central";
import { NewsCard } from "@/components/content/NewsCard";
import { EmptyState, SectionIntro } from "@/components/content/EmptyState";

export const metadata: Metadata = {
  title: "Notícias e comunicados",
  description:
    "Comunicados oficiais do Instituto Selecon sobre editais, inscrições, provas e resultados.",
};

export default async function NewsListPage() {
  const posts = await listNews(100);

  return (
    <section aria-labelledby="news-title" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <SectionIntro
        id="news-title"
        eyebrow="Publicações"
        title="Notícias e comunicados"
        description="Comunicados oficiais sobre editais, inscrições, provas, gabaritos e resultados dos concursos organizados pelo Instituto Selecon."
      />
      <div className="mt-12">
        {posts.length === 0 ? (
          <EmptyState
            title={
              isCentralConfigured()
                ? "Nenhuma notícia publicada"
                : "Notícias indisponíveis no momento"
            }
            description={
              isCentralConfigured()
                ? "Assim que houver um comunicado oficial, ele aparece aqui."
                : "A fonte de conteúdo do portal não está configurada neste ambiente."
            }
          />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <NewsCard post={post} headingLevel="h2" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
