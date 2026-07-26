import type { MetadataRoute } from "next";
import type { ContestSummary, NewsPostSummary } from "@selecon/contracts";
import { fetchApi } from "@/lib/api-server";

const STATIC_ROUTES = [
  "",
  "/concursos",
  "/noticias",
  "/atendimento",
  "/denuncias",
  "/politica-de-privacidade",
  "/termos-de-uso",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [contests, news] = await Promise.all([
    fetchApi<ContestSummary[]>("/public/contests").catch(() => []),
    fetchApi<NewsPostSummary[]>("/public/content/news").catch(() => []),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const contestEntries: MetadataRoute.Sitemap = contests.map((contest) => ({
    url: `${siteUrl}/concursos/${contest.slug}`,
    lastModified: new Date(contest.updatedAt),
  }));

  const newsEntries: MetadataRoute.Sitemap = news.map((post) => ({
    url: `${siteUrl}/noticias/${post.slug}`,
    lastModified: new Date(post.updatedAt),
  }));

  return [...staticEntries, ...contestEntries, ...newsEntries];
}
