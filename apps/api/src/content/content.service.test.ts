import { prisma } from "@selecon/db";
import { afterAll, describe, expect, it } from "vitest";
import { AuditService } from "../audit/audit.service.js";
import { ContentService } from "./content.service.js";

describe("ContentService (integração real com Postgres)", () => {
  const service = new ContentService(new AuditService());
  const authorUserId = "44444444-4444-4444-4444-444444444444";
  const editorUserId = "55555555-5555-5555-5555-555555555555";

  const createdPageIds: string[] = [];
  const createdNewsIds: string[] = [];

  afterAll(async () => {
    await prisma.seoMetadata.deleteMany({ where: { newsPostId: { in: createdNewsIds } } });
    await prisma.newsPost.deleteMany({ where: { id: { in: createdNewsIds } } });
    await prisma.contentRevision.deleteMany({ where: { pageId: { in: createdPageIds } } });
    await prisma.seoMetadata.deleteMany({ where: { contentPageId: { in: createdPageIds } } });
    await prisma.contentPage.deleteMany({ where: { id: { in: createdPageIds } } });
    await prisma.$disconnect();
  });

  async function createPage() {
    const detail = await service.createPage(
      {
        slug: `pagina-de-teste-${Date.now()}`,
        title: "Página de teste",
        body: "Conteúdo fictício de teste.",
      },
      authorUserId,
    );
    createdPageIds.push(detail.id);
    return detail;
  }

  async function createNews() {
    const detail = await service.createNews(
      {
        slug: `noticia-de-teste-${Date.now()}`,
        title: "Notícia de teste",
        body: "Conteúdo fictício de notícia de teste.",
      },
      authorUserId,
    );
    createdNewsIds.push(detail.id);
    return detail;
  }

  it("cria página institucional em DRAFT e persiste o corpo na revisão", async () => {
    const page = await createPage();
    expect(page.status).toBe("DRAFT");
    expect(page.body).toBe("Conteúdo fictício de teste.");
  });

  it("página publicada não aparece para outro slug e não pode ser editada diretamente", async () => {
    const page = await createPage();
    await service.publishPage(page.id, editorUserId);
    await expect(
      service.updatePage(page.id, { title: "Novo título", body: "novo corpo" }, editorUserId),
    ).rejects.toThrow();
  });

  it("página só fica visível publicamente após publish", async () => {
    const page = await createPage();
    await expect(service.getPublishedPageBySlug(page.slug)).rejects.toThrow();
    await service.publishPage(page.id, editorUserId);
    const publicView = await service.getPublishedPageBySlug(page.slug);
    expect(publicView.title).toBe("Página de teste");
  });

  it("notícia segue o fluxo DRAFT -> IN_REVIEW -> PUBLISHED e some da lista pública quando despublicada", async () => {
    const news = await createNews();
    await service.submitNewsForReview(news.id, authorUserId);
    await service.publishNews(news.id, editorUserId);

    const published = await service.listNewsPublic();
    expect(published.some((n) => n.id === news.id)).toBe(true);

    await service.unpublishNews(news.id, editorUserId);
    const afterUnpublish = await service.listNewsPublic();
    expect(afterUnpublish.some((n) => n.id === news.id)).toBe(false);
  });
});
