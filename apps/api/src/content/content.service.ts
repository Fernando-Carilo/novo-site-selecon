import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  ContentPageDetail,
  ContentPageSummary,
  CreateContentPageRequest,
  CreateNewsPostRequest,
  NewsCategoryDto,
  NewsPostDetail,
  NewsPostSummary,
  UpdateContentPageRequest,
  UpdateNewsPostRequest,
} from "@selecon/contracts";
import { prisma, type ContentStatus } from "@selecon/db";
import { AuditService } from "../audit/audit.service.js";
import {
  toContentPageDetail,
  toContentPageSummary,
  toNewsPostDetail,
  toNewsPostSummary,
} from "./content.mapper.js";

const EDITABLE_STATUSES: ContentStatus[] = ["DRAFT", "IN_REVIEW"];
const NEWS_INCLUDE = { category: true } as const;

@Injectable()
export class ContentService {
  constructor(private readonly audit: AuditService) {}

  // --- Páginas institucionais ---

  async listPages(): Promise<ContentPageSummary[]> {
    const pages = await prisma.contentPage.findMany({ orderBy: { updatedAt: "desc" } });
    return pages.map(toContentPageSummary);
  }

  async getPageOrThrow(id: string) {
    const page = await prisma.contentPage.findUnique({
      where: { id },
      include: { revisions: { orderBy: { createdAt: "asc" } } },
    });
    if (!page) throw new NotFoundException("Página não encontrada");
    return page;
  }

  async getPage(id: string): Promise<ContentPageDetail> {
    return toContentPageDetail(await this.getPageOrThrow(id));
  }

  async getPublishedPageBySlug(slug: string): Promise<ContentPageDetail> {
    const page = await prisma.contentPage.findUnique({
      where: { slug },
      include: { revisions: { orderBy: { createdAt: "asc" } } },
    });
    if (!page || page.status !== "PUBLISHED") {
      throw new NotFoundException("Página não encontrada");
    }
    return toContentPageDetail(page);
  }

  async createPage(
    input: CreateContentPageRequest,
    actorUserId: string,
  ): Promise<ContentPageDetail> {
    const existing = await prisma.contentPage.findUnique({ where: { slug: input.slug } });
    if (existing) throw new ConflictException("Já existe uma página com este slug");

    const page = await prisma.contentPage.create({
      data: {
        slug: input.slug,
        title: input.title,
        status: "DRAFT",
        createdByUserId: actorUserId,
        revisions: { create: { body: { text: input.body }, authorUserId: actorUserId } },
      },
      include: { revisions: true },
    });

    await this.audit.log({
      actorUserId,
      action: "CONTENT_PAGE_CREATED",
      resourceType: "content_page",
      resourceId: page.id,
    });

    return toContentPageDetail(page);
  }

  async updatePage(
    id: string,
    input: UpdateContentPageRequest,
    actorUserId: string,
  ): Promise<ContentPageDetail> {
    const existing = await this.getPageOrThrow(id);
    if (!EDITABLE_STATUSES.includes(existing.status)) {
      throw new BadRequestException(
        "Páginas publicadas não podem ser editadas diretamente — despublique antes de editar",
      );
    }

    const page = await prisma.contentPage.update({
      where: { id },
      data: {
        title: input.title,
        revisions: { create: { body: { text: input.body }, authorUserId: actorUserId } },
      },
      include: { revisions: { orderBy: { createdAt: "asc" } } },
    });

    await this.audit.log({
      actorUserId,
      action: "CONTENT_PAGE_UPDATED",
      resourceType: "content_page",
      resourceId: id,
    });

    return toContentPageDetail(page);
  }

  async submitPageForReview(id: string, actorUserId: string): Promise<ContentPageDetail> {
    const existing = await this.getPageOrThrow(id);
    if (existing.status !== "DRAFT") {
      throw new BadRequestException("Somente rascunhos podem ser enviados para revisão");
    }
    const page = await prisma.contentPage.update({
      where: { id },
      data: { status: "IN_REVIEW" },
      include: { revisions: { orderBy: { createdAt: "asc" } } },
    });
    await this.audit.log({
      actorUserId,
      action: "CONTENT_PAGE_SUBMITTED_FOR_REVIEW",
      resourceType: "content_page",
      resourceId: id,
    });
    return toContentPageDetail(page);
  }

