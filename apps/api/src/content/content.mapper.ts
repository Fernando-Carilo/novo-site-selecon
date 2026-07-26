import type { ContentPage, NewsPost, Category } from "@selecon/db";
import type {
  ContentPageDetail,
  ContentPageSummary,
  NewsPostDetail,
  NewsPostSummary,
} from "@selecon/contracts";

function bodyToText(body: unknown): string {
  if (body && typeof body === "object" && "text" in body && typeof body.text === "string") {
    return body.text;
  }
  return "";
}

export function toContentPageSummary(page: ContentPage): ContentPageSummary {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    status: page.status,
    updatedAt: page.updatedAt.toISOString(),
  };
}

export function toContentPageDetail(
  page: ContentPage & { revisions: { body: unknown }[] },
): ContentPageDetail {
  const latestRevision = page.revisions[page.revisions.length - 1];
  return {
    ...toContentPageSummary(page),
    body: latestRevision ? bodyToText(latestRevision.body) : "",
    publishedAt: page.publishedAt?.toISOString() ?? null,
  };
}

type NewsPostWithCategory = NewsPost & { category: Category | null };

export function toNewsPostSummary(post: NewsPostWithCategory): NewsPostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    status: post.status,
    categoryName: post.category?.name ?? null,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    updatedAt: post.updatedAt.toISOString(),
  };
}

export function toNewsPostDetail(post: NewsPostWithCategory): NewsPostDetail {
  return { ...toNewsPostSummary(post), body: bodyToText(post.body) };
}
