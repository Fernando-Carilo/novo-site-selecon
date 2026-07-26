import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { ContentPageDetail, NewsPostDetail, NewsPostSummary } from "@selecon/contracts";
import { Public } from "../auth/public.decorator.js";
import { ContentService } from "./content.service.js";

@ApiTags("public-content")
@Controller("public/content")
@Public()
export class PublicContentController {
  constructor(private readonly content: ContentService) {}

  @Get("pages/:slug")
  getPage(@Param("slug") slug: string): Promise<ContentPageDetail> {
    return this.content.getPublishedPageBySlug(slug);
  }

  @Get("news")
  listNews(): Promise<NewsPostSummary[]> {
    return this.content.listNewsPublic();
  }

  @Get("news/:slug")
  getNews(@Param("slug") slug: string): Promise<NewsPostDetail> {
    return this.content.getPublishedNewsBySlug(slug);
  }
}
