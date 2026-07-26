import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  createContentPageRequestSchema,
  createNewsPostRequestSchema,
  updateContentPageRequestSchema,
  updateNewsPostRequestSchema,
  type ContentPageDetail,
  type ContentPageSummary,
  type CreateContentPageRequest,
  type CreateNewsPostRequest,
  type NewsCategoryDto,
  type NewsPostDetail,
  type NewsPostSummary,
  type UpdateContentPageRequest,
  type UpdateNewsPostRequest,
} from "@selecon/contracts";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/authenticated-user.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { ContentService } from "./content.service.js";

@ApiTags("admin-content")
@Controller("admin/content")
export class AdminContentController {
  constructor(private readonly content: ContentService) {}

  @Get("pages")
  @RequirePermission("content:read")
  listPages(): Promise<ContentPageSummary[]> {
    return this.content.listPages();
  }

  @Get("pages/:id")
  @RequirePermission("content:read")
  getPage(@Param("id") id: string): Promise<ContentPageDetail> {
    return this.content.getPage(id);
  }

  @Post("pages")
  @RequirePermission("content:write")
  createPage(
    @Body(new ZodValidationPipe(createContentPageRequestSchema)) body: CreateContentPageRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContentPageDetail> {
    return this.content.createPage(body, user.id);
  }

  @Post("pages/:id")
  @RequirePermission("content:write")
  updatePage(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateContentPageRequestSchema)) body: UpdateContentPageRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContentPageDetail> {
    return this.content.updatePage(id, body, user.id);
  }

  @Post("pages/:id/submit-for-review")
  @RequirePermission("content:write")
  submitPageForReview(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContentPageDetail> {
    return this.content.submitPageForReview(id, user.id);
  }

  @Post("pages/:id/publish")
  @RequirePermission("content:publish")
  publishPage(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContentPageDetail> {
    return this.content.publishPage(id, user.id);
  }

  @Post("pages/:id/unpublish")
  @RequirePermission("content:publish")
  unpublishPage(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContentPageDetail> {
    return this.content.unpublishPage(id, user.id);
  }

  @Get("news/categories")
  @RequirePermission("content:read")
  listCategories(): Promise<NewsCategoryDto[]> {
    return this.content.listCategories();
  }

  @Get("news")
  @RequirePermission("content:read")
  listNews(): Promise<NewsPostSummary[]> {
    return this.content.listNewsAdmin();
  }

  @Get("news/:id")
  @RequirePermission("content:read")
  getNews(@Param("id") id: string): Promise<NewsPostDetail> {
    return this.content.getNewsAdmin(id);
  }

  @Post("news")
  @RequirePermission("content:write")
  createNews(
    @Body(new ZodValidationPipe(createNewsPostRequestSchema)) body: CreateNewsPostRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NewsPostDetail> {
    return this.content.createNews(body, user.id);
  }

  @Post("news/:id")
  @RequirePermission("content:write")
  updateNews(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateNewsPostRequestSchema)) body: UpdateNewsPostRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NewsPostDetail> {
    return this.content.updateNews(id, body, user.id);
  }

  @Post("news/:id/submit-for-review")
  @RequirePermission("content:write")
  submitNewsForReview(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NewsPostDetail> {
    return this.content.submitNewsForReview(id, user.id);
  }

  @Post("news/:id/publish")
  @RequirePermission("content:publish")
  publishNews(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NewsPostDetail> {
    return this.content.publishNews(id, user.id);
  }

  @Post("news/:id/unpublish")
  @RequirePermission("content:publish")
  unpublishNews(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NewsPostDetail> {
    return this.content.unpublishNews(id, user.id);
  }
}
