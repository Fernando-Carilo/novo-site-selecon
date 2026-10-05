import type { MetadataRoute } from "next";
import { getContentProvider } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

/** Rotas públicas estáticas do portal (mantenha em sincronia com `lib/site.ts`). */
export const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/concursos", priority: 0.9, changeFrequency: "daily" },
  { path: "/candidato", priority: 0.8, changeFrequency: "monthly" },
  { path: "/atendimento", priority: 0.8, changeFrequency: "monthly" },
  { path: "/fale-conosco", priority: 0.7, changeFrequency: "monthly" },
  { path: "/integridade", priority: 0.7, changeFrequency: "monthly" },
  { path: "/instituto", priority: 0.7, changeFrequency: "monthly" },
  { path: "/servicos", priority: 0.7, changeFrequency: "monthly" },
  { path: "/comercial", priority: 0.7, changeFrequency: "monthly" },
  { path: "/noticias", priority: 0.7, changeFrequency: "weekly" },
  { path: "/transparencia", priority: 0.5, changeFrequency: "monthly" },
  { path: "/imprensa", priority: 0.5, changeFrequency: "monthly" },
  { path: "/trabalhe-conosco", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacidade", priority: 0.3, changeFrequency: "yearly" },
  { path: "/acessibilidade", priority: 0.3, changeFrequency: "yearly" },
  { path: "/mapa-do-site", priority: 0.3, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = getContentProvider();
  const [slugs, catalog, news] = await Promise.all([
    content.listAllSlugs(),
    content.listContests({ status: "TODOS", page: 1 }),
    content.listNews(),
  ]);
  const now = new Date();

  const contestEntries = await Promise.all(
    slugs.contests.map(async (slug) => {
      const contest = await content.getContest(slug);
      return {
        url: `${SITE_URL}/concursos/${slug}`,
        lastModified: contest ? new Date(`${contest.updatedAt}T12:00:00-03:00`) : now,
        changeFrequency: (contest?.status === "ENCERRADO" ? "yearly" : "weekly") as "yearly" | "weekly",
        priority: contest?.status === "INSCRICOES_ABERTAS" ? 0.9 : contest?.status === "ENCERRADO" ? 0.3 : 0.6,
      };
    }),
  );

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...contestEntries,
    ...slugs.services.map((slug) => ({
      url: `${SITE_URL}/servicos/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...news.map((post) => ({
      url: `${SITE_URL}/noticias/${post.slug}`,
      lastModified: new Date(`${post.publishedAt}T12:00:00-03:00`),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ].filter((entry, index, all) => all.findIndex((other) => other.url === entry.url) === index && catalog.total >= 0);
}