  async publishPage(id: string, actorUserId: string): Promise<ContentPageDetail> {
    const existing = await this.getPageOrThrow(id);
    if (!["DRAFT", "IN_REVIEW"].includes(existing.status)) {
      throw new BadRequestException("Página não está em um estado publicável");
    }
    const page = await prisma.contentPage.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
      include: { revisions: { orderBy: { createdAt: "asc" } } },
    });
    await this.audit.log({
      actorUserId,
      action: "CONTENT_PAGE_PUBLISHED",
      resourceType: "content_page",
      resourceId: id,
      riskLevel: "medium",
    });
    return toContentPageDetail(page);
  }

  async unpublishPage(id: string, actorUserId: string): Promise<ContentPageDetail> {
    const existing = await this.getPageOrThrow(id);
    if (existing.status !== "PUBLISHED") {
      throw new BadRequestException("Somente páginas publicadas podem ser despublicadas");
    }
    const page = await prisma.contentPage.update({
      where: { id },
      data: { status: "UNPUBLISHED" },
      include: { revisions: { orderBy: { createdAt: "asc" } } },
    });
    await this.audit.log({
      actorUserId,
      action: "CONTENT_PAGE_UNPUBLISHED",
      resourceType: "content_page",
      resourceId: id,
    });
    return toContentPageDetail(page);
  }

  // --- Notícias ---

  async listCategories(): Promise<NewsCategoryDto[]> {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
  }

  async listNewsAdmin(): Promise<NewsPostSummary[]> {
    const posts = await prisma.newsPost.findMany({
      include: NEWS_INCLUDE,
      orderBy: { updatedAt: "desc" },
    });
    return posts.map(toNewsPostSummary);
  }

  async listNewsPublic(): Promise<NewsPostSummary[]> {
    const posts = await prisma.newsPost.findMany({
      where: { status: "PUBLISHED" },
      include: NEWS_INCLUDE,
      orderBy: { publishedAt: "desc" },
    });
    return posts.map(toNewsPostSummary);
  }

  async getNewsOrThrow(id: string) {
    const post = await prisma.newsPost.findUnique({ where: { id }, include: NEWS_INCLUDE });
    if (!post) throw new NotFoundException("Notícia não encontrada");
    return post;
  }

  async getNewsAdmin(id: string): Promise<NewsPostDetail> {
    return toNewsPostDetail(await this.getNewsOrThrow(id));
  }

  async getPublishedNewsBySlug(slug: string): Promise<NewsPostDetail> {
    const post = await prisma.newsPost.findUnique({ where: { slug }, include: NEWS_INCLUDE });
    if (!post || post.status !== "PUBLISHED") {
      throw new NotFoundException("Notícia não encontrada");
    }
    return toNewsPostDetail(post);
  }

  async createNews(input: CreateNewsPostRequest, actorUserId: string): Promise<NewsPostDetail> {
    const existing = await prisma.newsPost.findUnique({ where: { slug: input.slug } });
    if (existing) throw new ConflictException("Já existe uma notícia com este slug");

    const post = await prisma.newsPost.create({
      data: {
        slug: input.slug,
        title: input.title,
        body: { text: input.body },
        categoryId: input.categoryId,
        authorUserId: actorUserId,
        status: "DRAFT",
      },
      include: NEWS_INCLUDE,
    });

    await this.audit.log({
      actorUserId,
      action: "NEWS_CREATED",
      resourceType: "news_post",
      resourceId: post.id,
    });

    return toNewsPostDetail(post);
  }

  async updateNews(
    id: string,
    input: UpdateNewsPostRequest,
    actorUserId: string,
  ): Promise<NewsPostDetail> {
    const existing = await this.getNewsOrThrow(id);
    if (!EDITABLE_STATUSES.includes(existing.status)) {
      throw new BadRequestException(
        "Notícias publicadas não podem ser editadas diretamente — despublique antes de editar",
      );
    }

    const post = await prisma.newsPost.update({
      where: { id },
      data: { title: input.title, body: { text: input.body }, categoryId: input.categoryId },
      include: NEWS_INCLUDE,
    });

    await this.audit.log({
      actorUserId,
      action: "NEWS_UPDATED",
      resourceType: "news_post",
      resourceId: id,
    });

    return toNewsPostDetail(post);
  }

  async submitNewsForReview(id: string, actorUserId: string): Promise<NewsPostDetail> {
    const existing = await this.getNewsOrThrow(id);
    if (existing.status !== "DRAFT") {
      throw new BadRequestException("Somente rascunhos podem ser enviados para revisão");
    }
    const post = await prisma.newsPost.update({
      where: { id },
      data: { status: "IN_REVIEW" },
      include: NEWS_INCLUDE,
    });
    await this.audit.log({
      actorUserId,
      action: "NEWS_SUBMITTED_FOR_REVIEW",
      resourceType: "news_post",
      resourceId: id,
    });
    return toNewsPostDetail(post);
  }

  async publishNews(id: string, actorUserId: string): Promise<NewsPostDetail> {
    const existing = await this.getNewsOrThrow(id);
    if (!["DRAFT", "IN_REVIEW"].includes(existing.status)) {
      throw new BadRequestException("Notícia não está em um estado publicável");
    }
    const post = await prisma.newsPost.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date(), reviewerUserId: actorUserId },
      include: NEWS_INCLUDE,
    });
    await this.audit.log({
      actorUserId,
      action: "NEWS_PUBLISHED",
      resourceType: "news_post",
      resourceId: id,
      riskLevel: "medium",
    });
    return toNewsPostDetail(post);
  }

  async unpublishNews(id: string, actorUserId: string): Promise<NewsPostDetail> {
    const existing = await this.getNewsOrThrow(id);
    if (existing.status !== "PUBLISHED") {
      throw new BadRequestException("Somente notícias publicadas podem ser despublicadas");
    }
    const post = await prisma.newsPost.update({
      where: { id },
      data: { status: "UNPUBLISHED" },
      include: NEWS_INCLUDE,
    });
    await this.audit.log({
      actorUserId,
      action: "NEWS_UNPUBLISHED",
      resourceType: "news_post",
      resourceId: id,
    });
    return toNewsPostDetail(post);
  }
}
